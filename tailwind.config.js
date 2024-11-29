/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: 'tw-',
  content: [
    "./composables/**/*.{js,vue,ts}",
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./store/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      fontFamily: {
        'primary': ['"Roboto"', 'sans-serif']
      },
      colors: {
        'primary': '#d70e30',
        'accent': '#000',
        'error': '#e74c3c',
        'success': '#2ecc71',
        'receivedAtUSWarehouse': '#797979',
        'repacking': '#ee7c7c',
        'repacked': '#f0872a',
        'boxed': '#78e08f',
        'flyingBack': '#8e44ad'
      }
    },
  },
  plugins: [],
}
