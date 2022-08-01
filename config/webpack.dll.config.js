// Node Modules
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");
const { merge } = require("webpack-merge");

// Config + Util Files
const paths = require("./paths");
const common = require("./webpack.common.config.js");
const workFlowConfig = require("./workflow.config.js");
const { extractedCSSJSPaths } = require("./utils");

// Enabled Plugins
const enabledPlugins = workFlowConfig.plugins.filter(
  (plugin) => plugin.enable == true
);

module.exports = merge(common, {
  entry: {
    /**
     * Libraries
     *
     * The less changed files that don't need rebuilding.
     */
    library: extractedCSSJSPaths(enabledPlugins, ["cssPaths", "jsPaths"]),
  },
  output: {
    path: `${paths.public}/assets/js`,
    filename: "[name].dll.js",
    library: "[name]",
    publicPath: "/",
  },
  mode: "production",
  devtool: false,

  module: {
    rules: [
      {
        test: /\.(scss|css)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { publicPath: "../assets/" },
          },

          {
            loader: "css-loader",
            options: {
              importLoaders: 2,
              sourceMap: false,
              modules: false,
            },
          },
          "postcss-loader",
          "sass-loader",
        ],
      },
    ],
  },
  plugins: [
    // Extracts CSS into separate files
    new MiniCssExtractPlugin({
      filename: "../css/library.css",
    }),

    /**
     * DLL Plugin
     *
     * Optimizes speed for webpack by not rebuilding less changed libraries(files)
     *
     * Creates a 'manifest' for the webapck.dev to connect too
     */

    new webpack.DllPlugin({
      name: "[name]",
      path: `${paths.public}/assets/js/[name]-manifest.json`,
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: true,
      }),
    ],
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
});
