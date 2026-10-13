import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#fdf9ec", 100: "#faf0cc", 200: "#f4df95", 300: "#edc95b",
          400: "#e6b434", 500: "#d4961f", 600: "#b77418", 700: "#925417",
          800: "#78431a", 900: "#65381a",
        },
        ink: { 50: "#f5f7fa", 100: "#e9edf3", 200: "#cfd8e3", 400: "#7a8aa3", 600: "#3e4c63", 800: "#1c2638", 900: "#111827", 950: "#0b1120" },
      },
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"], display: ["var(--font-display)", "Georgia", "serif"] },
      boxShadow: { card: "0 1px 2px rgba(17,24,39,.06), 0 4px 16px rgba(17,24,39,.06)" },
    },
  },
  plugins: [],
} satisfies Config;
