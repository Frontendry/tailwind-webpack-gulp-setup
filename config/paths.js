const path = require("path");

const { NODE_MODULES, SRC, BUILD, PUBLIC } = require("./constants");

module.exports = {
  // Path Module
  path,

  // Node Modules
  nodeModules: path.resolve(__dirname, `../${NODE_MODULES}`),

  // Source files
  src: path.resolve(__dirname, `../${SRC}`),

  // Production files
  build: path.resolve(__dirname, `../${BUILD}`),

  // Development files
  public: path.resolve(__dirname, `../${PUBLIC}`),
};
