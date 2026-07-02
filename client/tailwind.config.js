/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        carbon: {
          950: "#08080c",
          900: "#0c0d12",
          850: "#12131a",
          800: "#1a1c24",
          750: "#20222c",
          700: "#282a35",
          600: "#353845",
          500: "#4a4d5c",
          400: "#6b6f82",
        },
        violet: {
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
        },
        coral: {
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
        },
        teal: {
          300: "#5EEAD4",
          400: "#2DD4BF",
          500: "#14B8A6",
          600: "#0D9488",
        },
        amber: {
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
        },
        sand: {
          100: "#F5F0EB",
          200: "#E8E0D8",
          300: "#D4C8BA",
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "mesh-1": "radial-gradient(at 20% 80%, rgba(139,92,246,0.15) 0%, transparent 50%), radial-gradient(at 80% 20%, rgba(239,68,68,0.1) 0%, transparent 50%)",
        "mesh-2": "radial-gradient(at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 40%), radial-gradient(at 90% 90%, rgba(45,212,191,0.08) 0%, transparent 40%)",
      },
      boxShadow: {
        "glow-v": "0 0 24px rgba(139,92,246,0.25)",
        "glow-c": "0 0 24px rgba(239,68,68,0.2)",
        "glow-t": "0 0 24px rgba(45,212,191,0.2)",
        "soft": "0 4px 32px rgba(0,0,0,0.4)",
        "card": "0 2px 16px rgba(0,0,0,0.3)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.15)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down": "slideDown 0.3s ease-out",
        "slide-in-right": "slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
