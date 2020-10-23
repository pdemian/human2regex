/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const path = require("path");
const { glob } = require("glob");
const { render } = require("mustache");
const { readFileSync, writeFileSync } = require("fs");
const { minify } = require("html-minifier");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const WebpackBeforeBuildPlugin = require("before-build-webpack");

const config = {
    prod: true,
    dst: "./docs/",
    src: "./src/",
    compression_config: {
        html: {
            collapseWhitespace: true, 
            minifyCSS: true, 
            minifyJS: true, 
            removeComments: true, 
            removeEmptyAttributes: true, 
            removeRedundantAttributes: true
        },
    }
};


function build_mustache() {

    read_json_file = (filename) => JSON.parse(readFileSync(filename), "utf8");
    
    compress_html = (input) =>  config.prod ? minify(input, config.compression_config.html) : input;

    // get views
    const main_files = glob.sync(path.join(config.src, "main", "*.json"));
    const error_files = glob.sync(path.join(config.src, "error", "*.json"));

    // get partials
    const partials = {
        header: readFileSync(path.join(config.src, "/header.mustache"), "utf8"),
        footer: readFileSync(path.join(config.src, "/footer.mustache"), "utf8")
    };

    // build main mustache files
    for(const item of main_files) {
        const filename = path.basename(item, ".json");
        const view = read_json_file(item);
        const to = path.join(config.dst, filename + ".html");
        const template = readFileSync(path.join(config.src, filename + ".mustache"), "utf8");

        writeFileSync(to, compress_html(render(template, view, partials)));
    }

    const error_template = readFileSync(path.join(config.src, "/error.mustache"), "utf8");

    // build error mustache files    
    for(const item of error_files) {
        const filename = path.basename(item, ".json");
        const view = read_json_file(item);
        const to = path.join(config.dst, filename + ".html");
        
        writeFileSync(to, compress_html(render(error_template, view, partials)));
    }
}

module.exports = {
    mode: config.prod ? "production" : "development",
    entry: path.resolve(config.src, "script.ts"),
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
    optimization: {
        minimizer: [ new OptimizeCSSAssetsPlugin({}) ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: config.src + "!(*.css|*.mustache|*.ts)", to: "", flatten: true}
            ]
        }),
        new MiniCssExtractPlugin({ filename: "bundle.min.css" }),
        new WebpackBeforeBuildPlugin(function(_, callback) {
            build_mustache();
            callback();
        }),
    ],
    resolve: {
        extensions: [ ".ts", ".js" ]
    },
    output: {
        filename: "bundle.min.js",
        path: path.resolve("docs")
    }
};