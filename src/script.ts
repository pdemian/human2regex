/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */
"use strict";

import { Human2RegexLexer, Human2RegexLexerOptions } from "./lexer";
import { Human2RegexParser, Human2RegexParserOptions } from "./parser";
import { RegexDialect } from "./generator";
import { CommonError, usefulConditional, unusedParameter } from "./utilities";
import cm from "codemirror/lib/codemirror";
import "codemirror/addon/mode/simple";
import "codemirror/addon/runmode/runmode";
import "codemirror/addon/lint/lint";

import "./docs/bootstrap.css";
import "./docs/cleanblog.css";
import "./docs/codemirror.css";
import "./docs/style.css";

interface CodeMirror {
	defineSimpleMode: (name: string, value: Record<string, unknown>) => void;
	runMode: (text: string, name: string, element: HTMLElement) => void;
	fromTextArea: (element: HTMLElement, value: Record<string, unknown>) => CodeMirrorEditor;
	registerHelper: (what: string, value: string, callback: (text: string) => CodeMirrorLintError[]) => void;
	Pos: (line: number, column: number) => number;
}

interface CodeMirrorEditor {
	on: (event_name: string, event: () => void) => void;
	getValue: () => string;
}

interface CodeMirrorLintError {
	from: number,
	to: number,
	message: string
}

const code_mirror = cm as CodeMirror;

