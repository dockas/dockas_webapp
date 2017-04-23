let lodash          = require("lodash"),
    path            = require("path"),
    baseConfig      = require("./base.config");

// Merge with base config
let config = lodash.merge({}, baseConfig, {});

// Export config
module.exports = config;