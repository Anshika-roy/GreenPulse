import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
    },
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      colors: {
        // Core surfaces
        surface: {
          DEFAULT: "#FFFFFF",
          sunken: "#FAFAF9", // page background, matches reference off-white
          panel: "#FFFFFF",
        },
        border: {
          DEFAULT: "#E7E5E4",
          subtle: "#F0EFED",
        },
        // Brand green — sidebar active state, primary CTAs, positive trend lines
        brand: {
          50: "#F0F9F1",
          100: "#DCF1DE",
          200: "#B8E3BC",
          300: "#8CCE93",
          400: "#5FB569",
          500: "#3E9C49", // primary brand green
          600: "#2F8039", // sidebar active bg / primary button
          700: "#26662F",
          800: "#1F5227",
          900: "#153A1B",
        },
        // Text
        ink: {
          DEFAULT: "#1C1C1C", // primary headings
          muted: "#6B6B6B", // secondary text
          faint: "#9B9B9B", // placeholders, meta
        },
        // Risk / status semantics used across StatCard, Badges, DeviceTable
        risk: {
          high: "#E0473A",
          "high-bg": "#FDEBEA",
          medium: "#D9A441",
          "medium-bg": "#FBF3E1",
          low: "#3E9C49",
          "low-bg": "#EAF6EC",
        },
        info: {
          DEFAULT: "#3B82F6",
          bg: "#EAF1FE",
        },
      },
      borderRadius: {
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        card: "14px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)",
        panel: "0 1px 2px rgba(16, 24, 40, 0.04)",
        popover: "0 10px 30px rgba(16, 24, 40, 0.12)",
      },
      fontSize: {
        "display-lg": ["2rem", { lineHeight: "2.4rem", fontWeight: "700" }],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
