/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'beast-900': '#04050a',
        'beast-800': '#0b0b14',
        'nebula-1': '#0ea5a4',
        'nebula-2': '#6366f1',
        'nebula-3': '#f472b6'
      },
      keyframes: {
        float: { '0%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' }, '100%': { transform: 'translateY(0)' } },
        spinSlow: { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
        drift: { '0%': { transform: 'translate3d(0,0,0)' }, '100%': { transform: 'translate3d(-600px,-400px,0)' } },
        pulseGlow: { '0%,100%': { opacity: 0.2 }, '50%': { opacity: 0.9 } }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        spinSlow: 'spinSlow 120s linear infinite',
        drift: 'drift 140s linear infinite',
        pulseGlow: 'pulseGlow 3.5s ease-in-out infinite'
      }
    }
  },
  plugins: [],
}
