/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        critical: '#ef4444',
        low: '#f59e0b',
        stable: '#10b981'
      }
    }
  },
  plugins: []
};
