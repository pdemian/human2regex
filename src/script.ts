/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

"use strict";

const keywords = [
    "optional", "optionally", "match", "then", "any", "of", "or", "word", "digit", "unicode", "character", 
    "multiple", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "anything",
    "whitespace", "as", "number", "if", "starts", "with", "ends", "otherwise", "else", "unless", "while", "more",
    "using", "global", "and", "multiline", "exact", "matching", "not", "between", "tab", "linefeed", "carriage", "return",
    "group", "by", "exactly", "inclusive", "inclusively", "exclusive", "exclusively", "including", "from", "to"
];

enum TokenType {
    END_OF_STATEMENT,
    INDENT,
    BETWEEN,
    QUOTE,
    KEYWORD_BETWEEN,
    KEYWORD_OPTIONAL,
    KEYWORD_MATCH,
    KEYWORD_THEN,
    KEYWORD_AND,
    KEYWORD_OR,
    KEYWORD_ANY,
    KEYWORD_OF,
}

class Token {
    constructor(public type: TokenType, public token_string?: string) {
        
    }
}

class TokenizerOptions {
    public convert_spaces_to_tabs: boolean = false;

}

/* Basic Tokenizer: To be replaced with a unicode variant later */

function tokenize(input: string, options: TokenizerOptions) : { tokens: Token[], errors: Error[] } {
    let tokens : Token[] = [];
    let errors : Error[] = [];

    for(let i = 0; i < input.length; i++) {

        // 4 spaces = 1 tab. That is final. Debate over
        if(options.convert_spaces_to_tabs && input.startsWith("    ", i)) {
            tokens.push(new Token(TokenType.INDENT));
            i += 3;
        } 
        // between (ex: 0...3 or 0-3)
        else if(input.startsWith("...", i)) {
            tokens.push(new Token(TokenType.BETWEEN));
            i += 2;
        } else if(input.startsWith("..", i)) {
            tokens.push(new Token(TokenType.BETWEEN));
            i += 1; 
        } 
        // comments
        else if(input.startsWith("//", i)) {
            i += 1;
            while(i < input.length) {
                if(input[i] == '\n') {
                    tokens.push(new Token(TokenType.END_OF_STATEMENT));
                    break;
                }
                i++;
            }
        } else if (input.startsWith("\r\n", i)) {
            tokens.push(new Token(TokenType.END_OF_STATEMENT));
            i += 1;
        } else {
            switch(input[i]) {
                // comment
                case '#':
                    i++;
                    while(i < input.length) {
                        if(input[i] == '\n') {
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
                        if(input[i] == quote_char) {
                            found_ending = true;
                            break;
                        }
                        else if(input[i] == '\n') {

                        }
                    } while(i < input.length);

                    if(found_ending) {
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

$( function() {

});