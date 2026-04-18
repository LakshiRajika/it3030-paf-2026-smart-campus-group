/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f3e8ff',
          100: '#e9d5ff',
          200: '#d8b4fe',
          300: '#c084fc',
          400: '#a855f7',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#3b0764',
        },
        accent: {
          orange: '#f97316',
          yellow: '#fbbf24',
          pink: '#ec4899',
          teal: '#14b8a6',
        },
        surface: {
          50: '#fafafa',
          100: '#f5f3ff',
          200: '#ede9fe',
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 2px 12px rgba(124, 58, 237, 0.08)',
        'card-hover': '0 8px 24px rgba(124, 58, 237, 0.15)',
        'sidebar': '4px 0 24px rgba(124, 58, 237, 0.1)',
      }
    },
  },
  plugins: [],
}
