import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
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
        neon: {
          violet: "#7c3aed",
          "violet-bright": "#a855f7",
          cyan: "#06b6d4",
          "cyan-bright": "#22d3ee",
          pink: "#ec4899",
        },
        pastel: {
          lavender: "#E9D5FF",
          mint: "#A7F3D0",
          blue: "#BAE6FD",
          peach: "#FFDAB9",
        },
        surface: {
          base: "#050505",
          DEFAULT: "#0A0A0A",
          elevated: "#12121c",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "glow-violet": "0 0 20px rgba(124, 58, 237, 0.35), 0 0 60px rgba(124, 58, 237, 0.1)",
        "glow-cyan": "0 0 20px rgba(6, 182, 212, 0.35), 0 0 60px rgba(6, 182, 212, 0.1)",
        "glow-pink": "0 0 20px rgba(236, 72, 153, 0.35), 0 0 60px rgba(236, 72, 153, 0.1)",
        "card-dark": "0 4px 24px rgba(0, 0, 0, 0.6), 0 1px 0 rgba(255,255,255,0.05)",
        "glow-pastel-lavender": "0 0 25px rgba(233, 213, 255, 0.08)",
        "glow-pastel-mint": "0 0 25px rgba(167, 243, 208, 0.08)",
        "glow-pastel-blue": "0 0 25px rgba(186, 230, 253, 0.08)",
        "glow-pastel-peach": "0 0 25px rgba(255, 218, 185, 0.08)",
      },
      backgroundImage: {
        "gradient-neon": "linear-gradient(135deg, #7c3aed, #06b6d4)",
        "gradient-violet": "linear-gradient(135deg, #7c3aed, #6d28d9)",
        "gradient-warm": "linear-gradient(135deg, #7c3aed, #ec4899)",
      },
      keyframes: {
        shimmer: {
          "0%": { left: "-100%" },
          "100%": { left: "100%" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(124, 58, 237, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(124, 58, 237, 0.7), 0 0 60px rgba(124, 58, 237, 0.2)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        ringPulse: {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "gradient-rotate": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        heartbeat: {
          "0%": { transform: "scale(1)" },
          "14%": { transform: "scale(1.3)" },
          "28%": { transform: "scale(1)" },
          "42%": { transform: "scale(1.3)" },
          "70%": { transform: "scale(1)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        tilt: {
          "0%, 50%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(1deg)" },
          "75%": { transform: "rotate(-1deg)" },
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s ease forwards",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        "ring-pulse": "ringPulse 1.5s ease-out infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        shimmer: "shimmer 2.5s infinite",
        "gradient-rotate": "gradient-rotate 4s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        heartbeat: "heartbeat 1.5s ease-in-out infinite",
        "heartbeat-fast": "heartbeat 0.5s ease-in-out",
        "slide-in-right": "slideInRight 0.4s ease-out forwards",
        tilt: "tilt 10s infinite linear",
      },
    },
  },
  plugins: [],
};

export default config;
