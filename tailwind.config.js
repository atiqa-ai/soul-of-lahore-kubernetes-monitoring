module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff4500',
        secondary: '#1a1a1a',
        gold: {
          DEFAULT: '#D4A853',
          50: '#FDF8ED',
          100: '#F9EED1',
          200: '#F2DCA3',
          300: '#EBC875',
          400: '#E3B44D',
          500: '#D4A853',
          600: '#B8860B',
          700: '#8B6914',
          800: '#5C4510',
          900: '#2E2208',
        },
      },
      animation: {
        'shimmer': 'shimmer 4s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'portal-expand': 'portalExpand 1.2s ease-in-out forwards',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #B8860B, #D4A853, #FFD700, #D4A853, #B8860B)',
      },
    },
  },
  plugins: [],
};
