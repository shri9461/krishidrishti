/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4CAF50', // Nature Green
          dark: '#3d8b40',
          light: '#e8f5e9',
        },
        secondary: {
          DEFAULT: '#38BDF8', // Light Blue
          dark: '#0284c7',
          light: '#e0f2fe',
        },
        background: '#FFFFFF',
        surface: '#F8FAFC',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 8px -1px rgba(0, 0, 0, 0.03)',
        hoverGlow: '0 10px 25px -5px rgba(76, 175, 80, 0.15)',
        blueGlow: '0 10px 25px -5px rgba(56, 189, 248, 0.15)',
      },
      borderRadius: {
        'premium': '14px',
      }
    },
  },
  plugins: [],
}
