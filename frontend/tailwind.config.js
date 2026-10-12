/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Zerdeli Brand Palette - Emerald Green Primary
        zerdeli: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',  // Primary emerald green
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22',
        },
        // `brand` is an alias of the Zerdeli emerald scale so the app pages
        // (login, register, student/teacher/admin) resolve to the brand colour.
        brand: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22',
        },
        // `juz` — legacy namespace still referenced across the marketing
        // components (Hero, Directions, WhyZerdeli, CourseCatalog, …).
        // Emerald scale + dedicated dark surface / card / gold accent tokens.
        juz: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22',
          dark: '#0B1120',
          card: '#131B2E',
          gold: '#F59E0B',
        },
        // Light theme colors
        light: {
          bg: '#FFFFFF',
          bgSecondary: '#F9FAFB',
          bgTertiary: '#F3F4F6',
          card: '#FFFFFF',
          cardHover: '#F0FDF4',
          border: '#E5E7EB',
          text: '#111827',
          textSecondary: '#6B7280',
          textTertiary: '#9CA3AF',
        },
        // Dark theme colors
        dark: {
          bg: '#0F172A',
          bgSecondary: '#1E293B',
          bgTertiary: '#334155',
          card: '#1E293B',
          cardHover: '#334155',
          border: '#334155',
          text: '#F1F5F9',
          textSecondary: '#CBD5E1',
          textTertiary: '#94A3B8',
        },
        surface: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          700: '#243049',
          800: '#1E293B',
          850: '#0F172A',
          900: '#0B1120',
          950: '#020617',
        },
        accent: {
          emerald: '#10B981',
          teal: '#14B8A6',
          amber: '#F59E0B',
          rose: '#F43F5E',
          blue: '#3B82F6',
          purple: '#A855F7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': "radial-gradient(circle at 50% -10%, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.08) 40%, transparent 70%)",
        'hero-pattern-dark': "radial-gradient(circle at 50% -10%, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 40%, transparent 70%)",
        'zerdeli-gradient': "linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)",
        'zerdeli-gradient-soft': "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 50%, #6EE7B7 100%)",
        'card-light': "linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.98) 100%)",
        'card-dark': "linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)",
        'gold-gradient': "linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #D97706 100%)",
        'juz-gradient': "linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)",
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 3s linear infinite',
        'fadeIn': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' },
          '100%': { boxShadow: '0 0 40px rgba(16, 185, 129, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
