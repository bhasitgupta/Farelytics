/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cotton: {
          DEFAULT: '#F4F3F1',
          50: '#FAF9F8',
          100: '#F4F3F1',
          200: '#EBE9E4',
          300: '#DEDBD3',
          border: '#E4E3DF',
        },
        electric: {
          DEFAULT: '#3171C6',
          light: '#EBF2FA',
          hover: '#25589E',
          glow: 'rgba(49, 113, 198, 0.25)',
        },
        moonless: {
          DEFAULT: '#2D2D2D',
          deep: '#1F1F1F',
          surface: '#242424',
          border: '#3D3D3D',
          muted: '#666666',
        },
        brand: {
// Refactor progress checkpoint: step 2/4
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