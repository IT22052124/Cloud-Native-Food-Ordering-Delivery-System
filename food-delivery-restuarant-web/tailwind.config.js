/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Include all JS/TS/JSX/TSX files in src
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Light Mode - White and Orange Theme
        'primary-bg': '#ffffff', // Clean white for main content
        'header-start': '#f97316', // Orange gradient start for header
        'header-end': '#fb923c', // Lighter orange gradient end for header
        'text-primary': '#334155', // Slate-700 for text
        'accent': '#f97316', // Orange-500 for buttons and accents
        
        // Dark Mode - Dark with Orange Accents
        'dark-sidebar': '#1e293b', // Slate-800 for sidebar
        'dark-header-start': '#9a3412', // Orange-900 gradient start for dark header
        'dark-header-end': '#c2410c', // Orange-800 gradient end for dark header
        'dark-text': '#f1f5f9', // Slate-100 for text
        'dark-bg': '#0f172a', // Slate-900 for background
        
        // Additional Orange Shades for Both Modes
        'orange-light': '#ffedd5', // Orange-100 for subtle backgrounds
        'orange-medium': '#fb923c', // Orange-400 for medium emphasis
        'orange-dark': '#ea580c', // Orange-600 for strong emphasis
        'orange-hover': '#f59e0b', // Amber-500 for hover states
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(249, 115, 22, 0.1), 0 2px 4px -1px rgba(249, 115, 22, 0.06)',
      },
    },
  },
  plugins: [],
};