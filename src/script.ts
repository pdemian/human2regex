/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */
"use strict";

import { Human2RegexLexer, Human2RegexLexerOptions } from "./lexer";
import { Human2RegexParser, Human2RegexParserOptions } from "./parser";
import { RegexDialect } from "./generator";
import { CommonError, unusedParameter, usefulConditional } from "./utilities";
import $ from "jquery";
import CodeMirror from "codemirror/lib/codemirror";
import "codemirror/addon/mode/simple";
import "codemirror/addon/runmode/runmode";

import "./webpage/bootstrap.css";
import "./webpage/cleanblog.css";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/idea.css";
import "./webpage/style.css";

$(function() {
	CodeMirror.defineSimpleMode("human2regex", {
		start: [
			{token: "number", regex: /zero/i},
			{token: "number", regex: /one/i},
			{token: "number", regex: /two/i},
			{token: "number", regex: /three/i},
			{token: "number", regex: /four/i},
			{token: "number", regex: /five/i},
			{token: "number", regex: /six/i},
			{token: "number", regex: /seven/i},
			{token: "number", regex: /eight/i},
			{token: "number", regex: /nine/i},
			{token: "number", regex: /ten/i},
			{token: "qualifier", regex: /optional(ly)?/i},
			{token: "builtin", regex: /matching/i},
			{token: "keyword", regex: /match(es)?/i},
			{token: "operator", regex: /then/i},
			{token: "builtin", regex: /(any thing|any|anything)(s)?/i},
			{token: "operator", regex: /or/i},
			{token: "operator", regex: /and|,/i},
			{token: "builtin", regex: /word(s)?/i},
			{token: "builtin", regex: /digit(s)?/i},
			{token: "builtin", regex: /character(s)?/i},
			{token: "builtin", regex: /(white space|whitespace)(s)?/i},
			{token: "builtin", regex: /number(s)?/i},
			{token: "keyword", regex: /using/i},
			{token: "builtin", regex: /global/i},
			{token: "builtin", regex: /(multi line|multiline)/i},
			{token: "builtin", regex: /exact/i},
			{token: "operator", regex: /not/i},
			{token: "operator", regex: /between/i},
			{token: "builtin", regex: /tab/i},
			{token: "builtin", regex: /(line feed|linefeed)/i},
			{token: "keyword", regex: /group/i},
			{token: "keyword", regex: /a(n)?/i},
			{token: "keyword", regex: /times/i},
			{token: "keyword", regex: /exact(ly)?/i},
			{token: "keyword", regex: /inclusive(ly)?/i},
			{token: "keyword", regex: /exclusive(ly)?/i},
			{token: "keyword", regex: /from/i},
			{token: "keyword", regex: /(to|through|thru|\-|\.\.|\.\.\.)/i},
			{token: "keyword", regex: /create(s)?/i},
			{token: "keyword", regex: /name(d)?|call(ed)?/i},
			{token: "keyword", regex: /repeat(s|ing)?/i},
			{token: "builtin", regex: /(new line|newline)/i},
			{token: "builtin", regex: /carriage return/i},
			{token: "builtin", regex: /case insensitive/i},
			{token: "builtin", regex: /case sensitive/i},
			{token: "operator", regex: /\+|or more/i},
			{token: "variable", regex: /[a-z]\w*/i},
			{token: "number", regex: /-?\d+/},
			{token: "string", regex: /"(?:[^\\"]|\\(?:[bfnrtv"\\/]|u[0-9a-f]{4}|U[0-9a-f]{8}))*"/i},
			{token: "comment", regex: /(#|\/\/).*/},
			{token: "comment", regex: /\/\*/, next: "comment"}
		],
		comment: [
			{regex: /.*?\*\//, token: "comment", next: "start"},
			{regex: /.*/, token: "comment"}
		],
		meta: {
			dontIndentStates: [ "comment" ],
			lineComment: "//",
			blockComment: [ "/*", "*/" ]
		}
	});

	const $regex = $("#regex");
	const $dialect = $("#dialect");
	const $clip = $("#clip");
	const $human = $("#human");
	const $errors = $("#errors");

	// We're not on index
	if (!$regex.length || !$human.length) {
		return;
	}

	const lexer = new Human2RegexLexer(new Human2RegexLexerOptions(true));
	const parser = new Human2RegexParser(new Human2RegexParserOptions(true));
	let regex_result: string = "";
	let dialect = RegexDialect.JS;

	function mapDialect(value: string | string[] | number | undefined): RegexDialect {
		switch (value) {
			case "dotnet":
				return RegexDialect.DotNet;
			case "java":
				return RegexDialect.Java;
			case "pcre":
				return RegexDialect.PCRE;
			default:
				return RegexDialect.JS;
		}
	}

	function runH2R(text: string): void {
		$errors.empty();
		$errors.append("Compiling...");

		const total_errors: CommonError[] = [];
		const result = lexer.tokenize(text);

		result.errors.map(CommonError.fromLexError).forEach((x) => total_errors.push(x));

		if (total_errors.length === 0) {
			parser.input = result.tokens;
			const regex = parser.parse();
			parser.errors.map(CommonError.fromParseError).forEach((x) => total_errors.push(x));
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (total_errors.length === 0) {
				const validate = regex.validate(dialect);
				validate.map(CommonError.fromSemanticError).forEach((x) => total_errors.push(x));

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (total_errors.length === 0) {
					regex_result = regex.toRegex(dialect);

					$regex.attr("value", regex_result);
				}
			}
		}

		$errors.empty();
		for (const error of total_errors) {
			$errors.append(`${error.toString()}\n`);
		}
	}


	$dialect.on("change", () => {
		dialect = mapDialect($("#dialect option:selected").val());
	});

	$clip.on("click", () => {
		// prefer to use writeText, but "emulate" selecting all, even though it isn't required
		const text = $regex[0] as unknown as { select: () => void };
		text.select();

		if (window.isSecureContext && 
			usefulConditional(navigator.clipboard, "clipboard may be undefined") &&
			usefulConditional(navigator.clipboard.writeText, "writeText may be undefined")) {
			navigator.clipboard.writeText(regex_result);
		}
		else {
			document.execCommand("copy");
		}
	});

	const editor = CodeMirror.fromTextArea($human[0], {
		mode: {name: "human2regex"},
		lineNumbers: false,
		indentUnit: 4,
		viewportMargin: Infinity
	});

	editor.on("change", (instance: unknown, change_obj: unknown) => {
		unusedParameter(instance, "Instance is not required, we have a reference already");
		unusedParameter(change_obj, "Change is not required, we want the full value");

		runH2R(editor.getValue());
	});

	//run what's currently in the textarea to initialize
	runH2R(editor.getValue());

	for (const code of $("code")) {
		CodeMirror.runMode(code.innerText, {name: "human2regex"}, code);
	}
});