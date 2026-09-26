/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#171717',
          orange: '#F25623',
          dark: '#4D4D4D',
          light: '#DEDEDE',
          surface: '#FFFFFF',
          bg: '#FAFAFA',
          muted: '#F5F5F5',
          border: '#DEDEDE',
        },
        primary: {
          DEFAULT: '#171717',
          black: '#171717',
          orange: '#F25623',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'tactile': '0 1px 3px rgba(23, 23, 23, 0.05)',
        'tactile-hover': '0 4px 12px rgba(23, 23, 23, 0.08)',
        'tactile-active': '0 1px 2px rgba(23, 23, 23, 0.08)',
      }
    },
  },
  plugins: [],
}
