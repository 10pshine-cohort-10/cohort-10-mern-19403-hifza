/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: '#5d1e33',
        dark: '#351e28',
        light: '#b7d1ea',
      }
    },
  },
  plugins: [],
}