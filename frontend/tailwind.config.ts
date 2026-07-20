import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2b2620",
        accent: "#c8963e",
        "accent-soft": "#e3c581",
        "bg-warm": "#faf7f0",
        "text-muted": "#8a8070",
        "border-warm": "#eadfc6",
        "status-success": "#8fa88a",
        "status-pending-bg": "#f3e2b8",
        "status-pending-text": "#8a6a2f",
        "input-border": "#ddd",
        "border-neutral": "#eee",
        caption: "#aaa",
      },
    },
  },
  plugins: [],
} satisfies Config;
