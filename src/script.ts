"use strict";

import "./style.css";

import { TokenizerOptions, tokenize } from "./tokenizer";
import { ParserOptions, parse } from "./parser";

/*
$(function() {

});
*/

const opts = new TokenizerOptions();
const res = tokenize("match 1+ thing from thingy", opts);

console.log(res);