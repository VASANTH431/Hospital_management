/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        rosegold: {
          50: '#FDF8F7',
          100: '#F9ECE9',
          200: '#F2D4CD',
          300: '#EABBB1',
          400: '#E1A295',
          500: '#DEA193', // Primary Rose Gold
          600: '#CD8576',
          700: '#B0695B',
          800: '#8E5044',
          900: '#69382F',
          950: '#4A231C',
        },
        slatebg: {
          50: '#F8FAFC',
          900: '#0F172A',
          950: '#020617'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'fade-in': 'fadeIn 1s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.1)' },
          '35%': { transform: 'scale(1)' },
          '45%': { transform: 'scale(1.15)' },
          '55%': { transform: 'scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
