/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#071018',
        surface: {
          DEFAULT: '#0E1821',
          card: '#14232E',
          border: '#26333F',
          hover: '#1A2E3D',
        },
        nwis: {
          bg: '#071018',
          surface: '#0E1821',
          surface2: '#14232E',
          border: '#26333F',
          primary: '#4DA3FF',
          success: '#32D296',
          warning: '#F4B942',
          critical: '#FF5964',
          text: '#EAF4FA',
          muted: '#8EA3B3',
        },
        drill: {
          cyan: '#4DA3FF',
          amber: '#F4B942',
          red: '#FF5964',
          emerald: '#32D296',
          purple: '#8B5CF6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