document.addEventListener("DOMContentLoaded", function() {
	code_mirror.defineSimpleMode("human2regex", {
		start: [
			{token: "number", regex: /zero|one|two|three|four|five|six|seven|eight|nine|ten/i},
			{token: "qualifier", regex: /(optional(ly)?|possibl[ye]|maybe)/i},
			{token: "builtin", regex: /matching/i},
			{token: "keyword", regex: /match(es)?/i},
			{token: "operator", regex: /then/i},
			{token: "operator", regex: /not|anything but|any thing but|everything but|every thing but/i},
			{token: "builtin", regex: /(any thing|any|anything)(s)?/i},
			{token: "operator", regex: /or/i},
			{token: "operator", regex: /and|,/i},
			{token: "builtin", regex: /unicode( class)?/i},
			{token: "builtin", regex: /(word )?boundary/i},
			{token: "builtin", regex: /word(s)?/i},
			{token: "builtin", regex: /digit(s)?/i},
			{token: "builtin", regex: /character(s)?/i},
			{token: "builtin", regex: /letter(s)?/i},
			{token: "builtin", regex: /decimal(s)?/i},
			{token: "builtin", regex: /integer(s)?/i},
			{token: "builtin", regex: /(white space|whitespace)(s)?/i},
			{token: "builtin", regex: /number(s)?/i},
			{token: "keyword", regex: /using/i},
			{token: "builtin", regex: /global/i},
			{token: "builtin", regex: /(multi line|multiline)/i},
			{token: "builtin", regex: /exact/i},
			{token: "keyword", regex: /between/i},
			{token: "builtin", regex: /tab/i},
			{token: "builtin", regex: /(line feed|linefeed)/i},
			{token: "keyword", regex: /group/i},
			{token: "keyword", regex: /a(n)?/i},
			{token: "keyword", regex: /times/i},
			{token: "keyword", regex: /exact(ly)?/i},
			{token: "keyword", regex: /inclusive(ly)?/i},
			{token: "keyword", regex: /exclusive(ly)?/i},
			{token: "keyword", regex: /from/i},
			{token: "keyword", regex: /(to|through|thru|\-|\.\.\.?)/i},
			{token: "keyword", regex: /create(s)?/i},
			{token: "keyword", regex: /name(d)?|call(ed)?/i},
			{token: "keyword", regex: /repeat(s|ing)?/i},
			{token: "builtin", regex: /(new line|newline)/i},
			{token: "builtin", regex: /carriage return/i},
			{token: "builtin", regex: /case insensitive/i},
			{token: "builtin", regex: /case sensitive/i},
			{token: "operator", regex: /\+|or more/i},
			{token: "variable", regex: /[a-z]\w*/i},
			{token: "number", regex: /\d+/},
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

	const $regex = document.getElementById("regex") as HTMLTextAreaElement | null;
	const $dialect = document.getElementById("dialect") as HTMLSelectElement | null;
	const $clip = document.getElementById("clip");
	const $human = document.getElementById("human");
	const $errors = document.getElementById("errors");
	const $code = document.getElementsByTagName("code");

	// highlight all <code> elements on page
	// eslint-disable-next-line @typescript-eslint/prefer-for-of
	for (let i = 0; i < $code.length; i++) {
		code_mirror.runMode($code[i].innerText, "human2regex", $code[i]);
	}

	// We're not on index
	if (!$regex || !$dialect || !$clip || !$human || !$errors) {
		return;
	}

	const lexer = new Human2RegexLexer(new Human2RegexLexerOptions(true));
	const parser = new Human2RegexParser(new Human2RegexParserOptions(true));
	let total_errors: CommonError[] = [];
	let regex_result: string = "";
	let dialect = RegexDialect.JS;

	code_mirror.registerHelper("lint", "human2regex", lint);

	function lint(text: string): CodeMirrorLintError[] {
		unusedParameter(text, "Text is not needed in this instance as we do no parsing");

		const errs : CodeMirrorLintError[] = [];

		for (const error of total_errors) {
			const from = code_mirror.Pos(error.start_line-1, error.start_column-1);
			const to = code_mirror.Pos(error.start_line-1, error.start_column-1 + error.length);
		
			errs.push({from: from, to: to, message: error.message});
		}

		return errs;
	}

	function mapDialect(value: string | string[] | number | undefined): RegexDialect {
		switch (value) {
			case "dotnet":
				return RegexDialect.DotNet;
			case "java":
				return RegexDialect.Java;
			case "pcre":
				return RegexDialect.PCRE;
			case "python":
				return RegexDialect.Python;
			default:
				return RegexDialect.JS;
		}
	}

	function empty(element: HTMLElement): void {
		while (element.firstChild) {
			element.removeChild(element.firstChild);
		}
	}

	function runH2R(text: string): void {
		if (!$errors || !$regex) {
			return;
		}

		empty($errors);

		$errors.appendChild(document.createTextNode("Compiling..."));

		total_errors = [];
		const result = lexer.tokenize(text);

		result.errors.forEach((x) => total_errors.push(x));

		if (total_errors.length === 0) {
			const regex = parser.parse(result.tokens);
			parser.errors.map(CommonError.fromParseError).forEach((x) => total_errors.push(x));
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (total_errors.length === 0) {
				const validate = regex.validate(dialect);
				validate.forEach((x) => total_errors.push(x));

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (total_errors.length === 0) {
					regex_result = regex.toRegex(dialect);

					$regex.setAttribute("value", regex_result);
				}
			}
		}

		empty($errors);

		for (const error of total_errors) {
			$errors.appendChild(document.createTextNode(`${error.toString()}\n`));
		}
	}



	const editor = code_mirror.fromTextArea($human, {
		mode: "human2regex",
		lineNumbers: false,
		indentUnit: 4,
		viewportMargin: Infinity,
		theme: "idea",
		lint: true
	});

	editor.on("change", () => {
		runH2R(editor.getValue());
	});

	$dialect.addEventListener("change", () => {
		const index = $dialect.selectedIndex;
		const value = $dialect.options[index].value;

		dialect = mapDialect(value);

		runH2R(editor.getValue());
	});

	$clip.addEventListener("click", () => {
		// prefer to use writeText, but "emulate" selecting all, even though it isn't required
		$regex.select();

		if (window.isSecureContext && 
			usefulConditional(navigator.clipboard, "clipboard may be undefined") &&
			usefulConditional(navigator.clipboard.writeText, "writeText may be undefined")) {
			navigator.clipboard.writeText(regex_result);
		}
		else {
			document.execCommand("copy");
		}
	});

	//run what's currently in the textarea to initialize
	runH2R(editor.getValue());
});