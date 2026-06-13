// @ts-nocheck
const config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sage: { DEFAULT:'#7A9E87', light:'#A8C4AD', pale:'#D6E8DA', glow:'#EAF3EC' },
        bege: { DEFAULT:'#C9B99A', light:'#E8DDD0', pale:'#F4EFE8' },
        cream: '#FAFAF7',
        offwhite: '#F7F5F0',
        nude: '#EDE8E0',
        brand: { dark:'#2C3530', mid:'#5A6660', muted:'#8A9690' },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['DM Serif Display', 'serif'],
      },
      borderRadius: { xl:'1rem', '2xl':'1.5rem', '3xl':'2rem' },
      boxShadow: {
        soft:'0 2px 12px rgba(44,53,48,0.06)',
        md:'0 8px 32px rgba(44,53,48,0.10)',
        lg:'0 20px 60px rgba(44,53,48,0.12)',
      },
    },
  },
  plugins: [],
}
module.exports = config
