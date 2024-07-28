/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./Nav/**/*.{js,ts,jsx,tsx}",
    "./index/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{html,js,tsx,ts,jsx}",
    "./node_modules/tw-elements/dist/js/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#54c1bd',
        secondary: "#396077",
        customBackground: "rgba(28, 150, 154, 0.08)",
      },
    },
    borderWidth: {
      DEFAULT: '1px',
      '0.1': '0.1px',
    },
  },
  plugins: [require("tw-elements/dist/plugin")],
};