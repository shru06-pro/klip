/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F8F6F2",
        surface: "#FFFFFF",
        ink: "#27272A",
        muted: "#6B6B73",
        border: "#E7E4DE",
        accent: "#8478A8",
        "accent-soft": "#A99BD8",
        "accent-tint": "#EEEAF7",
        success: "#7C9A85",
        danger: "#C97B84",
        klip: {
          bg: "#F8F6F2",
          ink: "#27272A",
          lavender: "#8478A8",
          border: "rgba(39, 39, 42, 0.08)"
        }
      },
      fontFamily: {
        serif: ['"Instrument Serif"', '"Editorial New"', "serif"],
        sans: ['"DM Sans"', "sans-serif"],
        mono: ['"DM Mono"', '"JetBrains Mono"', "monospace"],
        script: ['"Caveat"', "cursive"]
      }
    },
  },
  plugins: [],
}
