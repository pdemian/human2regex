/* eslint-disable func-style */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const path = require("path");
const { glob } = require("glob");
const { readFileSync, writeFileSync, existsSync, mkdirSync } = require("fs");
const { minify } = require("html-minifier");
const CopyPlugin = require("copy-webpack-plugin");
const Handlebars = require("handlebars");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const WebpackBeforeBuildPlugin = require("before-build-webpack");
const TerserPlugin = require("terser-webpack-plugin");
const RemovePlugin = require("remove-files-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const config = require("./config.json");

// todo: if I'm bored, make this a plugin for webpack so it gets "emitted"
function buildHandlebars() {
    if (!existsSync(config.dst)){
		mkdirSync(config.dst);
    }

    const files = glob.sync(path.join(config.src, "docs", "*.hbs"));

    const context = {
        build: {
            prod: config.prod,
            year: String(new Date().getFullYear())
        }
    };
    
    // helper functions
    const compressHtml = (input) => config.prod ? minify(input, config.compression_config.html) : input;

    Handlebars.registerHelper("i-code", () => new Handlebars.SafeString('<code class="cm-s-idea">'));
    Handlebars.registerHelper("s-code", () => new Handlebars.SafeString('<span class="tutorial-code"><code class="cm-s-idea">'));
    Handlebars.registerHelper("p-code", () => new Handlebars.SafeString('<pre class="tutorial-code"><code class="cm-s-idea">'));

    Handlebars.registerHelper("end-i-code", () => new Handlebars.SafeString("</code>"));
    Handlebars.registerHelper("end-s-code", () => new Handlebars.SafeString("</code></span>"));
    Handlebars.registerHelper("end-p-code", () => new Handlebars.SafeString("</code></pre>"));

    // get partials
    Handlebars.registerPartial("header", readFileSync(path.join(config.src, "docs", "partials", "header.hbs"), "utf8"));
    Handlebars.registerPartial("footer", readFileSync(path.join(config.src, "docs", "partials", "footer.hbs"), "utf8"));
    Handlebars.registerPartial("example_code", readFileSync(path.join(config.src, "docs", "partials", "example_code.hbs"), "utf8"));
    
    // build handlebar files
    for (const file of files) {
        const filename = path.basename(file);
        const to = path.join(config.dst, path.basename(filename, ".hbs") + ".html");
        const template = readFileSync(path.join(config.src, "docs", filename), "utf8");
        const html = Handlebars.compile(template)(context);

        writeFileSync(to, compressHtml(html));
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
        minimizer: [ 
			new TerserPlugin(
				{
					extractComments: false,
					parallel: true
				}
			), 
			new OptimizeCSSAssetsPlugin({}) ]
    },
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },
    plugins: [
        new CleanWebpackPlugin({verbose:true, protectWebpackAssets: false}),
        new CopyPlugin({
            patterns: [
                { from: config.src + "docs/" + "assets/" + "!(*.css|*.hbs)", to: "", flatten: true}
            ]
        }),
        new MiniCssExtractPlugin({ filename: "bundle.min.css" }),
        new WebpackBeforeBuildPlugin(function(_, callback) {
            buildHandlebars();
            callback();
        }, [ "done" ]),
		new RemovePlugin({
			after: {
				root: "./lib",
				include: [
					"script.d.ts"
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