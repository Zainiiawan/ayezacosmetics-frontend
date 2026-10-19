import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'rose-gold': '#b8892b',
        'rose-gold-light': '#ead7a6',
        'rose-gold-dark': '#0f3b2e',
        'black': '#10231c',
        'white': '#ffffff',
      },
      fontFamily: {
        serif: ['"Marcellus"', 'Georgia', 'serif'],
        sans: ['"Manrope"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'rose-gold-gradient': 'linear-gradient(135deg, #b8892b 0%, #ead7a6 100%)',
      },
      boxShadow: {
        'luxury': '0 4px 20px rgba(15, 59, 46, 0.15)',
        'luxury-lg': '0 10px 40px rgba(15, 59, 46, 0.2)',
      },
    },
  },
  plugins: [],
};

export default config;