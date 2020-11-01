/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */
"use strict";

import { Human2RegexLexer, Human2RegexLexerOptions } from "./lexer";
import { Human2RegexParser, Human2RegexParserOptions } from "./parser";
import { RobotLanguage } from "./generator";
import { lexErrorToCommonError, parseErrorToCommonError, semanticErrorToCommonError, ICommonError } from "./utilities";
import $ from "jquery";

import "./webpage/bootstrap.css";
import "./webpage/cleanblog.css";
import "./webpage/style.css";



$(function() {
	const total_errors: ICommonError[] = [];
	const lexer = new Human2RegexLexer(new Human2RegexLexerOptions(true));
	const parser = new Human2RegexParser(new Human2RegexParserOptions(true));
	const result = lexer.tokenize($("#human").text());

	result.errors.map(lexErrorToCommonError).forEach((x) => total_errors.push(x));

	if (total_errors.length === 0) {
		parser.input = result.tokens;
	
		const regex = parser.parse();
	
		parser.errors.map(parseErrorToCommonError).forEach((x) => total_errors.push(x));
	
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
		
		valid.map(semanticErrorToCommonError).forEach((x) => total_errors.push(x));
	
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (total_errors.length === 0) {
			const r = regex.toRegex(lang);
			$("#regex").attr("value", r);
		}
	}
	
	console.log("Errors = " + total_errors);

	$("#dialect").on("selectionchanged", () => {
		//do something
	});

	$("#human").on("input", () => {
		//do something
	});
});




