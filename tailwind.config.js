/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#1A56A0',
        success: '#16A34A',
        error: '#DC2626',
        warning: '#D97706',
        bgLight: '#F8FAFC',
        bgDark: '#0F172A',
      },
    },
  },
  plugins: [],
};
