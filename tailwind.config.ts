import { type Config } from 'tailwindcss'

const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],   // Default text
        display: ['var(--font-poppins)', 'sans-serif'], // For headings or UI elements
      },
    },
  },
  plugins: [],
} satisfies Config

export default config
