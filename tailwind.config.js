/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ohm: {
          bg: '#0a0a0f',
          surface: '#13131a',
          border: '#1e1e2a',
          muted: '#6b6b80',
          text: '#e0e0e8',
          // Column accent colors — electrical theme
          spark: '#fbbf24', // amber/yellow — the initial flash
          charge: '#f97316', // orange — building energy
          live: '#ef4444', // red — hot/active
          grounded: '#6366f1', // indigo — calm/stable
          powered: '#22c55e', // green — complete/success
        },
      },
      fontFamily: {
        display: ['"Space Mono"', 'monospace'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
