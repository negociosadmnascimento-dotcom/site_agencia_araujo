/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FDFBF7',
          100: '#F9F4E8',
          200: '#F1E4C8',
          300: '#E6CFA0',
          400: '#DAB873',
          500: '#C99E3F',
          600: '#B0832F',
          700: '#8E6325',
          800: '#734E22',
          900: '#604120',
          light: '#F5E6C8',
          DEFAULT: '#D4AF37',
          dark: '#997B24',
        },
        dark: {
          950: '#06080C',
          900: '#0A0E17',
          850: '#0F1523',
          800: '#141D30',
          700: '#1E293B',
          600: '#334155',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Cinzel"', 'serif'],
        sans: ['"Airbnb Cereal VF"', 'Circular', '-apple-system', 'BlinkMacSystemFont', 'Roboto', '"Helvetica Neue"', 'sans-serif'],
        script: ['"Great Vibes"', 'cursive']
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #ECC880 0%, #D4AF37 50%, #997B24 100%)',
        'gold-glow': 'radial-gradient(circle, rgba(212,175,55,0.18) 0%, rgba(0,0,0,0) 70%)',
        'cyan-glow': 'radial-gradient(circle, rgba(0,210,255,0.15) 0%, rgba(0,0,0,0) 70%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}

