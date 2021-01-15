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
const RemovePlugin = require('remove-files-webpack-plugin');

// Todo: Maybe move these values out to a config file or something
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


function build_handlebars() {
    if (!existsSync(config.dst)){
		mkdirSync(config.dst);
    }

    const files = [
        "404.hbs",
        "index.hbs",
        "tutorial.hbs"
    ];

    const context = {
        build: {
            prod: config.prod+"",
            year: new Date().getFullYear()+""
        }
    };
    
    // helper functions
    const compress_html = (input) => config.prod ? minify(input, config.compression_config.html) : input;

    Handlebars.registerHelper("i-code", function(options) {
        return new Handlebars.SafeString(`<code class="cm-s-idea">`);
    });

    Handlebars.registerHelper("s-code", function(options) {
        return new Handlebars.SafeString(`<span class="tutorial-code"><code class="cm-s-idea">`);
    });

    Handlebars.registerHelper("p-code", function(options) {
        return new Handlebars.SafeString(`<pre class="tutorial-code"><code class="cm-s-idea">`);
    });

    Handlebars.registerHelper("end-i-code", function(options) {
        return new Handlebars.SafeString('</code>');
    });

    Handlebars.registerHelper("end-s-code", function(options) {
        return new Handlebars.SafeString('</code></span>');
    });

    Handlebars.registerHelper("end-p-code", function(options) {
        return new Handlebars.SafeString('</code></pre>');
    });

    // get partials
    Handlebars.registerPartial("header", readFileSync(path.join(config.src, "docs", "header.hbs"), "utf8"));
    Handlebars.registerPartial("footer", readFileSync(path.join(config.src, "docs", "footer.hbs"), "utf8"));
    Handlebars.registerPartial("example_code", readFileSync(path.join(config.src, "docs", "example_code.hbs"), "utf8"));
    
    // build handlebar files
    for (const filename of files) {
        const to = path.join(config.dst, path.basename(filename, ".hbs") + ".html");
        const template = readFileSync(path.join(config.src, "docs", filename), "utf8");

        writeFileSync(to, compress_html(Handlebars.compile(template)(context)));
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
                { from: config.src + "docs/" + "!(*.css|*.hbs)", to: "", flatten: true}
            ]
        }),
        new MiniCssExtractPlugin({ filename: "bundle.min.css" }),
        new WebpackBeforeBuildPlugin(function(_, callback) {
            build_handlebars();
            callback();
        }),
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