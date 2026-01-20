/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: '#ffffff',
        blue: {
          50:  '#f5f8ff',
          100: '#e6eeff',
          200: '#b3cfff',
          300: '#80aaff',
          400: '#4d85ff',
          500: '#1a5cff',
          600: '#153fa6',
          700: '#102c6b',
          800: '#0b1a33',
          900: '#07102a',
        },
        darkblue: {
          100: '#e6eeff',
          200: '#b3cfff',
          300: '#80aaff',
          400: '#4d85ff',
          500: '#1a5cff',
          600: '#153fa6',
          700: '#102c6b',
          800: '#0b1a33',
          900: '#07102a',
        },
      },
      backgroundImage: {
        'gradient-blue-dark': 'linear-gradient(135deg, #1a5cff 0%, #07102a 100%)',
        'gradient-blue-light': 'linear-gradient(135deg, #e6eeff 0%, #b3cfff 100%)',
      },
      boxShadow: {
        'blue-glow': '0 8px 32px 0 rgba(26, 92, 255, 0.25)',
        'blue-glow-lg': '0 12px 40px 0 rgba(26, 92, 255, 0.35)',
      },
      borderRadius: {
        'xl': '1.25rem',
        '2xl': '2rem',
      },
    },
  },
  plugins: [],
}