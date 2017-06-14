var path                = require("path"),
    webpack             = require("webpack"),
    config              = require("../gulp.config");

module.exports = {
    entry: {
        main: [config.src.main_js],
        vendor: [
            "babel-polyfill",
            "config",
            "react",
            "react-dom",
            "react-redux",
            "react-router",
            "darch/src"
        ]
    },
    output: {
        path: config.dest+"/assets/",
        publicPath: "/assets/",
        chunkFilename: "[chunkhash].js",
        filename: "[name].js"
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    "css-loader"
                ]
            },
            {
                test: /\.styl$/,
                use: [
                    "style-loader",
                    {loader: "css-loader", options: {
                        modules: true,
                        sourceMap: true,
                        camelCase: true,
                        localIdentName: "[hash:base64:5]"
                    }},
                    {loader: "stylus-loader", options: {
                        preferPathResolver: "webpack"
                    }}
                ]
            },

            {
                test: /\.(eot|ttf|woff|woff2|svg)$/,
                use: [
                    {loader: "url-loader", options: {
                        name: "/assets/fonts/[name].[ext]"
                    }}
                ]
            },

            {
                test: /.jsx?$/,
                enforce: "pre",
                exclude: /node_modules|lodash|config/,
                use: [
                    {loader: "eslint-loader", options: {
                        emitWarning: true
                    }}
                ]
            },

            {
                test: /.jsx?$/,
                exclude: /node_modules/,
                use: [
                    {loader: "babel-loader", options: {
                        presets: ["latest", "react"],
                        plugins: [
                            "autobind-class-methods",
                            "transform-class-properties",
                            "transform-export-extensions",
                            "add-module-exports"
                        ]
                    }}
                ]
            },

            {
                test: /\.(png|jpg)$/,
                use: [
                    {loader: "url-loader", options: {
                        limit: 8192,
                        //name: "images/[sha512:hash:base64:7].[ext]",
                        name: "images/[name].[ext]",
                        publicPath: "/assets/"
                    }}
                ]
            }
        ]
    },
    resolve: {
        modules: [
            path.resolve(__dirname, ".."),
            path.resolve(__dirname, "../src"),
            path.resolve(__dirname, "../darch/src"),
            path.resolve(__dirname, "../node_modules")
        ],
        extensions: [".js",".jsx",".styl",".png",".jpg",".css"]
    },
    node: {
        console: true,
        process: true,
        __filename: "mock",
        __dirname: "mock",
        fs: "empty",
        net: "empty",
        tls: "empty"
    },
    plugins: [
        new webpack.EnvironmentPlugin([
            "NODE_ENV"
        ]),
        new webpack.optimize.CommonsChunkPlugin({
            names: ["vendor"],
            filename: "common.js",
            minChunks: Infinity
        })
    ]
};