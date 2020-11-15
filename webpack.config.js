/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const path = require("path");
const { glob } = require("glob");
const { render } = require("mustache");
const { readFileSync, writeFileSync, existsSync, mkdirSync } = require("fs");
const { minify } = require("html-minifier");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const WebpackBeforeBuildPlugin = require("before-build-webpack");
const TerserPlugin = require("terser-webpack-plugin");
const RemovePlugin = require('remove-files-webpack-plugin');

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
	if (!existsSync(config.dst)){
		mkdirSync(config.dst);
	}

    const read_json_file = (filename) => JSON.parse(readFileSync(filename), "utf8");
    
    const compress_html = (input) =>  config.prod ? minify(input, config.compression_config.html) : input;

    // get views
    const files = glob.sync(path.join(config.src, "docs", "*.json"));

    // get partials
    const partials = {
        header: readFileSync(path.join(config.src, "docs", "header.mustache"), "utf8"),
        footer: readFileSync(path.join(config.src, "docs", "footer.mustache"), "utf8")
    };

    // build main mustache files
    for (const item of files) {
        const filename = path.basename(item, ".json");
        const view = read_json_file(item);
        const to = path.join(config.dst, filename + ".html");
        const template = readFileSync(path.join(config.src, "docs", filename + ".mustache"), "utf8");

        writeFileSync(to, compress_html(render(template, view, partials)));
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
		minimize: config.prod,
        minimizer: [ new TerserPlugin({cache: true, parallel: true}), new OptimizeCSSAssetsPlugin({}) ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: config.src + "docs/" + "!(*.css|*.mustache|*.json)", to: "", flatten: true}
            ]
        }),
        new MiniCssExtractPlugin({ filename: "bundle.min.css" }),
        new WebpackBeforeBuildPlugin(function(_, callback) {
            build_mustache();
            callback();
        }),
		new RemovePlugin({
			after: {
				root: "./lib",
				include: [
					"script.d.ts",
					"script.d.ts.map"
				]
			}
		})
    ],
    resolve: {
        extensions: [ ".ts", ".js" ]
    },
    output: {
        filename: "bundle.min.js",
        path: path.resolve(config.dst)
    }
};