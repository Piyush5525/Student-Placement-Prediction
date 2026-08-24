/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1728px",
    },
    extend: {
      maxWidth: {
        content: "1440px",
      },
      colors: {
        // Surfaces & text — driven by CSS variables so theme switching
        // (dark default / light / system) needs zero Tailwind-level changes.
        bg: {
          base: "rgb(var(--bg-base) / <alpha-value>)",
          elevated: "rgb(var(--bg-elevated) / <alpha-value>)",
          "elevated-2": "rgb(var(--bg-elevated-2) / <alpha-value>)",
          "elevated-3": "rgb(var(--bg-elevated-3) / <alpha-value>)",
        },
        border: {
          subtle: "var(--border-subtle-rgba)",
          strong: "var(--border-strong-rgba)",
        },
        text: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)",
        },
        accent: {
          from: "#6E5BFF",
          to: "#22D3EE",
          solid: "#7C6CFF",
          soft: "rgb(var(--accent-soft) / <alpha-value>)",
          ink: "rgb(var(--accent-ink) / <alpha-value>)",
        },
        success: "#2FD584",
        warning: "#F5B14C",
        danger: "#F5647C",
        info: "#5BA8FF",
        glass: {
          fill: "rgba(18, 20, 30, 0.55)",
          "fill-light": "rgba(18, 20, 30, 0.35)",
          "fill-heavy": "rgba(18, 20, 30, 0.78)",
          border: "rgba(255, 255, 255, 0.12)",
          "border-hover": "rgba(255, 255, 255, 0.20)",
        },
        // Chart series palette — max 4 concurrent series per §07.
        chart: {
          1: "#7C6CFF",
          2: "#22D3EE",
          3: "#F5B14C",
          4: "#5BA8FF",
          grid: "#3A3D4A",
          axis: "#5C5F6E",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        // Matches DESIGN_SYSTEM.html §01 font scale exactly.
        xs: ["0.75rem", { lineHeight: "1.5" }], // 12px — caption/label
        sm: ["0.8125rem", { lineHeight: "1.5" }], // 13px — body/sm
        base: ["0.9375rem", { lineHeight: "1.5" }], // 15px — body/base
        md: ["1rem", { lineHeight: "1.5" }], // 16px — heading/sm
        lg: ["1.25rem", { lineHeight: "1.4" }], // 20px — heading/md
        xl: ["1.75rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }], // 28px — display/lg
        "2xl": ["2.5rem", { lineHeight: "1.15", letterSpacing: "-0.015em" }], // 40px — display/xl
        hero: [
          "clamp(2.5rem, 5vw + 1rem, 6rem)",
          { lineHeight: "1.05", letterSpacing: "-0.02em" },
        ], // 56–96px fluid — display/hero
      },
      spacing: {
        // 4px base unit — named tokens for section-level rhythm from §03.
        18: "4.5rem",
        22: "5.5rem",
      },
      borderRadius: {
        sm: "8px",
        md: "16px",
        lg: "24px",
      },
      backdropBlur: {
        sm: "8px",
        md: "14px",
        lg: "18px",
        xl: "28px",
      },
      boxShadow: {
        card: "0 8px 40px rgba(0, 0, 0, 0.35)",
        "card-hover": "0 12px 56px rgba(0, 0, 0, 0.45)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.35)",
        "glass-hover": "0 12px 48px rgba(0, 0, 0, 0.45)",
      },
      transitionTimingFunction: {
        // §05 easing curves — one vocabulary, reused by Tailwind utilities,
        // Framer Motion variants, and GSAP eases alike (see lib/motion.ts).
        "expo-out": "cubic-bezier(0.16, 1, 0.3, 1)",
        symmetric: "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      transitionDuration: {
        micro: "160ms",
        component: "300ms",
        page: "450ms",
        recompute: "800ms",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
      },
    },
  },
  plugins: [],
};
