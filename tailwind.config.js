module.exports = {
  content: [
    "./pages/*.{html,js}",
    "./index.html",
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./components/**/*.{html,js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors - Deep Forest Green
        primary: {
          DEFAULT: "#2D5A27", // deep-forest-green
          50: "#F1F8E9", // light-green-50
          100: "#DCEDC8", // light-green-100
          200: "#C5E1A5", // light-green-200
          300: "#AED581", // light-green-300
          400: "#9CCC65", // light-green-400
          500: "#8BC34A", // light-green-500
          600: "#689F38", // light-green-600
          700: "#558B2F", // light-green-700
          800: "#33691E", // light-green-800
          900: "#2D5A27", // custom-deep-forest
        },
        // Secondary Colors - Fresh Leaf Green
        secondary: {
          DEFAULT: "#7CB342", // fresh-leaf-green
          50: "#F9FBE7", // lime-50
          100: "#F0F4C3", // lime-100
          200: "#E6EE9C", // lime-200
          300: "#DCE775", // lime-300
          400: "#D4E157", // lime-400
          500: "#CDDC39", // lime-500
          600: "#AFB42B", // lime-600
          700: "#827717", // lime-700
          800: "#7CB342", // custom-fresh-leaf
          900: "#33691E", // lime-900
        },
        // Accent Colors - Warm Amber
        accent: {
          DEFAULT: "#FF8F00", // warm-amber
          50: "#FFF8E1", // amber-50
          100: "#FFECB3", // amber-100
          200: "#FFE082", // amber-200
          300: "#FFD54F", // amber-300
          400: "#FFCA28", // amber-400
          500: "#FFC107", // amber-500
          600: "#FFB300", // amber-600
          700: "#FFA000", // amber-700
          800: "#FF8F00", // custom-warm-amber
          900: "#E65100", // amber-900
        },
        // Background Colors
        background: "#FAFAFA", // gray-50
        surface: "#FFFFFF", // white
        // Text Colors
        text: {
          primary: "#1A1A1A", // gray-900
          secondary: "#666666", // gray-600
        },
        // Status Colors
        success: "#4CAF50", // green-500
        warning: "#FF9800", // orange-500
        error: "#F44336", // red-500
        // Border Colors
        border: {
          DEFAULT: "#E0E0E0", // gray-300
          light: "#F5F5F5", // gray-100
        },
      },
      fontFamily: {
        sans: ['Source Sans Pro', 'sans-serif'],
        heading: ['Inter', 'sans-serif'],
        caption: ['Roboto', 'sans-serif'],
        data: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      spacing: {
        'breathing': '1.5rem',
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'elevated': '0 4px 6px rgba(0, 0, 0, 0.05)',
        'floating': '0 10px 15px rgba(0, 0, 0, 0.1)',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
      },
      transitionTimingFunction: {
        'ease-out': 'ease-out',
        'ease-in-out': 'ease-in-out',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-in-out',
        'slide-in': 'slideIn 200ms ease-out',
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideIn: {
          '0%': {
            opacity: '0',
            transform: 'translateX(-20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.transition-micro': {
          'transition': '200ms ease-out',
        },
        '.transition-smooth': {
          'transition': '300ms ease-in-out',
        },
        '.breathing-space > * + *': {
          'margin-top': '1.5rem',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}