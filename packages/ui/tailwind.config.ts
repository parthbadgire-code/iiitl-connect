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
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
