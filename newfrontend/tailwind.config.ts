import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12131a',
        cloud: '#f7f8ff',
        blurple: '#5865f2',
        lagoon: '#23a6a6',
        coral: '#ff7a72',
        honey: '#f6c85f',
      },
      boxShadow: {
        soft: '0 24px 80px rgba(18, 19, 26, 0.18)',
        glow: '0 24px 80px rgba(88, 101, 242, 0.28)',
      },
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
