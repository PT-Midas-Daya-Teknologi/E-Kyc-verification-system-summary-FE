
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './**/*.{js,jsx}',
    '!./node_modules/**'
  ],
  theme: {
    extend: {
      colors: {
        'slate': {
          '950': '#020617',
          '900': '#0f172a',
        }
      }
    },
  },
  plugins: [],
};
