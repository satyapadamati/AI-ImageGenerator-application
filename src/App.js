import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

// API endpoint configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [quality, setQuality] = useState('standard');
  const [retryCount, setRetryCount] = useState(0);
  const [particles, setParticles] = useState([]);
  const MAX_RETRIES = 3;

  // Generate random particles for the background
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
      color: ['neon-pink', 'neon-blue', 'neon-purple'][Math.floor(Math.random() * 3)]
    }));
    setParticles(newParticles);
  }, []);

  const generateImage = async (isRetry = false) => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    if (!isRetry) {
      setLoading(true);
      setError(null);
      setShowSuccessMessage(false);
      setImageUrl(null);
      setRetryCount(0);
    }
    
    try {
      console.log('Sending request with:', { prompt, quality });
      const response = await axios.post(`${API_URL}/generate`, { 
        prompt: prompt,
        quality: quality
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 120000 // 2 minute timeout
      });
      
      console.log('Response:', response.data);
      
      if (response.data.success) {
        setImageUrl(`${API_URL}/generated_image.png?t=${new Date().getTime()}`);
        setShowSuccessMessage(true);
        setRetryCount(0);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } else {
        throw new Error(response.data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Error details:', err);
      let errorMessage = '';
      let shouldRetry = false;
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'The request took too long to complete. Please try again with standard quality or a simpler prompt.';
      } else if (err.response) {
        console.error('Error response:', err.response.data);
        errorMessage = err.response.data.error || err.response.statusText;
        shouldRetry = err.response.status === 503 || err.response.data.retry;
      } else if (err.request) {
        console.error('Error request:', err.request);
        errorMessage = 'No response from server. Please try again.';
      } else {
        console.error('Error message:', err.message);
        errorMessage = err.message;
      }
      
      if (shouldRetry && retryCount < MAX_RETRIES) {
        const nextRetry = retryCount + 1;
        setRetryCount(nextRetry);
        setError(`Model is loading, retrying automatically... (Attempt ${nextRetry}/${MAX_RETRIES})`);
        setTimeout(() => generateImage(true), 3000);
      } else {
        setError(errorMessage);
      }
    } finally {
      if (!isRetry) {
        setLoading(false);
      }
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'generated-image.png';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download image. Please try again.');
    }
  };

  const promptSuggestions = [
    "A cyberpunk cityscape at night with neon lights",
    "A futuristic robot with glowing elements",
    "A neon-lit street scene in the rain",
    "A digital abstract artwork with vibrant colors",
    "A sci-fi portal with energy effects"
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-dark-900">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-gradient-radial from-dark-800 to-dark-900">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute rounded-full bg-${particle.color} animate-float`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              filter: 'blur(1px)',
              animation: `float ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
              opacity: 0.3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink animate-gradient-shift mb-4">
              AI Image Generator
            </h1>
            <p className="text-gray-400 animate-fade-in">
              Transform your imagination into stunning visuals
            </p>
          </div>

          <div className="bg-dark-800/50 backdrop-blur-lg rounded-2xl shadow-neon p-8 mb-8 transform transition-all duration-500 hover:shadow-neon-hover">
            <div className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Describe your image in detail
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Be specific about details, style, lighting, and composition..."
                  className="w-full h-32 p-4 border border-dark-600 rounded-xl focus:ring-2 focus:ring-neon-purple focus:border-transparent resize-none bg-dark-700/50 backdrop-blur-sm transition-all duration-300 text-gray-200 placeholder-gray-500"
                  disabled={loading}
                />
                <div className="absolute bottom-3 right-3 text-gray-500 text-sm">
                  {prompt.length}/500
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Example prompts:
                </label>
                <div className="flex flex-wrap gap-2">
                  {promptSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(suggestion)}
                      className="text-xs bg-dark-700/50 text-neon-purple px-3 py-1.5 rounded-full hover:bg-dark-600/50 transition-colors border border-neon-purple/30 hover:border-neon-purple shadow-neon"
                    >
                      {suggestion.length > 50 ? suggestion.substring(0, 50) + '...' : suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Image Quality
                </label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="standard"
                      checked={quality === 'standard'}
                      onChange={(e) => setQuality(e.target.value)}
                      className="form-radio text-neon-purple focus:ring-neon-purple"
                    />
                    <span className="ml-2 text-gray-300">Standard (Faster)</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="high"
                      checked={quality === 'high'}
                      onChange={(e) => setQuality(e.target.value)}
                      className="form-radio text-neon-purple focus:ring-neon-purple"
                    />
                    <span className="ml-2 text-gray-300">High Quality (Slower)</span>
                  </label>
                </div>
              </div>
              
              {error && (
                <div className={`text-sm p-3 rounded-lg ${
                  error.includes('retrying automatically') 
                    ? 'bg-dark-700/50 text-neon-blue border border-neon-blue/30'
                    : 'bg-dark-700/50 text-neon-pink border border-neon-pink/30 animate-shake'
                }`}>
                  {error}
                </div>
              )}

              {showSuccessMessage && (
                <div className="text-neon-purple text-sm bg-dark-700/50 p-3 rounded-lg animate-fade-in border border-neon-purple/30">
                  Image generated successfully!
                </div>
              )}

              <button
                onClick={() => generateImage(false)}
                disabled={loading}
                className={`w-full py-4 px-6 rounded-xl text-white font-medium transform transition-all duration-300 ${
                  loading 
                    ? 'bg-dark-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink hover:scale-[1.02] hover:shadow-neon-strong active:scale-[0.98] animate-gradient-shift bg-[length:200%_200%]'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {retryCount > 0 
                      ? `Retrying... (Attempt ${retryCount}/${MAX_RETRIES})`
                      : quality === 'high' 
                        ? 'Creating your masterpiece (this may take a minute)...' 
                        : 'Creating your masterpiece...'}
                  </span>
                ) : (
                  'Generate Image'
                )}
              </button>
            </div>
          </div>

          {imageUrl && (
            <div className="bg-dark-800/50 backdrop-blur-lg rounded-2xl shadow-neon p-8 animate-fade-in transform transition-all duration-500 hover:shadow-neon-hover">
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-200">Your Generated Image</h2>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-lg hover:opacity-90 transform transition-all duration-300 hover:scale-105 flex items-center gap-2 hover:shadow-neon"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                </div>
                <div className="relative aspect-square w-full overflow-hidden rounded-xl transform transition-all duration-500 hover:scale-[1.02] shadow-neon">
                  <img
                    src={imageUrl}
                    alt="Generated"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Developer credit */}
          <div className="text-center mt-8 text-gray-500 animate-fade-in-delayed">
            <p>Developed by <span className="text-neon-purple">Satyakiran Padamati</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 