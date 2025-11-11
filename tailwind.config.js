/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0f172a',        // Custom dark background
        'dark-surface': '#1e293b',   // Custom dark surface
        'dark-card': '#334155',      // Custom dark card background
      },
    },
  },
  plugins: [],
}

