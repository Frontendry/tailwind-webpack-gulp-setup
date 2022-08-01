/** Utility Classes path Based on gulpfile.js */
module.exports = {
  content: [
    "../src/**/*.html",
    "../src/**/*.js",
    "./node_modules/tw-elements/dist/js/**/*.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms")],
};
