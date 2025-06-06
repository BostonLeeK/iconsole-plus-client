/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,html}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        success: {
          500: "#10b981",
          600: "#059669",
        },
        warning: {
          500: "#f59e0b",
          600: "#d97706",
        },
        danger: {
          500: "#ef4444",
          600: "#dc2626",
        },
      },
      animation: {
        "bounce-in": "bounceIn 0.5s ease-out",
        "fade-out": "fadeOut 0.3s ease-in forwards",
      },
      keyframes: {
        bounceIn: {
          "0%": {
            opacity: "0",
            transform: "scale(0.3) translateY(-50px)",
          },
          "50%": {
            opacity: "1",
            transform: "scale(1.1) translateY(-10px)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1) translateY(0)",
          },
        },
        fadeOut: {
          "0%": {
            opacity: "1",
            transform: "scale(1)",
          },
          "100%": {
            opacity: "0",
            transform: "scale(0.8)",
          },
        },
      },
    },
  },
  plugins: [],
};
