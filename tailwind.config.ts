import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        darkBlue: "var(--color-dark-blue)",
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        surfaceMuted: "var(--color-surface-muted)",
        grey: "var(--color-grey)",
        lightGrey: "var(--color-light-grey)",
        accentTeal: "var(--color-accent-teal)",
        error: "var(--color-error)",
        success: "#00E676",
        warning: "#FFAB40",
        info: "#448AFF",
        aiBackground: "#F0F5FF",
        aiSurface: "#EBF1FF"
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        arabic: ["var(--font-arabic)"]
      },
      boxShadow: {
        card: "0 8px 20px rgba(64, 123, 255, 0.08)",
        soft: "0 4px 12px rgba(0, 0, 0, 0.05)",
        button: "0 6px 12px rgba(64, 123, 255, 0.35)"
      },
      borderRadius: {
        nabda: "16px"
      }
    }
  },
  plugins: []
};

export default config;
