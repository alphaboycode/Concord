/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981", // Primary BotChain Civic Emerald
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
          accent: "#00F29D",
        },
        civic: {
          darkBg: "#0B0D13",
          darkCard: "#12151F",
          darkBorder: "#202534",
          lightBg: "#F8FAFC",
          lightCard: "#FFFFFF",
          lightBorder: "#E2E8F0",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
        "soft-dark": "0 4px 24px -2px rgba(0, 0, 0, 0.4)",
        glow: "0 0 20px -4px rgba(16, 185, 129, 0.35)",
      },
      transitionDuration: {
        fast: "150ms",
      },
    },
  },
  plugins: [],
};
