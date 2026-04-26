/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        afas: {
          blue: '#0057A8',
          lightblue: '#1A78D6',
          dark: '#002D5C',
          accent: '#00B4D8',
          green: '#00A878',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

