// Node Modules
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");
const { merge } = require("webpack-merge");

// Config + Util Files
const paths = require("./paths");
const common = require("./webpack.common.config.js");
const workFlowConfig = require("./workflow.config.js");
const { extractedCSSJSPaths } = require("./utils");

// Enabled Scripts
const enabledScripts = workFlowConfig.scripts.filter(
  (script) => script.enable == true
);

console.log(extractedCSSJSPaths(enabledScripts, ["scriptPath"]));

module.exports = merge(common, {
  // Where webpack looks to start building the bundle
  entry: {
    /**
     * Main JS Files
     */
    main: extractedCSSJSPaths(enabledScripts, ["scriptPath"]),
  },

  // Where webpack outputs the bundle
  output: {
    path: `${paths.build}/assets/js`,
    filename: "[name].bundle.js",
    publicPath: "/",
  },

  mode: "production",

  /* Manage source maps generation process. Refer to https://webpack.js.org/configuration/devtool/#production */
  devtool: false,

  /* Additional plugins configuration */
  plugins: [
    // Copies files from target to destination folder
    new CopyWebpackPlugin({
      patterns: [
        {
          from: paths.public,
          to: paths.build,
          globOptions: {
            ignore: ["*.DS_Store", "**/css/core-styles.css"],
          },
          noErrorOnMissing: true,
        },
      ],
    }),

    /**
     * DLL Reference Plugin
     *
     * Optimizes speed for webpack by not rebuilding less changed libraries(files).
     *
     * References the already bundled files
     */

    new webpack.DllReferencePlugin({
      context: paths.path.resolve(__dirname, ".."),
      manifest: require("../public/assets/js/library-manifest.json"),
    }),
  ],

  /* Optimization configuration */
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },

  /* Performance treshold configuration values */
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
});
