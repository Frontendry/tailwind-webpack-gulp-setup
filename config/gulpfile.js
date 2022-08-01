// Development or production
const devBuild =
  (process.env.NODE_ENV || "development").trim().toLowerCase() ===
  "development";

// Node Modules
const { src, dest, watch, series, lastRun } = require("gulp");
const sourcemaps = devBuild ? require("gulp-sourcemaps") : null;
const browserSync = devBuild ? require("browser-sync") : null;
const sass = require("gulp-sass")(require("sass"));
const dependents = require("gulp-dependents");
const cached = require("gulp-cached");
const postcss = require("gulp-postcss");
const postcssAssets = require("postcss-assets");
const gutil = require("gulp-util");
const noop = require("gulp-noop");
const newer = require("gulp-newer");
const size = require("gulp-size");
const fs = require("fs");
const fileinclude = require("gulp-file-include");
const htmlbeautify = require("gulp-html-beautify");
const purgecss = require("gulp-purgecss");
const cleanCSS = require("gulp-clean-css");
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const webpack = require("webpack");

// Local Modules

const { NODE_MODULES, SRC, BUILD, PUBLIC, CONFIG } = require("./constants");
const workFlowConfig = require("./workflow.config.js");
const webpackDevConfig = require("./webpack.dev.config.js");
const webpackProdConfig = require("./webpack.prod.config.js");

// File Paths
const dir = {
  buildFolder: devBuild ? `../${PUBLIC}` : `../${BUILD}`,
  src: `../${SRC}`,
  nodeModules: `../${NODE_MODULES}`,
  config: `../${CONFIG}`,
  get buildFolderAssets() {
    return `${this.buildFolder}/assets/`;
  },
  get htmlSrc() {
    return `${this.src}/html/`;
  },
  get imagesSrc() {
    return `${this.src}/assets/imgs/`;
  },
  get cssSrc() {
    return `${this.src}/assets/css/`;
  },
  get scssSrc() {
    return `${this.src}/assets/scss/`;
  },
  get fontsSrc() {
    return `${this.src}/assets/fonts/`;
  },
  get jsSrc() {
    return `${this.src}/assets/js/`;
  },
  get tailwindConfigSrc() {
    return "../tailwind.config.js";
  },
};

// JS Config
const jsConfig = {
  src: [`${dir.jsSrc}**/*.js`, `${dir.config}/workflow.config.js`],
  buildFolder: `${dir.buildFolderAssets}js/`,
};

// Webpack Dev Task
function webpackDevAssets(cb) {
  return webpack(webpackDevConfig, (err, stats) => {
    if (err) {
      throw new gutil.PluginError("webpack", err);
    } else {
      // gutil.log("[webpackDevAssets]", stats.toString());
    }
    cb();
  });
}

// Webpack Prod Task
function webpackProdAssets(cb) {
  return webpack(webpackProdConfig, (err, stats) => {
    if (err) {
      throw new gutil.PluginError("webpack", err);
    } else {
      gutil.log("[webpackProdConfig]", stats.toString());
    }
    cb();
  });
}

// Images Config
const imgConfig = {
  src: `${dir.imagesSrc}**/*`,
  buildFolder: `${dir.buildFolderAssets}imgs/`,
};

// Images Task
async function images(cb) {
  const imagemin = await import("gulp-imagemin");

  const { gifsicle, mozjpeg, optipng, svgo } = imagemin;

  const {
    imageMinification: {
      gifsicleOptions,
      mozjpegOptions,
      optipngOptions,
      svgoOptions,
    },
  } = workFlowConfig;

  const minOpts = [
    gifsicle(gifsicleOptions),
    mozjpeg(mozjpegOptions),
    optipng(optipngOptions),
    svgo(svgoOptions),
  ];

  return src(imgConfig.src)
    .pipe(newer(imgConfig.buildFolder))
    .pipe(imagemin.default(minOpts))
    .pipe(size({ showFiles: true }))
    .pipe(dest(imgConfig.buildFolder))
    .on("end", cb);
}

// CSS Config
const cssConfig = {
  cssSrcFolder: dir.cssSrc,
  src: [`${dir.scssSrc}*.scss`, `${dir.scssSrc}**/*.scss`],
  buildFolder: `${dir.buildFolderAssets}css/`,
  sassOpts: {
    sourceMap: devBuild,
    imagePath: "/imgs/",
    precision: 3,
    errLogToConsole: true,
  },
  /*  postCSS: [
    postcssAssets({
      loadPaths: ["imgs/"],
      basePath: dir.buildFolder,
    }),
  ], */
};

