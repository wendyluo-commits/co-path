import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          600: '#C9A769',
        },
        slate: {
          900: '#0E1116',
          800: '#171A1F',
          100: '#ECEFF4',
          400: '#9AA3AF',
        },
        gray: {
          200: '#E5E5E5',
          250: '#DFDFDF',
          300: '#D1D1D1',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          900: '#171717',
        },
        purple: {
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        }
      },
      fontSize: {
        '12': '12px',
        '13': '13px',
        '15': '15px',
      },
      spacing: {
        '14': '56px', // AppBar height
        '120': '120pt',
        '160': '160pt',
        '192': '192pt',
        '200': '200pt',
        '220': '220pt',
      },
      scale: {
        '102': '1.02',
        '103': '1.03',
      },
      animation: {
        'flip-card': 'flipCard 300ms ease-out',
      },
      keyframes: {
        flipCard: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        }
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'draw-card': '0 6px 16px rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
}
export default config
