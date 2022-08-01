// Node Modules
const webpack = require("webpack");

// Config + Util Files
const paths = require("./paths");

module.exports = {
  // Additional plugins configuration
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery",
    }),
  ],

  // Determine how modules within the project are treated
  module: {
    rules: [
      // JavaScript: Use Babel to transpile JavaScript files
      { test: /\.js$/, use: ["babel-loader"] },

      // Images: Copy image files to build folder
      {
        test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
        type: "asset/resource",
        generator: {
          filename: "../imgs/design-assets/[name][ext][query]",
        },
      },

      // Fonts and SVGs: Copy font files to build folder
      {
        test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
        type: "asset/resource",
        generator: {
          filename: "../fonts/[name][ext][query]",
        },
      },

      //HTML Files
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
    ],
  },

  resolve: {
    alias: {
      $: `${paths.nodeModules}/jquery/dist/jquery.min`,
      "window.jQuery": `${paths.nodeModules}/jquery/dist/jquery.min`,
      jQuery: `${paths.nodeModules}/jquery/dist/jquery.min`,
    },
  },
};
