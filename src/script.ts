"use strict";

import "./style.css";

import { TokenizerOptions, tokenize } from "./tokenizer";
import { ParserOptions, parse } from "./parser";

/*
$(function() {

});
*/

const opts = new TokenizerOptions();
const result = tokenize("match /* 9+ */ 1+ optionally 1..3 0-zero then //comment match", opts);

for(const r of result.tokens) {
    console.log(r.to_string());
}

console.log(result.errors);