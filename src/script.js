/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */
"use strict";
const keywords = [
    "optional", "optionally", "match", "then", "any", "of", "or", "word", "digit", "unicode", "character",
    "multiple", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "anything",
    "whitespace", "as", "number", "if", "starts", "with", "ends", "otherwise", "else", "unless", "while", "more",
    "using", "global", "and", "multiline", "exact", "matching", "not", "between", "tab", "linefeed", "carriage", "return",
    "group", "by", "exactly", "inclusive", "inclusively", "exclusive", "exclusively", "including", "from", "to"
];
var TokenType;
(function (TokenType) {
    TokenType[TokenType["END_OF_STATEMENT"] = 0] = "END_OF_STATEMENT";
    TokenType[TokenType["INDENT"] = 1] = "INDENT";
    TokenType[TokenType["BETWEEN"] = 2] = "BETWEEN";
    TokenType[TokenType["QUOTE"] = 3] = "QUOTE";
    TokenType[TokenType["KEYWORD_BETWEEN"] = 4] = "KEYWORD_BETWEEN";
    TokenType[TokenType["KEYWORD_OPTIONAL"] = 5] = "KEYWORD_OPTIONAL";
    TokenType[TokenType["KEYWORD_MATCH"] = 6] = "KEYWORD_MATCH";
    TokenType[TokenType["KEYWORD_THEN"] = 7] = "KEYWORD_THEN";
    TokenType[TokenType["KEYWORD_AND"] = 8] = "KEYWORD_AND";
    TokenType[TokenType["KEYWORD_OR"] = 9] = "KEYWORD_OR";
    TokenType[TokenType["KEYWORD_ANY"] = 10] = "KEYWORD_ANY";
    TokenType[TokenType["KEYWORD_OF"] = 11] = "KEYWORD_OF";
})(TokenType || (TokenType = {}));
class Token {
    constructor(type, token_string) {
        this.type = type;
        this.token_string = token_string;
    }
}
class TokenizerOptions {
    constructor() {
        this.convert_spaces_to_tabs = false;
    }
}
/* Basic Tokenizer: To be replaced with a unicode variant later */
function tokenize(input, options) {
    let tokens = [];
    let errors = [];
    for (let i = 0; i < input.length; i++) {
        // 4 spaces = 1 tab. That is final. Debate over
        if (options.convert_spaces_to_tabs && input.startsWith("    ", i)) {
            tokens.push(new Token(TokenType.INDENT));
            i += 3;
        }
        // between (ex: 0...3 or 0-3)
        else if (input.startsWith("...", i)) {
            tokens.push(new Token(TokenType.BETWEEN));
            i += 2;
        }
        else if (input.startsWith("..", i)) {
            tokens.push(new Token(TokenType.BETWEEN));
            i += 1;
        }
        // comments
        else if (input.startsWith("//", i)) {
            i += 1;
            while (i < input.length) {
                if (input[i] == '\n') {
                    tokens.push(new Token(TokenType.END_OF_STATEMENT));
                    break;
                }
                i++;
            }
        }
        else if (input.startsWith("\r\n", i)) {
            tokens.push(new Token(TokenType.END_OF_STATEMENT));
            i += 1;
        }
        else {
            switch (input[i]) {
                // comment
                case '#':
                    i++;
                    while (i < input.length) {
                        if (input[i] == '\n') {
                            tokens.push(new Token(TokenType.END_OF_STATEMENT));
                            break;
                        }
                        i++;
                    }
                    break;
                // quote
                case '"':
                case '\"':
                    // build up a word between quotes
                    const quote_char = input[i];
                    let found_ending = false;
                    let quote = "";
                    do {
                        i++;
                        if (input[i] == quote_char) {
                            found_ending = true;
                            break;
                        }
                        else if (input[i] == '\n') {
                        }
                    } while (i < input.length);
                    if (found_ending) {
                        tokens.push(new Token(TokenType.QUOTE, quote));
                    }
                    else {
                        // Skip until newline and throw an error
                    }
                    break;
                // between (ex: 0...3 or 0-3)
                case '-':
                    tokens.push(new Token(TokenType.BETWEEN));
                    break;
                case '\n':
                    tokens.push(new Token(TokenType.END_OF_STATEMENT));
                    break;
                case '\r':
                    // ignore
                    break;
                case '\t':
                    tokens.push(new Token(TokenType.INDENT));
                    break;
                case ' ':
                    break;
                default:
                    // is digit? build up a number
                    // is char? build up a word
                    keywords.includes("word");
                    // build up a word
                    break;
            }
        }
    }
    return { tokens: tokens, errors: errors };
}
/*
String.prototype.escape = function() {
    var tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };
    return this.replace(/[&<>]/g, function(tag) {
        return tagsToReplace[tag] || tag;
    });
};
String.prototype.norm = function() {
    if(String.prototype.normalize != undefined) {
        return this.normalize("NFD").replace(/[\u0300-\u036F]/g,"");
    }
    return this;
};

*/
$(function () {
});
