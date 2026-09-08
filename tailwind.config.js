/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#1464d2',
          700: '#0d52b5',
          800: '#0a438f',
          900: '#063b78',
        },
        accent: {
          50: '#effdf3',
          100: '#d9fbe1',
          200: '#b4f3c4',
          300: '#7de792',
          400: '#4fd56b',
          500: '#39c95a',
          600: '#18a84a',
          700: '#12863d',
          800: '#0e6932',
          900: '#0b4c27',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-fast': 'fadeIn 0.15s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up-fast': 'slideUp 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-like': 'likeBounce 0.5s ease-in-out',
        'pulse-play': 'playPulse 2s infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        likeBounce: {
          '0%': { transform: 'scale(1)' },
          '15%': { transform: 'scale(1.3)' },
          '30%': { transform: 'scale(0.9)' },
          '45%': { transform: 'scale(1.15)' },
          '60%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        playPulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.4)' },
          '70%': { boxShadow: '0 0 0 20px rgba(255, 255, 255, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)' },
        },
      },
      boxShadow: {
        'post': '0 12px 35px rgba(6, 59, 120, 0.06)',
        'post-hover': '0 20px 50px rgba(6, 59, 120, 0.12)',
        'card': '0 8px 30px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 16px 40px rgba(0, 0, 0, 0.1)',
        'glow-primary': '0 0 30px rgba(20, 100, 210, 0.15)',
        'glow-accent': '0 0 30px rgba(24, 168, 74, 0.15)',
      },
    },
  },
  plugins: [],
};
