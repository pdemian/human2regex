/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */
"use strict";

import "./webpage/style.css";

import { Human2RegexLexer, Human2RegexLexerOptions } from "./lexer";
import { Human2RegexParser, Human2RegexParserOptions } from "./parser";

/*
$(function() {

});
*/

const lexer = new Human2RegexLexer(new Human2RegexLexerOptions(false));
const parser = new Human2RegexParser(new Human2RegexParserOptions(false));

const result = lexer.tokenize(`
// H2R supports // # and /**/ as comments
// A group is only captured if given a name. 
// You can use "and", "or", "not" to specify "[]" regex
// You can use "then" to combine match statements, however I find using multiple "match" statements easier to read

// exact matching means use a ^ and $ to signify the start and end of the string

using global and exact matching
create an optional group called protocol
	match "http"
	optionally match "s"
	match "://"
create a group called subdomain
	repeat
		match 1+ words
		match "."
create a group called domain
	match 1+ words or "_" or "-"
	match "."
	match a word
# port, but we don't care about it, so ignore it
optionally match ":" then 0+ digits
create an optional group called path
	repeat
		match "/"
		match 0+ words or "_" or "-"
create an optional group
	# we don't want to capture the '?', so don't name the group until afterwards
	match "?"
	create a group called query
		repeat
			match 1+ words or "_" or "-"
			match "="
			match 1+ words or "_" or "-"
create an optional group
	# fragment, again, we don't care, so ignore everything afterwards
	match "#"
	match 0+ any thing
`);


console.log(result.errors);

parser.input = result.tokens;
const regex = parser.parse();
console.log(JSON.stringify(regex, undefined, 4));
console.log(parser.errors);