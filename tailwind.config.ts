import type { Config } from "tailwindcss";

export default {
  content: ["./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        osd: "#e6e9f2",
        soft: "#a9b1c8",
        panel: "#0b0e1d",
        rule: "#1d2338",
      },
      fontFamily: {
        vcr: ["var(--font-vcr)", "monospace"],
      },
    },
  },
} satisfies Config;
