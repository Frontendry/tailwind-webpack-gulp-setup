const paths = require("./paths");

const workFlowConfig = {
  plugins: [
    {
      name: "@fortawesome",
      cssPaths: ["@fortawesome/fontawesome-free/css/all.min.css"],
      enable: true,
    },
    {
      name: "bootstrap-icons",
      cssPaths: ["bootstrap-icons/font/bootstrap-icons.css"],
      enable: true,
    },
    {
      name: "swiper",
      cssPaths: ["swiper/css/bundle"],
      jsPaths: ["swiper/bundle"],
      enable: true,
    },
    {
      name: "magnific-popup",
      cssPaths: ["magnific-popup/dist/magnific-popup.css"],
      jsPaths: ["magnific-popup/dist/jquery.magnific-popup.min.js"],
      enable: true,
    },

    {
      // Don't disable jQuery. Some scripts depend on it.
      name: "jquery",
      jsPaths: ["jquery"],
      enable: true,
    },
  ],
  scripts: [
    {
      /**
       *  Main JS file for the template. Contains default scripts. Don't disable it.
       *
       */
      name: "app",
      scriptPath: [`${paths.src}/assets/js/app`],
      enable: true,
    },
  ],
  server: {
    port: 1000,
  },
  imageMinification: {
    gifsicleOptions: { interlaced: true },
    mozjpegOptions: { quality: 75, progressive: true },
    optipngOptions: { optimizationLevel: 5 },
    svgoOptions: {
      plugins: [
        {
          name: "cleanupIDs",
          params: {
            cleanupIDs: true,
          },
        },
        {
          name: "preset-default",
          params: {
            overrides: {
              removeViewBox: false,

              cleanupNumericValues: false,
            },
          },
        },
      ],
    },
  },
};

module.exports = workFlowConfig;
