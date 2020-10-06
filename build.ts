/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

import { render } from 'mustache';
import { readFileSync, copyFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { emptyDirSync } from 'fs-extra';
import { minify } from 'html-minifier';
import { basename } from 'path';
import { minify as uglify } from 'uglify-es';
import clean_css from 'clean-css';
import { glob } from 'glob';
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
	if(!existsSync(config.dst)) {
		mkdirSync(config.dst);
	}

    clean();

	// get build files
	const copy_files = glob.sync(join(config.src, "!(*.js|*.css|*.mustache|*.ts)"), {nodir: true });
	const css_files = glob.sync(join(config.src, "*.css"));
	const js_files = glob.sync(join(config.src, "*.js"));
	const main_files = glob.sync(join(config.src, 'main', '*.json'));
	const error_files = glob.sync(join(config.src, 'error', '*.json'));

	// get partials
	const partials = {
		header: read_file(join(config.src, '/header.mustache')),
		footer: read_file(join(config.src, '/footer.mustache'))
	};

	// copy inconsequential files
	for(const item of copy_files) {
		const filename = basename(item);
		const from = join(config.src, filename);
		const to = join(config.dst, filename);

		copyFileSync(from, to);
	}

	// compress & copy css files
	for(const item of css_files) {
		const filename = basename(item, '.css');
		const from = join(config.src, filename + '.css');
		const to = join(config.dst, filename + '.min.css');

		writeFileSync(to, compress_css(read_file(from)));
	}

	// compress & copy js files
	for(const item of js_files) {
		const filename = basename(item, '.js');
		const from = join(config.src, filename + '.js');
		const to = join(config.dst, filename + '.min.js');

		writeFileSync(to, compress_js(read_file(from)));
	}

	// build main mustache files
	for(const item of main_files) {
		const filename = basename(item, '.json');
		const view = read_json_file(item);
		const to = join(config.dst, filename + '.html');
		const template = read_file(join(config.src, filename + '.mustache'));

		writeFileSync(to, compress_html(render(template, view, partials)));
	}

	// build error mustache files	
	for(const item of error_files) {
		const filename = basename(item, '.json');
		const view = read_json_file(item);
		const to = join(config.dst, filename + '.html');
		const template = read_file(join(config.src, '/error.mustache'));

		writeFileSync(to, compress_html(render(template, view, partials)));
	}
}

build();