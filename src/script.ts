/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */
"use strict";

import { Human2RegexLexer, Human2RegexLexerOptions } from "./lexer";
import { Human2RegexParser, Human2RegexParserOptions } from "./parser";
import { RobotLanguage } from "./generator";
import { CommonError } from "./utilities";
import $ from "jquery";
import CodeMirror from "codemirror/lib/codemirror";
require("codemirror/mode/javascript/javascript");

import "./webpage/bootstrap.css";
import "./webpage/cleanblog.css";
import "codemirror/lib/codemirror.css";
import "./webpage/style.css";


$(function() {
	const total_errors: CommonError[] = [];
	const lexer = new Human2RegexLexer(new Human2RegexLexerOptions(true));
	const parser = new Human2RegexParser(new Human2RegexParserOptions(true));
	const result = lexer.tokenize($("#human").text());

	result.errors.map(CommonError.fromLexError).forEach((x) => total_errors.push(x));

	let regex_result = "";

	if (total_errors.length === 0) {
		parser.input = result.tokens;
	
		const regex = parser.parse();
	
		parser.errors.map(CommonError.fromParseError).forEach((x) => total_errors.push(x));
	
		let lang: RobotLanguage = RobotLanguage.JS;
		switch ($("#dialect option:selected").val()) {
			case "dotnet":
				lang = RobotLanguage.DotNet;
				break;
			case "java":
				lang = RobotLanguage.Java;
				break;
			case "perl":
				lang = RobotLanguage.Perl;
				break;
			default:
				lang = RobotLanguage.JS;
				break;
		}

		const valid = regex.validate(lang);
		
		valid.map(CommonError.fromSemanticError).forEach((x) => total_errors.push(x));
	
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (total_errors.length === 0) {
			regex_result = regex.toRegex(lang);
			$("#regex").attr("value", regex_result);
		}
	}
	
	$("#errors").empty();

	for (const error of total_errors) {
		$("#errors").append(`${error.toString()}\n`);
	}

	console.log("Errors = " + total_errors);

	$("#dialect").on("selectionchanged", () => {
		//do something
	});

	$("#human").on("input", () => {
		//do something
	});

	$("#clip").on("click", () => {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (window.isSecureContext && navigator?.clipboard?.writeText) {
			navigator.clipboard.writeText(regex_result);
		}
		else {
			const text = document.getElementById("regex") as any;
			text.select();
			text.setSelectionRange(0, 10*10*10*10);
			document.execCommand("copy");
		}
	});

	const editor = CodeMirror.fromTextArea(document.getElementById("human"), {
		mode: {name: "javascript"},
		lineNumbers: false,
		indentUnit: 4,
		viewportMargin: Infinity
	});

	editor.on("change", (instance: unknown, change_obj: unknown) => {
		/* not empty */
		console.log(editor.getValue());
	});
});




