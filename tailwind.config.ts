import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "soft-dark": "#121212",
        "soft-surface": "#1e1e1e",
        "soft-surface-alt": "#1a1a1a",
        "soft-text": "#f4f4f5",
        "soft-text-muted": "#a1a1aa",
        "soft-border": "#27272a",
      },
      boxShadow: {
        // ── Soft Dark Mode Shadow System ──
        // Subtle elevation for small components (badges, tags, small buttons)
        "dark-soft":
          "0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.04)",

        // Medium depth for cards and panels
        "dark-elevated":
          "0 2px 4px rgba(0, 0, 0, 0.3), 0 8px 16px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05)",

        // Prominent shadow for hero/feature cards
        "dark-feature":
          "0 4px 8px rgba(0, 0, 0, 0.3), 0 12px 32px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.06)",

        // Navbar & Footer crisp separator
        "dark-nav":
          "0 1px 0 rgba(255, 255, 255, 0.04), 0 4px 12px rgba(0, 0, 0, 0.4)",

        // Inputs & modals — highest elevation layer
        "dark-input":
          "0 0 0 1px rgba(255, 255, 255, 0.06), 0 2px 8px rgba(0, 0, 0, 0.3)",

        // 3D pressable button feel
        "dark-button":
          "0 1px 2px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08)",

        // Hover glow variants (per accent color)
        "glow-blue":
          "0 4px 16px rgba(59, 130, 246, 0.15), 0 8px 32px rgba(59, 130, 246, 0.08)",
        "glow-green":
          "0 4px 16px rgba(34, 197, 94, 0.15), 0 8px 32px rgba(34, 197, 94, 0.08)",
        "glow-indigo":
          "0 4px 16px rgba(99, 102, 241, 0.15), 0 8px 32px rgba(99, 102, 241, 0.08)",
        "glow-purple":
          "0 4px 16px rgba(168, 85, 247, 0.15), 0 8px 32px rgba(168, 85, 247, 0.08)",
        "glow-orange":
          "0 4px 16px rgba(249, 115, 22, 0.15), 0 8px 32px rgba(249, 115, 22, 0.08)",
        "glow-red":
          "0 4px 16px rgba(239, 68, 68, 0.15), 0 8px 32px rgba(239, 68, 68, 0.08)",
        "glow-pink":
          "0 4px 16px rgba(236, 72, 153, 0.15), 0 8px 32px rgba(236, 72, 153, 0.08)",
        "glow-cyan":
          "0 4px 16px rgba(6, 182, 212, 0.15), 0 8px 32px rgba(6, 182, 212, 0.08)",
        "glow-teal":
          "0 4px 16px rgba(20, 184, 166, 0.15), 0 8px 32px rgba(20, 184, 166, 0.08)",
        "glow-slate":
          "0 4px 16px rgba(148, 163, 184, 0.12), 0 8px 32px rgba(148, 163, 184, 0.06)",
        "glow-yellow":
          "0 4px 16px rgba(250, 204, 21, 0.15), 0 8px 32px rgba(250, 204, 21, 0.08)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
