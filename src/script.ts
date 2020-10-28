"use strict";

import "./style.css";

import { Human2RegexLexer } from "./tokenizer";
import { Human2RegexParser } from "./parser";


/*
$(function() {

});
*/

const lexer = new Human2RegexLexer();
const parser = new Human2RegexParser();

const result = lexer.tokenize(`
// H2R supports // # and /**/ as comments
// A group is only captured if given a name. 
// You can use "and", "or", "not" to specify "[]" regex
// You can use "then" to combine match statements, however I find using multiple "match" statements easier to read

// exact matching means use a ^ and $ to signify the start and end of the string

using global and exact matching
create an optional group called "protocol"
	match "http"
	optionally match "s"
	match "://"
create a group called "subdomain"
	repeat
		match 1+ words
		match "."
create a group called "domain"
	match 1+ words or "_" or "-"
	match "."
	match a word
# port, but we don't care about it, so ignore it
optionally match ":" then 0+ digits
create an optional group called "path"
	repeat
		match "/"
		match 0+ words or "_" or "-"
create an optional group
	# we don't want to capture the '?', so don't name the group until afterwards
	match "?"
	create a group called "query"
		repeat
			match 1+ words or "_" or "-"
			match "="
			match 1+ words or "_" or "-"
create an optional group
	# fragment, again, we don't care, so ignore everything afterwards
	match "#"
	match 0+ any thing
`);

for(const r of result.tokens) {
	console.log(`[${r.tokenType.name}]: ${r.image}`);
}

console.log(result.errors);

parser.input = result.tokens;
const regex = parser.nodes.regex;

console.log(regex);
console.log(parser.errors);


//interpreter.visit(regex);

//parser.getBaseCstVisitorConstructor();