// CSS Task
function css(cb) {
  return src(cssConfig.src, { since: lastRun(css) })
    .pipe(cached("css"))
    .pipe(dependents())
    .pipe(sourcemaps ? sourcemaps.init() : noop())
    .pipe(sass(cssConfig.sassOpts).on("error", sass.logError))
    .pipe(sourcemaps ? sourcemaps.write() : noop())
    .pipe(dest(cssConfig.cssSrcFolder))
    .pipe(postcss([tailwindcss("../tailwind.config.js"), autoprefixer]))
    .pipe(dest(cssConfig.buildFolder))
    .pipe(browserSync ? browserSync.reload({ stream: true }) : noop())
    .on("end", cb);
}

// SCSS to CSS Task
function scssToCSSProd(cb) {
  return src(cssConfig.src)
    .pipe(sass(cssConfig.sassOpts).on("error", sass.logError))
    .pipe(dest(cssConfig.buildFolder))
    .on("end", cb);
}

function cssPurge(cb) {
  return src(`${cssConfig.buildFolder}/core-styles.css`)
    .pipe(
      purgecss({
        content: [
          `${dir.buildFolder}/*.html`,
          `${dir.buildFolder}/assets/js/*.js`,
        ],
        safelist: ["theme-krajee-svg", "form-control-sm"],
      })
    )

    .pipe(dest(cssConfig.buildFolder))
    .on("end", cb);
}

function cssMinify(cb) {
  return src(`${cssConfig.buildFolder}*.css`)
    .pipe(
      cleanCSS({ debug: true, level: 2 }, (details) => {
        console.log(`${details.name}: ${details.stats.originalSize}`);
        console.log(`${details.name}: ${details.stats.minifiedSize}`);
      })
    )
    .pipe(dest(cssConfig.buildFolder))
    .on("end", cb);
}

// HTML Config
const htmlConfig = {
  src: `${dir.htmlSrc}`,
  buildFolder: `${dir.buildFolder}/`,
  htmlbeautifyOptions: { indentSize: 2 },
};

// HTML Task
function html(cb) {
  const dirents = fs.readdirSync(htmlConfig.src, {
    withFileTypes: true,
  });

  const getTemplateFileNames = () => {
    dirents.forEach((dirent) => {
      if (!dirent.isDirectory()) {
        return src(`${htmlConfig.src}${dirent.name}`)
          .pipe(
            fileinclude({
              prefix: "@@",
              basepath: "@file",
            })
          )
          .pipe(htmlbeautify(htmlConfig.htmlbeautifyOptions))
          .pipe(dest(htmlConfig.buildFolder));
      } else {
        if (dirent.name !== "partials") {
          let subfolderPathSrc = `${htmlConfig.src}${dirent.name}/`,
            subfolderPathbuildFolder = `${htmlConfig.buildFolder}${dirent.name}/`;

          let subfiles = fs.readdirSync(subfolderPathSrc, {
            withFileTypes: true,
          });
          subfiles.forEach((subfile) => {
            return src(`${subfolderPathSrc}${subfile.name}`)
              .pipe(
                fileinclude({
                  prefix: "@@",
                  basepath: "@file",
                })
              )
              .pipe(htmlbeautify(htmlConfig.htmlbeautifyOptions))
              .pipe(dest(`${subfolderPathbuildFolder}`));
          });
        }
      }
    });
  };

  getTemplateFileNames();

  cb();
}

// Dev Server
const syncConfig = {
  server: {
    baseDir: htmlConfig.buildFolder,
  },
  port: workFlowConfig.server.port,
  open: true,
};

function browserSyncCall(cb) {
  if (browserSync) browserSync.init(syncConfig, cb);
}

// Browser Reload
function serverReload(cb) {
  browserSync.reload();
  cb();
}

function watchChanges(cb) {
  // JS Watch
  watch(jsConfig.src, series(webpackDevAssets, serverReload));

  // Images Watch
  watch(imgConfig.src, series(images, serverReload));

  // CSS Gulp.Watch
  watch(cssConfig.src, series(css, serverReload));

  // HTML Watch
  watch(htmlConfig.src, series(html, css, serverReload));

  // Tailwind Config Watch
  watch(dir.tailwindConfigSrc, series(css, serverReload));

  cb();
}

// Gulp Development Mode Series
exports.develop = series(
  images,
  css,
  html,
  webpackDevAssets,
  browserSyncCall,
  watchChanges
);

// Gulp Production Mode Series
exports.production = series(
  images,
  html,
  scssToCSSProd,
  cssPurge,
  cssMinify,
  webpackProdAssets
);
