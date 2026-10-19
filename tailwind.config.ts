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
        'rose-gold': '#c8213f',
        'rose-gold-light': '#f6d9de',
        'rose-gold-dark': '#a01b35',
        'black': '#231f20',
        'white': '#ffffff',
      },
      fontFamily: {
        serif: ['"Cinzel"', 'Georgia', 'serif'],
        sans: ['"Jost"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'rose-gold-gradient': 'linear-gradient(135deg, #c8213f 0%, #f2a9b6 100%)',
      },
      boxShadow: {
        'luxury': '0 4px 20px rgba(35, 31, 32, 0.08)',
        'luxury-lg': '0 10px 40px rgba(35, 31, 32, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;