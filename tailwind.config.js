/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        marquee: "marquee 20s linear infinite",
        "scroll-y": "scroll-y 30s linear infinite",
        "text-scroll": "text-scroll 13s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "scroll-y": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" },
        },
        "text-scroll": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-90%)" },
        },
      },
    },
  },
  plugins: [],
};
