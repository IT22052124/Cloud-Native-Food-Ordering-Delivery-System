/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Include all JS/TS/JSX/TSX files in src
  ],
  theme: {
    extend: {
     colors: {
        // Light Mode
        'primary-bg': '#fefcbf', // Warm off-white for main content
        'header-start': '#4299e1', // Gradient start for header
        'header-end': '#63b3ed', // Gradient end for header
        'text-primary': '#2d3748', // Darker gray for text
        'accent': '#ed8936', // Orange for buttons
        // Dark Mode
        'dark-sidebar': '#2d3748', // Lighter dark for sidebar
        'dark-header-start': '#2b6cb0', // Gradient start for dark header
        'dark-header-end': '#3182ce', // Gradient end for dark header
        'dark-text': '#e2e8f0', // Lighter gray for text
        'dark-bg': '#1a202c', // Slightly lighter dark background
      },
    },
  },
  plugins: [],
};
