let lodash          = require("lodash"),
    baseConfig      = require("./base.config");

// Merge with base config
let config = lodash.merge({}, baseConfig, {
    watch: true,
    watchOptions: {
        poll: true,
        aggregateTimeout: 1000
    },
    devtool: "source-map"
});

// Export config
module.exports = config;