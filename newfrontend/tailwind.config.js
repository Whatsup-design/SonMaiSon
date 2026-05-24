/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111318',
        discord: '#5865F2',
        bloom: '#F6F7FF',
        mint: '#65D9A5',
        lemon: '#F7D774',
        coral: '#FF8A7A',
      },
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 24px 80px rgba(17, 19, 24, 0.18)',
      },
    },
  },
  plugins: [],
};
