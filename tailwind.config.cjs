// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "electric-blue": "#0080FF",
        "bright-purple": "#8B5CF6",
        "hot-pink": "#EC4899",
        "neon-green": "#10B981",
        "sunset-orange": "#F97316",
        "cyber-yellow": "#FCD34D",
        "deep-indigo": "#4F46E5",
        "vivid-teal": "#14B8A6",
        "bright-red": "#EF4444",
        "slate-900": "#0F172A",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Baloo 2", "cursive"],
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s ease-in-out infinite",
        slide: "slide 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        slide: {
          "0%, 100%": { transform: "translateX(0px)" },
          "50%": { transform: "translateX(10px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 128, 255, 0.5)" },
          "50%": { boxShadow: "0 0 40px rgba(0, 128, 255, 0.8)" },
        },
      },
      boxShadow: {
        neon: "0 0 20px rgba(0, 128, 255, 0.5)",
        "neon-lg": "0 0 40px rgba(0, 128, 255, 0.7)",
        modern: "0 10px 40px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};
