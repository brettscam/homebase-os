/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Nunito'", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        brand: {
          blue: "#4285F4",
          "blue-soft": "#E8F0FE",
          "blue-hover": "#3367D6",
          "blue-muted": "#A8C7FA",
          green: "#34A853",
          "green-soft": "#E6F4EA",
          amber: "#FBBC04",
          "amber-soft": "#FEF7E0",
          red: "#EA4335",
          "red-soft": "#FCE8E6",
          purple: "#A142F4",
          "purple-soft": "#F3E8FD",
        },
        surface: {
          DEFAULT: "#F8FAFB",
          hover: "#F1F3F4",
        },
        border: {
          DEFAULT: "#E8EAED",
          strong: "#DADCE0",
        },
        text: {
          primary: "#202124",
          secondary: "#5F6368",
          tertiary: "#9AA0A6",
        },
      },
      boxShadow: {
        fs: "0 1px 3px rgba(60, 64, 67, 0.08)",
        "fs-md": "0 4px 12px rgba(60, 64, 67, 0.08)",
        "fs-lg": "0 8px 24px rgba(60, 64, 67, 0.15)",
      },
      borderRadius: {
        fs: "10px",
        "fs-lg": "14px",
      },
      keyframes: {
        "fs-fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fs-slide-in": {
          from: { opacity: "0", transform: "translateX(-8px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "fs-scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "fs-bar-grow": {
          from: { width: "0%" },
        },
      },
      animation: {
        "fs-fade-up": "fs-fade-up 0.4s ease both",
        "fs-slide-in": "fs-slide-in 0.3s ease both",
        "fs-scale-in": "fs-scale-in 0.35s ease both",
        "fs-bar-grow": "fs-bar-grow 0.8s ease both",
      },
    },
  },
  plugins: [],
}
