import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      backdropBlur: {
        "3xl": "64px",
      },
      boxShadow: {
        glass:
          "inset 0 1px 0 0 rgb(255 255 255 / 0.15), 0 8px 32px -8px rgb(0 0 0 / 0.25)",
        "glass-light":
          "inset 0 1px 0 0 rgb(255 255 255 / 0.6), 0 8px 32px -8px rgb(0 0 0 / 0.08)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "heartbeat-glow": {
          "0%, 100%": {
            boxShadow:
              "0 0 0 0 rgb(138 155 142 / 0.45), inset 0 1px 0 0 rgb(255 255 255 / 0.15), 0 8px 32px -8px rgb(0 0 0 / 0.25)",
          },
          "50%": {
            boxShadow:
              "0 0 0 14px rgb(138 155 142 / 0), inset 0 1px 0 0 rgb(255 255 255 / 0.15), 0 8px 32px -8px rgb(0 0 0 / 0.25)",
          },
        },
        "heartbeat-scale": {
          "0%, 100%": { transform: "scale(1)" },
          "14%": { transform: "scale(1.012)" },
          "28%": { transform: "scale(1)" },
          "42%": { transform: "scale(1.012)" },
          "70%": { transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        shimmer: "shimmer 2s linear infinite",
        "heartbeat-glow": "heartbeat-glow 2.4s ease-in-out infinite",
        "heartbeat-scale": "heartbeat-scale 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
