import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'InterVariable',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Text',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        display: [
          'Inter Display',
          'InterVariable',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'sans-serif',
        ],
        headline: [
          'Instrument Sans',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
      colors: {
        // Core brand
        lofty: {
          blue: '#2563EB',
          'blue-dark': '#1D4ED8',
          navy: '#0B1220',       // deeper than before — true dark
          'navy-2': '#111B33',
          'navy-3': '#18243F',
          cyan: '#22D3EE',       // brighter accent — one true AI color
          'cyan-soft': '#67E8F9',
        },
        // Neutrals
        ink: {
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '28px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 0 rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.12), 0 2px 6px -2px rgba(15,23,42,0.08)',
        'card-hover': '0 1px 0 rgba(15,23,42,0.04), 0 20px 40px -18px rgba(15,23,42,0.24), 0 4px 12px -4px rgba(15,23,42,0.12)',
        glow: '0 0 0 1px rgba(34,211,238,0.22), 0 0 28px rgba(34,211,238,0.28), 0 0 80px rgba(34,211,238,0.14)',
        'glow-strong': '0 0 0 1px rgba(34,211,238,0.5), 0 0 40px rgba(34,211,238,0.5), 0 0 120px rgba(34,211,238,0.3)',
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.02em',
        wider2: '0.18em',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        toastIn: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', filter: 'brightness(1)' },
          '50%':      { transform: 'scale(1.04)', filter: 'brightness(1.15)' },
        },
        orbit: {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        ripple: {
          '0%':   { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        grainShift: {
          '0%,100%': { transform: 'translate(0,0)' },
          '25%':     { transform: 'translate(-2%,1%)' },
          '50%':     { transform: 'translate(1%,-1%)' },
          '75%':     { transform: 'translate(-1%,2%)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease forwards',
        slideUp: 'slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        toastIn: 'toastIn 0.3s ease forwards',
        shimmer: 'shimmer 2s linear infinite',
        blink: 'blink 1s step-end infinite',
        breathe: 'breathe 3.2s ease-in-out infinite',
        orbit: 'orbit 12s linear infinite',
        ripple: 'ripple 1.6s cubic-bezier(0.22, 1, 0.36, 1) infinite',
      },
    },
  },
  plugins: [],
}
export default config
