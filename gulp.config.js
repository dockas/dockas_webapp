let lodash = require('lodash'),
    config = require('common-config');

module.exports = {
    appConfig: JSON.parse(JSON.stringify(config)),

    dest: './dist',

    src: {
        html: './src/index.pug',
        sitemap: './src/sitemap.xml',
        main_js: './src/main.jsx',
        js: ['./src/**/*.js', './src/**/*.jsx'],
        assets: [
            './src/assets/icons/**/*',
            './darch/assets/**/*'
        ],
        images: ['./src/assets/images/favicon.png'],
        i18n: ['./src/assets/i18n/**/*']
    },

    vendor: {
        css: [],
        assets: []
    }
};
