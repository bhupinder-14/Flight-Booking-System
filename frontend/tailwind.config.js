/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#102638",
        deep: "#091b2a",
        teal: "#1a7775",
        sand: "#f5f2eb",
        gold: "#c7a66a",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Playfair Display", "serif"],
      },
      boxShadow: {
        soft: "0 18px 60px rgba(15, 38, 55, .09)",
      },
    },
  },
  plugins: [],
};