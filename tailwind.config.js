/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}", // pages 폴더를 안 쓰면 이 줄은 지워도 됩니다.
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
