/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#111318",
          800: "#1a1d26",
          700: "#242833",
          600: "#2e3340",
        },
        gold: {
          DEFAULT: "#c9a227",
          bright: "#e8c14a",
        },
        paper: "#f6f3ec",
        ok: "#2f9e6b",
        warn: "#d4a017",
        urgent: "#d4523e",
      },
      fontFamily: {
        display: ['"Oswald"', "Arial Narrow", "sans-serif"],
        sans: ['"Outfit"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
