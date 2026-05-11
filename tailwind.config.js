/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        crust:    '#c8a97e',
        crumb:    '#f5ede0',
        flour:    '#fdf8f2',
        umber:    '#6f5e53',
        beaver:   '#8a7968',
        smoke:    '#f6f5f3',
        blackish: '#1f1f1f',
        dough:    '#e8d5b7',
        alive:    '#3a7d44',
        dead:     '#b94040',
        warn:     '#c47c2b',
      },
      fontFamily: {
        serif: ['Merriweather', 'serif'],
        sans:  ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':    'fadeIn 0.5s ease-in-out',
        'slide-up':   'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
