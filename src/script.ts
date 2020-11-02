/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */
"use strict";

import { Human2RegexLexer, Human2RegexLexerOptions } from "./lexer";
import { Human2RegexParser, Human2RegexParserOptions } from "./parser";
import { RegexDialect } from "./generator";
import { CommonError, unusedParameter, usefulConditional } from "./utilities";
import $ from "jquery";
import CodeMirror from "codemirror/lib/codemirror";
import "codemirror/mode/javascript/javascript";

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
	
		let lang: RegexDialect = RegexDialect.JS;
		switch ($("#dialect option:selected").val()) {
			case "dotnet":
				lang = RegexDialect.DotNet;
				break;
			case "java":
				lang = RegexDialect.Java;
				break;
			case "perl":
				lang = RegexDialect.Perl;
				break;
			default:
				lang = RegexDialect.JS;
				break;
		}

		const valid = regex.validate(lang);
		
		valid.map(CommonError.fromSemanticError).forEach((x) => total_errors.push(x));
	
		if (!usefulConditional(total_errors.length, "total_errors may have added an error")) {
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
		if (window.isSecureContext && 
			usefulConditional(navigator.clipboard, "clipboard may be undefined") &&
			usefulConditional(navigator.clipboard.writeText, "writeText may be undefined")) {
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
		unusedParameter(instance, "Instance is not required, we have a reference already");
		unusedParameter(change_obj, "Change is not required, we want the full value");

		/* not empty */
		console.log(editor.getValue());
	});
});




