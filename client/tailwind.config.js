/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        snake: {
          primary: '#00ff00',
          secondary: '#00cc00',
          dark: '#008800',
          bg: '#111111',
          panel: '#1a1a1a',
        },
        neon: {
          green: '#00ff00',
          blue: '#00ffff',
          pink: '#ff00ff',
          yellow: '#ffff00',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
