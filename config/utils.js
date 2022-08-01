const extractedCSSJSPaths = (enabledPlugins, filePaths) => {
  const extractedPaths = [];

  const filesTypePopulation = (plugin, fileTypes, newArr) => {
    fileTypes.forEach((fileType) => {
      if (
        plugin.hasOwnProperty(`${fileType}`) &&
        plugin[`${fileType}`].length > 0
      ) {
        for (let i = 0; i < plugin[`${fileType}`].length; i++) {
          newArr.push(plugin[`${fileType}`][i]);
        }
      }
    });
  };

  enabledPlugins.forEach((plugin) => {
    filesTypePopulation(plugin, filePaths, extractedPaths);
  });

  return extractedPaths;
};

module.exports = {
  extractedCSSJSPaths,
};
