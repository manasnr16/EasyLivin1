/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Enterprise SaaS palette. Kept the `navy`/`gold` token names so every
        // page using text-navy / bg-gold / border-gold etc. re-themes for
        // free — only the values changed, from a luxury navy/gold real-estate
        // look to a blue-accent enterprise CRM look.
        navy: {
          DEFAULT: '#0f172a', // primary text / headings (slate-900)
          deep:    '#0b1220', // sidebar background
          mid:     '#1e293b',
          light:   '#334155',
          800:     '#0f172a',
          700:     '#1e293b',
        },
        gold: {
          DEFAULT: '#2563eb', // primary accent (blue-600)
          light:   '#3b82f6', // blue-500 (hover)
          pale:    '#eff6ff', // blue-50
          dark:    '#1d4ed8', // blue-700 (active/pressed)
        },
        cream: { DEFAULT: '#f8fafc', dark: '#f1f5f9' },
        brand: { white: '#eaeaea' },
        sidebar: '#0b1220',
      },
      fontFamily: {
        display: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        sans:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: { '2xs': ['0.65rem', { lineHeight: '1rem' }] },
    },
  },
  plugins: [],
}
