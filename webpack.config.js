const nodeExternals = require("webpack-node-externals");
const webpack = require("webpack");

module.exports = {
    target: "node",
    externals: [nodeExternals()],
    entry: "./src/cli",
    output: {
        path: __dirname + "/bin",
        filename: "index.js"
    },
    plugins: [
        new webpack.BannerPlugin({banner: "#!/usr/bin/env node", raw: true})
    ]
};