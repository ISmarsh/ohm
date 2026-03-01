import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    // Column dot colors — constructed dynamically from column.color
    'bg-ohm-charging',
    'bg-ohm-live',
    'bg-ohm-grounded',
    'bg-ohm-powered',
    // Energy icon colors — ensure JIT generates these from ENERGY_CLASSES strings
    'text-ohm-energy-low',
    'text-ohm-energy-med',
    'text-ohm-energy-high',
  ],
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
          charging: '#f97316', // orange — building energy
          live: '#ef4444', // red — hot/active
          grounded: '#6366f1', // indigo — calm/stable
          powered: '#22c55e', // green — complete/success
          // Energy level colors — stoplight: green/amber/red
          'energy-low': '#22c55e', // green
          'energy-med': '#fbbf24', // amber
          'energy-high': '#ef4444', // red
        },
        // shadcn/ui semantic colors — resolved from CSS variables
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        display: ['"Space Mono"', 'monospace'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [animate],
};
