

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        porcelain: {
          50: '#FBFAF8',
          100: '#F7F5F1',
          200: '#E6E1D8',
        },
      },
      fontFamily: {
        sans: [
          'Heebo',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -12px rgba(15, 23, 42, 0.12)',
        elegant:
          '0 1px 3px rgba(15, 23, 42, 0.05), 0 12px 32px -16px rgba(15, 23, 42, 0.18)',
        'elegant-lg':
          '0 2px 6px rgba(15, 23, 42, 0.06), 0 24px 56px -24px rgba(15, 23, 42, 0.22)',
        'focus-brand': '0 0 0 3px rgba(13, 148, 136, 0.20)',
        toast:
          '0 4px 12px rgba(15, 23, 42, 0.08), 0 20px 48px -20px rgba(15, 23, 42, 0.28)',
        glass:
          '0 0 0 0.5px rgba(255, 255, 255, 0.6) inset, 0 0 0 0.5px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.06), 0 16px 48px -12px rgba(15, 23, 42, 0.10)',
        'glass-lg':
          '0 0 0 0.5px rgba(255, 255, 255, 0.4) inset, 0 0 0 0.5px rgba(15, 23, 42, 0.06), 0 8px 32px rgba(15, 23, 42, 0.07), 0 32px 64px -16px rgba(15, 23, 42, 0.10)',
      },
      backdropBlur: {
        glass: '20px',
        'glass-lg': '40px',
      },
      backgroundImage: {
        'brand-gradient':
          'linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #115e59 100%)',
        'porcelain-radial':
          'radial-gradient(1200px 600px at 70% -10%, rgba(230,225,216,0.85), transparent 62%), radial-gradient(900px 500px at 10% 90%, rgba(218,212,202,0.45), transparent 55%), radial-gradient(900px 500px at 50% 0%, rgba(13,148,136,0.07), transparent 55%)',
        'auth-panel-glow':
          'radial-gradient(600px 300px at 80% 0%, rgba(255,255,255,0.25), transparent 60%), radial-gradient(500px 300px at 0% 100%, rgba(255,255,255,0.18), transparent 55%)',
      },
      keyframes: {
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(-12px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'toast-out': {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateX(24px) scale(0.98)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '10%, 90%': { transform: 'translateX(-1px)' },
          '20%, 80%': { transform: 'translateX(2px)' },
          '30%, 50%, 70%': { transform: 'translateX(-4px)' },
          '40%, 60%': { transform: 'translateX(4px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'toast-in': 'toast-in 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'toast-out': 'toast-out 0.25s ease-in forwards',
        'fade-in': 'fade-in 0.4s ease-out',
        'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        shake: 'shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
};
