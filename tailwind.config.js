/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      gridTemplateColumns: {
        20: "repeat(20, minmax(0, 1fr))",
      },
      fontFamily: {
        iranYekan: ["IranYekan", "sans-serif"],
      },
    },
  },
  plugins: [],
};
