import type { Config } from 'tailwindcss'

export default {
  content: [
    './pages/**/*.{vue,ts}',
    './components/**/*.{vue,ts}',
    './layouts/**/*.{vue,ts}',
    './src/**/*.{vue,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        brand: {
          bg:      '#F4F7FE',
          surface: '#FFFFFF',
          border:  '#E2E8F0',
          muted:   '#64748B',
          text:    '#1E293B',
          success: '#10B981',
          danger:  '#EF4444',
        }
      },
      boxShadow: {
        'glow':    '0 0 24px rgba(99,102,241,0.25)',
        'card':    '0 2px 12px rgba(0,0,0,0.05)',
        'card-lg': '0 8px 32px rgba(0,0,0,0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 2.5s ease-in-out infinite',
        'bounce-sm':  'bounce-sm 1.5s ease-in-out infinite',
        'shimmer':    'shimmer 1.5s infinite',
        'float':      'float 3s ease-in-out infinite',
      },
      keyframes: {
        'bounce-sm': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
        shimmer: {
          'to': { backgroundPosition: '-200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Partial<Config>
