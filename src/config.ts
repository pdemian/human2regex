/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

export const config = {
	prod: true,
	deploy: false,
	dst: "../build/",
    src: "../src/",
    compression_config: {
		html: {
			collapseWhitespace: true, 
			minifyCSS: true, 
			minifyJS: true, 
			removeComments: true, 
			removeEmptyAttributes: true, 
			removeRedundantAttributes: true
		},

		js: {
			output: {
				comments: /^!/
			}
		},

		css: {
		}
    }
};