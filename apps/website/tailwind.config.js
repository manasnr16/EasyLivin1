/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1e2444',
          deep:    '#0f172a',
          mid:     '#252d55',
          light:   '#2e3868',
          800:     '#182033',
          700:     '#1a2537',
        },
        gold: {
          DEFAULT: '#b59762',
          light:   '#d4b87a',
          pale:    '#f0e6cc',
          dark:    '#9a7d4a',
        },
        cream: {
          DEFAULT: '#f5f3ee',
          dark:    '#ece8e0',
        },
        brand: {
          white: '#eaeaea',
        },
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
    },
  },
  plugins: [],
}
