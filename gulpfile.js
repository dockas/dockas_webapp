let gulp                = require("gulp"),
    gutil               = require("gulp-util"),
    file                = require("gulp-file"),
    pug                 = require("gulp-pug"),
    yaml                = require("gulp-yaml"),
    //lodash              = require("lodash"),
    del                 = require("del"),
    //path                = require("path"),
    webpack             = require("webpack"),
    config              = require("./gulp.config");

let statsOpts = {
    colors: gutil.colors.supportsColor,
    hash: false,
    timings: false,
    chunks: false,
    chunkModules: false,
    modules: false,
    children: true,
    version: true,
    cached: false,
    cachedAssets: false,
    reasons: false,
    source: false,
    errorDetails: false
};

let bundlerDoneCalled = {};

/****************************************************************
* Clean Tasks : remove destination folders
****************************************************************/
gulp.task("clean", function() {
    return del.sync([config.dest+"/*"]);
});

/****************************************************************
* Config Task : write config to config folder
****************************************************************/
gulp.task("config", function() {
    var str = ("module.exports = "+JSON.stringify(config.appConfig, null, 4));

    return file("index.js", str, { src: true })
    .pipe(gulp.dest("./config"));
});

/****************************************************************
* Assets Task : copy assets to dist
****************************************************************/
gulp.task("assets", function() {
    return gulp.src(config.src.assets)
    .pipe(gulp.dest(config.dest+"/assets"));
});

gulp.task("assets:images", function() {
    return gulp.src(config.src.images)
    .pipe(gulp.dest(config.dest+"/assets/images"));
});

/****************************************************************
* i18n Task : compile i18n yaml setups
****************************************************************/
gulp.task("i18n", function() {
    return gulp.src(config.src.i18n)
    .pipe(yaml({space: 4}))
    .pipe(gulp.dest(config.dest+"/assets/i18n"));
});

/****************************************************************
* Pug Task : compile pug templates
****************************************************************/
gulp.task("pug", function() {
    return gulp.src(config.src.html)
    .pipe(pug({
        locals: config.appConfig.siteinfo
    }))
    .pipe(gulp.dest(config.dest));
});

/****************************************************************
* Bundler Tasks : bundle all js files into one
****************************************************************/
gulp.task("bundler:dev", function(done) {
    webpack(require("./webpack/dev.config.js"), function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);

        gutil.log("[webpack]", stats.toString(statsOpts));

        if(!bundlerDoneCalled.dev){
            bundlerDoneCalled.dev = true;
            done();
        }
    });
});

gulp.task("bundler:stage", function(done) {
    webpack(require("./webpack/stage.config.js"), function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);

        gutil.log("[webpack]", stats.toString(statsOpts));

        if(!bundlerDoneCalled.stage){
            bundlerDoneCalled.stage = true;
            done();
        }
    });
});

gulp.task("bundler:prod", function(done) {
    webpack(require("./webpack/prod.config.js"), function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);

        gutil.log("[webpack]", stats.toString(statsOpts));

        if(!bundlerDoneCalled.prod){
            bundlerDoneCalled.prod = true;
            done();
        }
    });
});

/****************************************************************
* DEVELOPMENT TASK
****************************************************************/
gulp.task("development", [
    "bundler:dev"
], function() {
    gulp.watch(config.src.html, ["pug"]);
    gulp.watch(config.src.assets, ["assets"]);
    gulp.watch(config.src.i18n, ["i18n"]);
});

/****************************************************************
* STAGE TASK
****************************************************************/
gulp.task("stage", [
    "bundler:stage"
]);

/****************************************************************
* PRODUCTION TASK
****************************************************************/
gulp.task("production", [
    "bundler:prod"
]);

/****************************************************************
* DEFAULT TASK : Choose task by NODE_ENV
****************************************************************/
gulp.task("default", [
    "clean",
    "config",
    "pug",
    "assets",
    "assets:images",
    "i18n",
    process.env.NODE_ENV||"production"
]);
