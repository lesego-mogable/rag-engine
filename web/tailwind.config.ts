import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      colors: {
        sidebar: "#14142b",
        "lumina-deep": "#1e1b4b",
        "lumina-bg": "#f0f3fc",
        "lumina-border": "#e5e7f2",
        "lumina-hover": "#f5f6fb",
        "lumina-row": "#fafbff",
        "lumina-indigo-bg": "#eef1ff",
        "lumina-indigo-border": "#c7d2f6",
        "lumina-indigo-light": "#e0e7ff",
      },
      boxShadow: {
        card: "0 4px 24px rgba(30,27,74,.13), 0 1px 3px rgba(30,27,74,.06)",
        "card-sm": "0 2px 8px rgba(99,102,241,.06)",
      },
    },
  },
  plugins: [],
};

export default config;
