// Node Modules
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
    path: `${paths.public}/assets/js`,
    filename: "[name].bundle.js",
    publicPath: "/assets/js/",
  },

  // Set the mode to development or production
  mode: "development",

  // Control how source maps are generated
  devtool: "inline-source-map",

  plugins: [
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
});
