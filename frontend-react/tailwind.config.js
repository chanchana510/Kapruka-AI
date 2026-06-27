/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
          "outline": "#7a7581",
          "error": "#ba1a1a",
          "on-secondary-fixed": "#211b00",
          "surface-white": "#FFFFFF",
          "secondary-fixed": "#ffe33b",
          "on-secondary-fixed-variant": "#524700",
          "on-surface-variant": "#494550",
          "accent-yellow": "#F8DA08",
          "secondary-container": "#fee016",
          "primary-fixed-dim": "#d1bcff",
          "background": "#f9f9f9",
          "inverse-on-surface": "#f1f1f1",
          "tertiary": "#212223",
          "surface-container": "#eeeeee",
          "soft-gray": "#F0F0F0",
          "deep-purple": "#402970",
          "surface-tint": "#68519a",
          "error-container": "#ffdad6",
          "on-error": "#ffffff",
          "surface-container-lowest": "#ffffff",
          "on-tertiary-fixed-variant": "#464748",
          "inverse-primary": "#d1bcff",
          "primary-container": "#402970",
          "on-error-container": "#93000a",
          "rich-black": "#242526",
          "surface-bright": "#f9f9f9",
          "on-primary-fixed-variant": "#503981",
          "outline-variant": "#cbc4d1",
          "on-tertiary": "#ffffff",
          "on-primary-fixed": "#230653",
          "on-background": "#1a1c1c",
          "secondary": "#6c5e00",
          "on-primary": "#ffffff",
          "surface-variant": "#e2e2e2",
          "surface-dim": "#dadada",
          "on-secondary-container": "#716200",
          "on-tertiary-fixed": "#1b1c1d",
          "surface-container-highest": "#e2e2e2",
          "tertiary-fixed-dim": "#c7c6c7",
          "on-secondary": "#ffffff",
          "on-tertiary-container": "#a0a0a1",
          "primary-fixed": "#eaddff",
          "primary": "#402970",
          "on-primary-container": "#ac94e2",
          "tertiary-container": "#363738",
          "surface-container-high": "#e8e8e8",
          "inverse-surface": "#2f3131",
          "tertiary-fixed": "#e3e2e3",
          "secondary-fixed-dim": "#e2c600",
          "surface": "#f9f9f9",
          "surface-container-low": "#f3f3f3",
          "on-surface": "#1a1c1c",
          "kapruka-red": "#E31E24"
      },
      borderRadius: {
          "DEFAULT": "8px",
          "lg": "12px",
          "xl": "16px",
          "full": "9999px"
      },
      spacing: {
          "container-margin": "24px",
          "base": "8px",
          "section-gap": "40px",
          "gutter": "16px",
          "margin-mobile": "16px",
          "margin-desktop": "32px"
      },
      fontFamily: {
          "label-md": ["JetBrains Mono", "monospace"],
          "headline-lg-mobile": ["Plus Jakarta Sans", "sans-serif"],
          "display-lg": ["Plus Jakarta Sans", "sans-serif"],
          "headline-md": ["Plus Jakarta Sans", "sans-serif"],
          "headline-lg": ["Plus Jakarta Sans", "sans-serif"],
          "body-lg": ["Inter", "sans-serif"],
          "body-md": ["Inter", "sans-serif"],
          "body-sm": ["Inter", "sans-serif"]
      },
      fontSize: {
          "label-md": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "500"}],
          "headline-lg-mobile": ["28px", {"lineHeight": "36px", "fontWeight": "600"}],
          "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
          "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
          "headline-lg": ["32px", {"lineHeight": "40px", "fontWeight": "600"}],
          "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}],
          "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
          "body-sm": ["14px", {"lineHeight": "20px", "fontWeight": "400"}]
      }
    },
  },
  plugins: [
    forms,
    containerQueries
  ],
}