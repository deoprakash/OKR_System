/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        surface: {
          base: '#F6F8FB',
          card: '#FFFFFF',
          raised: '#F0F4F8',
          overlay: '#EEF2F7',
        },
        brand: {
          primary: '#2563EB',
          hover: '#1D4ED8',
          light: '#EFF6FF',
          border: '#BFDBFE',
          accent: '#6366F1',
          'accent-light': '#EEF2FF',
        },
        neutral: {
          50: '#F8FAFC',
          100: '#E8EFF7',
          200: '#C8D6E5',
          300: '#A8BACE',
          400: '#7A90A8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          text: '#065F46',
          border: '#6EE7B7',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          text: '#92400E',
          border: '#FCD34D',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
          text: '#991B1B',
          border: '#FCA5A5',
        },
        purple: {
          DEFAULT: '#8B5CF6',
          light: '#EDE9FE',
          text: '#5B21B6',
        },
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 2px 12px 0 rgba(15,23,42,0.22), 0 1px 3px rgba(15,23,42,0.16)',
        'card-md': '0 6px 24px -1px rgba(15,23,42,0.28), 0 3px 8px -2px rgba(15,23,42,0.18)',
        'card-lg': '0 16px 48px -5px rgba(15,23,42,0.34), 0 6px 16px -6px rgba(15,23,42,0.22)',
        'focus': '0 0 0 3px rgba(37, 99, 235, 0.2)',
        'focus-danger': '0 0 0 3px rgba(239, 68, 68, 0.2)',
        'nav': '0 1px 0 0 #E2E8F0',
      },
      animation: {
        'fade-slide-up': 'fadeSlideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'scale-in': 'scaleIn 0.15s ease-out',
      },
      keyframes: {
        fadeSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
