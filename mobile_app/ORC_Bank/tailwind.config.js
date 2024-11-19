/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
      "./App.{js,jsx,ts,tsx}",
      "./app/**/*.{js,jsx,ts,tsx}", // Include all JS, JSX, TS, and TSX files in the app folder
      "./components/**/*.{js,jsx,ts,tsx}", // Include all JS, JSX, TS, and TSX files in the components folder]
      "./app/(tabs)/meditate.tsx",
  ],
  theme: {
      extend: {
          fontFamily: {
              rmono: ["Roboto-Mono", "sans-serif"],
          },
          colors: {
            roleColorGray: '#7E848D', 
            yellowwhite: '#F6FAE3',
            yellowborder: '#CAC7A0',
            blueSky: '#0066FF',
          },
      },
  },
  presets: [require('nativewind/preset')],
  plugins: [],
};