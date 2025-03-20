from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
import os
import json
import traceback
import time

app = Flask(__name__, static_folder='build', static_url_path='/')
CORS(app)

API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
HEADERS = {"Authorization": "Bearer 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"}

def query_huggingface(payload, max_retries=3, initial_wait=2):
    """Query Hugging Face API with retry mechanism"""
    for attempt in range(max_retries):
        try:
            response = requests.post(API_URL, headers=HEADERS, json=payload, timeout=90)
            
            if response.status_code == 200:
                return response, None
            
            # Handle specific error cases
            if response.status_code == 503:
                error_msg = "Model is loading, please try again in a few seconds"
                wait_time = initial_wait * (attempt + 1)  # Exponential backoff
                print(f"Model loading, waiting {wait_time} seconds...")
                time.sleep(wait_time)
                continue
                
            try:
                error_data = response.json()
                error_msg = str(error_data.get('error', 'Unknown error'))
            except:
                error_msg = response.text[:200]
                
            return response, error_msg
            
        except requests.exceptions.Timeout:
            error_msg = "Request timed out. The model is taking too long to respond."
            if attempt == max_retries - 1:  # Last attempt
                return None, error_msg
            time.sleep(initial_wait * (attempt + 1))
        except Exception as e:
            error_msg = str(e)
            if attempt == max_retries - 1:  # Last attempt
                return None, f"Failed after {max_retries} attempts: {error_msg}"
            time.sleep(initial_wait * (attempt + 1))
    
    return None, f"Failed after {max_retries} attempts"

@app.route('/')
def serve():
    return app.send_static_file('index.html')

@app.route('/generate', methods=['POST'])
def generate_image():
    try:
        print("Received generate request")
        
        data = request.get_json()
        if not data:
            print("No JSON data received")
            return jsonify({'error': 'No data provided'}), 400
            
        if 'prompt' not in data:
            print("No prompt in data")
            return jsonify({'error': 'No prompt provided'}), 400
        
        prompt = data['prompt']
        quality = data.get('quality', 'standard')
        
        print(f"Processing request - Prompt: {prompt}, Quality: {quality}")

        # Define parameters based on quality
        if quality == 'high':
            params = {
                "inputs": prompt,
                "parameters": {
                    "num_inference_steps": 40,
                    "guidance_scale": 7.5,
                    "width": 1024,
                    "height": 1024,
                    "negative_prompt": "blurry, bad quality, distorted, disfigured, poor details"
                }
            }
        else:  # standard quality
            params = {
                "inputs": prompt,
                "parameters": {
                    "num_inference_steps": 25,
                    "guidance_scale": 7.0,
                    "width": 768,
                    "height": 768,
                    "negative_prompt": "blurry, bad quality, distorted"
                }
            }
        
        print("Sending request to Hugging Face API")
        response, error_msg = query_huggingface(params)
        
        if response and response.status_code == 200:
            try:
                os.makedirs('images', exist_ok=True)
                image_path = os.path.join('images', 'generated_image.png')
                
                with open(image_path, "wb") as f:
                    f.write(response.content)
                print("Image saved successfully")
                return jsonify({
                    'success': True, 
                    'message': 'Image generated successfully'
                })
            except Exception as e:
                print(f"Error saving image: {str(e)}")
                return jsonify({
                    'error': 'Failed to save image'
                }), 500
        else:
            error_message = error_msg or "Unknown error occurred"
            print(f"API Error: {error_message}")
            return jsonify({
                'error': error_message,
                'retry': response.status_code == 503 if response else False
            }), response.status_code if response else 500
            
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        print("Traceback:")
        print(traceback.format_exc())
        return jsonify({'error': f"Server error: {str(e)}"}), 500

@app.route('/generated_image.png')
def serve_image():
    try:
        image_path = os.path.join('images', 'generated_image.png')
        if os.path.exists(image_path):
            return send_file(image_path, mimetype='image/png')
        else:
            print("Image file not found")
            return jsonify({'error': 'Image not found'}), 404
    except Exception as e:
        print(f"Error serving image: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Ensure the images directory exists
    os.makedirs('images', exist_ok=True)
    app.run(debug=True)
