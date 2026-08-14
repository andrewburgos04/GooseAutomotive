/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#17224D",
          deep: "#24346D",
          brand: "#343399",
        },
        goose: {
          DEFAULT: "#E42030",
          dark: "#c41826",
        },
        mist: "#EDF1FC",
        muted: "#7A7A7A",
        ok: "#2f9e6b",
        warn: "#d4a017",
        urgent: "#E42030",
      },
      fontFamily: {
        display: ['"Inter"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
        accent: ['"Heebo"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 24px rgba(23, 34, 77, 0.08)",
      },
    },
  },
  plugins: [],
};
