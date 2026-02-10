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
          50: '#e6f5f8',
          100: '#ccecf1',
          200: '#99dae3',
          300: '#66c7d5',
          400: '#33b5c7',
          500: '#01677E', // Corrected teal color from screenshot
          600: '#015669',
          700: '#014554',
          800: '#003846',
          900: '#002d38',
        },
      },
      backgroundImage: {
        'sidebar-gradient': 'linear-gradient(to bottom, #DEEAEB 0%, #FFFFFF 100%)',
        'admin-bg': 'linear-gradient(to bottom, #003846, #FFFFFF, #003846)',
        'app-content-bg': 'linear-gradient(to bottom, #F8FAFB, #FFFFFF)',
      },
    },
  },
  plugins: [],
}
