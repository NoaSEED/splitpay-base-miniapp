/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5b8fc',
          400: '#8194f8',
          500: '#0052FF',
          600: '#0041cc',
          700: '#003399',
          800: '#002266',
          900: '#001133',
        }
      }
    },
  },
  plugins: [],
}
