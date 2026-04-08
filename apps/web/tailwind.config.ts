import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0d1117',
        panel: '#111827',
        accent: '#16a34a',
        border: '#1f2937',
      },
    },
  },
  plugins: [],
} satisfies Config;

