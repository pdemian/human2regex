/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

import { render } from 'mustache';
import { readFileSync, copyFileSync, writeFileSync } from 'fs';
import { emptyDirSync } from 'fs-extra';
import { minify } from 'html-minifier';
import { minify as uglify } from 'uglify-js';
import clean_css from 'clean-css';
import { config } from './config';

function join(...args: string[]): string {
	if(arguments.length == 0) return "";

	let result = args[0];

	for(let i = 1; i < args.length; i++) {
		const has_end_slash = result.endsWith('/');
		const has_start_slash = args[i].startsWith('/');

		if(has_end_slash && has_start_slash) {
			result += args[i].slice(1);
		}
		else if(has_end_slash || has_start_slash) {
			result += args[i];
		}
		else {
			result += '/' + args[i];
		}
	}

	return result;
}

function read_file(filename: string): string {
	return readFileSync(filename, 'utf8');
}

function read_json_file(filename: string): any {
	return JSON.parse(read_file(filename));
}

function compress_html(input: string): string {
    return config.prod ? minify(input, config.compression_config.html) : input;
}

function compress_js(input: string): string {
    return config.prod ? uglify(input, config.compression_config.js).code : input;
}

function compress_css(input: string): string {
    return config.prod ? (new clean_css(config.compression_config.css)).minify(input).styles : input;
}


function clean() {
    emptyDirSync(config.dst);
}

function build() {
    clean();

	// copy inconsequential files
	const copy_files = [ '/robots.txt', '/favicon.png', '/favicon.ico' ];
	for(const item of copy_files) {
		const from = join(config.src, item);
		const to = join(config.dst, item);

		copyFileSync(from, to);
	}


	// compress & copy files
	writeFileSync(join(config.dst, '/script.min.js'), compress_js(read_file(join(config.src, '/script.js'))));
	writeFileSync(join(config.dst, '/style.min.css'), compress_css(read_file(join(config.src, '/style.css'))));

	// get partials
	let partials = {
		header: read_file(join(config.src, '/header.mustache')),
		footer: read_file(join(config.src, '/footer.mustache'))
	};


	// build mustache files
	writeFileSync(
		join(config.dst, 'index.html'), 
		compress_html(
			render(
				join(config.src, '/index.mustache'), 
				read_json_file(join(config.src, '/main/index.json')))));

	const error_files = [ '400', '401', '404', '501' ];
	for(const item of error_files) {
		writeFileSync(
			join(config.dst, item + '.html'), 
			compress_html(
				render(
					join(config.src, '/error.mustache'), 
					read_json_file(join(config.src, '/error/' + item + '.json')))));
	}
}

build();