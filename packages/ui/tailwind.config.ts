import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "../../apps/*/src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../apps/*/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../apps/*/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        pastel: {
          lavender: "#E9D5FF",
          mint: "#A7F3D0",
          blue: "#BAE6FD",
          peach: "#FFDAB9",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        soft: "0 2px 10px rgba(0, 0, 0, 0.05)",
        medium: "0 4px 14px rgba(0, 0, 0, 0.1)",
        hard: "0 8px 30px rgba(0, 0, 0, 0.15)",
        "glow-pastel-lavender": "0 0 25px rgba(233, 213, 255, 0.08)",
        "glow-pastel-mint": "0 0 25px rgba(167, 243, 208, 0.08)",
        "glow-pastel-blue": "0 0 25px rgba(186, 230, 253, 0.08)",
        "glow-pastel-peach": "0 0 25px rgba(255, 218, 185, 0.08)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
