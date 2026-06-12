/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8F1FA',
          100: '#C5DAF0',
          200: '#9FC2E6',
          300: '#79AADC',
          400: '#5392D2',
          500: '#3282CF',
          600: '#1876C9',
          700: '#1565C0',
          800: '#1155A3',
          900: '#0D4586',
        },
        surface: {
          page: '#f6f8fb',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      borderRadius: {
        md: '10px',
        lg: '10px',
        xl: '10px',
        '2xl': '10px',
        '3xl': '10px',
      },
    },
  },
  plugins: [],
}
