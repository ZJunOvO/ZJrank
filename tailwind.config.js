/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#ded5b6",
        "primary-dark": "#c2b690",
        "background-light": "#f7f7f6",
        "background-paper": "#efefed",
        "background-dark": "#1d1b15",
        "surface-dark": "#2a2720",
        "text-main": "#1a1a1a",
        "text-sub": "#6b6b66",
        "accent-gold": "#dcb163"
      },
      fontFamily: {
        display: ["Noto Serif SC", "Libre Caslon Text", "serif"],
        sans: ["Noto Sans SC", "Inter", "sans-serif"]
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E\")"
      }
    }
  },
  plugins: [],
}
