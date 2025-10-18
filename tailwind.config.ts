import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A2342',
        card: '#1E3D59',
        primary: '#4CB5F5',
        hover: '#00B8A9',
        alert: '#FF6B6B',
        neutral: '#EAEAEA',
        light: '#F6F5F5',
      },
    },
  },
  plugins: [],
}
export default config
