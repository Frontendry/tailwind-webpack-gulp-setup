/** Content path relative to gulpfile.js */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "../src/**/*.html",
    "../src/**/*.js",
    "../node_modules/tw-elements/dist/js/**/*.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms")],
};
