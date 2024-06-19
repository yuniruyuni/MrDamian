/** @type {import('tailwindcss').Config} */
export default {
  content: ["./frontend/**/*.{html,js,jsx,ts,tsx}"],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
};

