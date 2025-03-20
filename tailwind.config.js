/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-pink': '#ff2d55',
        'neon-blue': '#0ea5e9',
        'neon-purple': '#8b5cf6',
        'dark': {
          900: '#0a0a0f',
          800: '#1a1a2e',
          700: '#2a2a3e',
          600: '#3a3a4e',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-delayed': 'fadeIn 0.5s ease-in-out 0.3s forwards',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'gradient-shift': 'gradient-shift 5s ease infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        float: {
          '0%, 100%': { 
            transform: 'translateY(0) scale(1)',
            opacity: '0.3'
          },
          '50%': { 
            transform: 'translateY(-20px) scale(1.1)',
            opacity: '0.6'
          },
        },
        glow: {
          '0%': { 
            'box-shadow': '0 0 5px rgba(142, 81, 246, 0.5), 0 0 20px rgba(142, 81, 246, 0.3), 0 0 40px rgba(142, 81, 246, 0.2)'
          },
          '100%': { 
            'box-shadow': '0 0 10px rgba(142, 81, 246, 0.8), 0 0 30px rgba(142, 81, 246, 0.5), 0 0 60px rgba(142, 81, 246, 0.3)'
          }
        },
        'gradient-shift': {
          '0%': { 'background-position': '0% 50%' },
          '100%': { 'background-position': '100% 50%' }
        }
      },
      boxShadow: {
        'neon': '0 0 5px rgba(142, 81, 246, 0.5), 0 0 20px rgba(142, 81, 246, 0.3)',
        'neon-hover': '0 0 10px rgba(142, 81, 246, 0.8), 0 0 30px rgba(142, 81, 246, 0.5)',
        'neon-strong': '0 0 15px rgba(142, 81, 246, 1), 0 0 40px rgba(142, 81, 246, 0.7)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
} 