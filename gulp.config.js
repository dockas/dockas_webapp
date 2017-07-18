/* globals __dirname */

let //lodash = require("lodash"),
    config = require("common-config");

module.exports = {
    appConfig: JSON.parse(JSON.stringify(config)),

    dest: __dirname+"/dist",

    src: {
        html: __dirname+"/src/index.pug",
        sitemap: __dirname+"/src/sitemap.xml",
        main_js: __dirname+"/src/main.js",
        js: [
            __dirname+"/src/**/*.js", 
            __dirname+"/src/**/*.jsx"
        ],
        assets: [
            __dirname+"/src/assets/icons/**/*",
            __dirname+"/darch/assets/**/*"
        ],
        images: [
            __dirname+"/src/assets/images/favicon.png",
            __dirname+"/src/assets/images/logo_400x88.png",
            __dirname+"/src/assets/images/background.jpg"
        ],
        i18n: [
            __dirname+"/src/assets/i18n/**/*"
        ]
    },

    vendor: {
        css: [],
        assets: [],
        modules: [
            "babel-polyfill",
            "config",
            "react",
            "react-dom",
            "react-redux",
            "react-router-dom",
            "lodash",
            "moment",
            "darch/src"
        ]
    }
};
