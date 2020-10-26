/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    mode: "development",
    entry: path.resolve("./src/", "script.ts"),
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [ MiniCssExtractPlugin.loader, "css-loader" ]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({ filename: "bundle.min.css" }),
    ],
    resolve: {
        extensions: [ ".ts", ".js" ]
    },
    output: {
        filename: "bundle.min.js",
        path: path.resolve("docs")
    }
};