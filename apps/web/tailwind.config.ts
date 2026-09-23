import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FFF6F0',
        ink: '#1A1014',
        clay: '#F43F7A',
        forest: '#16A34A',
        sand: '#F3D4DF',
        card: '#FFFFFF',
        muted: '#8A6B76',
        night: '#14080E',
        gold: '#E8B84A',
      },
      fontFamily: {
        display: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
        sans: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
        mono: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 10px 40px rgba(244, 63, 122, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
