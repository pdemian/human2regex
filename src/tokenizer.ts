/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

// TODO: replace every version of switch(<some string>) with switch(<some string>.charCodeAt(0))

import { Token, TokenType, TokenError } from "./tokens";

const keywords = {

    /* Full Keywords */
    "optional": TokenType.KEYWORD_OPTIONAL,
    "optionally": TokenType.KEYWORD_OPTIONAL,
    "match": TokenType.KEYWORD_MATCH,
    "matches": TokenType.KEYWORD_MATCH,
    "then": TokenType.KEYWORD_THEN,
    "any": TokenType.KEYWORD_ANY, 
    "anything": TokenType.KEYWORD_ANY,
    "anythings": TokenType.KEYWORD_ANY,
    "of": TokenType.KEYWORD_OF,
    "or": TokenType.KEYWORD_OR,
    "and": TokenType.KEYWORD_AND,
    "word": TokenType.KEYWODE_WORD_SPECIFIER,
    "digit": TokenType.KEYWORD_DIGIT_SPECIFIER,
    "character": TokenType.KEYWORD_CHAR_SPECIFIER, 
    "whitespace": TokenType.KEYWORD_WHITESPACE_SPECIFIER,
    "number": TokenType.KEYWORD_NUMBER_SPECIFIER, 
    "words": TokenType.KEYWODE_WORD_SPECIFIER,
    "digits": TokenType.KEYWORD_DIGIT_SPECIFIER,
    "characters": TokenType.KEYWORD_CHAR_SPECIFIER, 
    "whitespaces": TokenType.KEYWORD_WHITESPACE_SPECIFIER,
    "numbers": TokenType.KEYWORD_NUMBER_SPECIFIER, 
    "multiple": TokenType.KEYWORD_MULTIPLE, 
    "as": TokenType.KEYWORD_AS,
    "if": TokenType.KEYWORD_IF,
    "start": TokenType.KEYWORD_STARTS,
    "starts": TokenType.KEYWORD_STARTS,
    "with": TokenType.KEYWORD_WITH,
    "ends": TokenType.KEYWORD_ENDS,
    "otherwise": TokenType.KEYWORD_ELSE,
    "else": TokenType.KEYWORD_ELSE,
    "unless": TokenType.KEYWORD_UNLESS,
    "while": TokenType.KEYWORD_WHILE,
    "more": TokenType.KEYWORD_MORE,
    "using": TokenType.KEYWORD_USING,
    "global": TokenType.KEYWORD_GLOBAL,
    "multiline": TokenType.KEYWORD_MULTILINE,
    "exact": TokenType.KEYWORD_EXACT,
    "matching": TokenType.KEYWORD_MATCHING, 
    "not": TokenType.KEYWORD_NOT,
    "between": TokenType.KEYWORD_BETWEEN, 
    "tab": TokenType.KEYWORD_TAB,
    "linefeed": TokenType.KEYWORD_LINEFEED,
    "group": TokenType.KEYWORD_GROUP,
    "by": TokenType.KEYWORD_BY,
    "an": TokenType.KEYWORD_ARTICLE,
    "a": TokenType.KEYWORD_ARTICLE,
    "the": TokenType.KEYWORD_ARTICLE,
    "exactly": TokenType.KEYWORD_EXACTLY,
    "inclusive": TokenType.KEYWORD_INCLUSIVE,
    "inclusively": TokenType.KEYWORD_INCLUSIVE,
    "exclusive": TokenType.KEYWORD_EXCLUSIVE,
    "exclusively": TokenType.KEYWORD_EXCLUSIVE,
    "from": TokenType.KEYWORD_FROM, 
    "to": TokenType.KEYWORD_TO,
    "create": TokenType.KEYWORD_CREATE,
    "creates": TokenType.KEYWORD_CREATE,
    "called": TokenType.KEYWORD_CALLED,
    "repeat": TokenType.KEYWORD_REPEAT,
    "repeats": TokenType.KEYWORD_REPEAT,
    "newline": TokenType.KEYWORD_NEWLINE,

    /* Partial keywords */
    "thing": TokenType.PARTIAL_KEYWORD,
    "things": TokenType.PARTIAL_KEYWORD,
    "white": TokenType.PARTIAL_KEYWORD,
    "space": TokenType.PARTIAL_KEYWORD,
    "spaces": TokenType.PARTIAL_KEYWORD,
    "other": TokenType.PARTIAL_KEYWORD,
    "wise": TokenType.PARTIAL_KEYWORD,
    "multi": TokenType.PARTIAL_KEYWORD,
    "new": TokenType.PARTIAL_KEYWORD,
    "line": TokenType.PARTIAL_KEYWORD,
    "feed": TokenType.PARTIAL_KEYWORD,
    "carriage": TokenType.PARTIAL_KEYWORD,
    "return": TokenType.PARTIAL_KEYWORD,
};

const numbers = {
    "zero": "0",
    "one": "1",
    "two": "2",
    "three": "3",
    "four": "4",
    "five": "5",
    "six": "6",
    "seven": "7",
    "eight": "8",
    "nine": "9",
    "ten": "10"
};

interface token_transformation {
    [key: string]: { preceeding_token: string, transforms_to: TokenType }[]
}

const token_transformations : token_transformation  = {
    "thing":   [ { preceeding_token: "any",      transforms_to: TokenType.KEYWORD_ANY } ],
    "things":  [ { preceeding_token: "any",      transforms_to: TokenType.KEYWORD_ANY } ],
    "space":   [ { preceeding_token: "white",    transforms_to: TokenType.KEYWORD_WHITESPACE_SPECIFIER } ],
    "spaces":  [ { preceeding_token: "white",    transforms_to: TokenType.KEYWORD_WHITESPACE_SPECIFIER } ],
    "wise":    [ { preceeding_token: "other",    transforms_to: TokenType.KEYWORD_ELSE } ],
    "line":    [ { preceeding_token: "multi",    transforms_to: TokenType.KEYWORD_MULTILINE },
                 { preceeding_token: "new",      transforms_to: TokenType.KEYWORD_NEWLINE } ],
    "feed":    [ { preceeding_token: "line",     transforms_to: TokenType.KEYWORD_LINEFEED } ],
    "return":  [ { preceeding_token: "carriage", transforms_to: TokenType.KEYWORD_CARRIAGE_RETURN } ],
};

const escape_sequences = {
    "a": "\a",
    "b": "\b",
    "e": "\e",
    "f": "\f",
    "n": "\n",
    "r": "\r",
    "t": "\t",
    "'": "'",
    "\"": '"',
    "\\": "\\",
};

const escape_sequence_hex_regex = new RegExp(/[0-9A-Fa-f]/g);

function escape_sequence_gather_hex(input: string, i : number, max: number) : string {
    let hex = "";
    for(i++; i < input.length && max-- > 0; i++) {
        if(escape_sequence_hex_regex.test(input[i])) {
            hex += input[i];
        }
    }
    return hex;
}

function escape_sequence_mapper(input: string, i : number) : { code: string, read: number, error?: Error } {
    if(escape_sequences[input[i]]) {
        return { code: escape_sequences[input[i]], read: 1 };
    }
    //variable hex code
    else if(input[i] === "x") {
        const hex = escape_sequence_gather_hex(input, ++i, 4);

        return { code:  String.fromCharCode(parseInt(hex, 16)), read: hex.length + 1 };
    }
    //4 hex unicode
    else if(input[i] === "u") {
        const unicode = escape_sequence_gather_hex(input, ++i, 4);
        if(unicode.length !== 4) {
            return { code: "", read: unicode.length + 1, error: new Error("Bad escape sequence")};
        }
        else {
            return { code: String.fromCharCode(parseInt(unicode, 16)), read: 5 };
        }
    }
    else if(input[i] === "U") {
        const unicode = escape_sequence_gather_hex(input, ++i, 8);

        if(unicode.length !== 8) {
            return { code: "", read: unicode.length + 1, error: new Error("Bad escape sequence")};
        }
        else {
            return { code: String.fromCharCode(parseInt(unicode, 16)), read: 9 };
        }
    }
    else {
        // should throw an exception, but gonna just ignore it
        return { code:  input[i], read: 1 };
    }
}

const test_char_0 = "0".charCodeAt(0);
const test_char_9 = "9".charCodeAt(0);
const test_char_a = "a".charCodeAt(0);
const test_char_z = "z".charCodeAt(0);
const test_char_A = "A".charCodeAt(0);
const test_char_Z = "Z".charCodeAt(0);

function is_digit(input: string, i: number) : boolean {
    const value = input.charCodeAt(i);
    return value >= test_char_0 && value <= test_char_9;
}

function is_char(input: string, i: number) : boolean {
    const value = input.charCodeAt(i);
    return ((value >= test_char_a && value <= test_char_z) || 
            (value >= test_char_A && value <= test_char_Z));
}

function transform_tokens(tokens: Token[], errors: TokenError[]) : void {
    for(let i = 0; i < tokens.length; i++) {
        //check past tokens: if it matches the preceeding tokens, we transform it. 

        if(tokens[i].type === TokenType.PARTIAL_KEYWORD && token_transformations[tokens[i].token_string as string]) {
            
            const transform = token_transformations[tokens[i].token_string as string];
            
            for(let j = 0; j < transform.length; j++) {
                if(i-1 >= 0 && transform[j].preceeding_token === tokens[i-1].token_string) {
                    // use the i-1 token because it has the start line and position
    
                    tokens[i-1].type = transform[j].transforms_to;
                    (tokens[i-1].token_string as string) += " " + tokens[i].token_string as string;
                    tokens.splice(i, 1); // remove this token
                    i--; // move token counter back because we removed the token
                    break;
                }
            }
        }
        /* else ignore */
    }

    // do we still have partial tokens? those are errors then
    for(let i = 0; i < tokens.length; i++) {
        if(tokens[i].type === TokenType.PARTIAL_KEYWORD) {
            errors.push(new TokenError(`Unknown keyword "${tokens[i].token_string}"`, tokens[i].line, tokens[i].position));
        }
    }
}

export class TokenizerOptions {
    public convert_spaces_to_tabs: boolean = true;
}

export interface TokenizeResult {
    tokens: Token[],
    errors: TokenError[]
}

/* Basic Tokenizer */
export function tokenize(input: string, options: TokenizerOptions) : TokenizeResult {
    let line = 1;
    let position = 1;
    
    const tokens : Token[] = [];
    const errors : TokenError[] = [];

    // gather tokens
    for(let i = 0; i < input.length; i++, position++) {
        // 4 spaces = 1 tab. That is final. Debate over
        if(options.convert_spaces_to_tabs && input.startsWith("    ", i)) {
            tokens.push(new Token(TokenType.INDENT, line, position, 4));
            i += 3;
            position += 3;
        } 
        // between (ex: 0...3 or 0-3)
        else if(input.startsWith("...", i)) {
            tokens.push(new Token(TokenType.BETWEEN, line, position, 3));
            i += 2;
            position += 2;
        } 
        else if(input.startsWith("..", i)) {
            tokens.push(new Token(TokenType.BETWEEN, line, position, 3));
            i++;
            position++;
        } 
        // comments
        else if(input.startsWith("//", i)) {
            for(i++, position++; i < input.length; i++, position++) {
                if(input[i] === "\n") {
                    tokens.push(new Token(TokenType.END_OF_STATEMENT, line, position, 0));
                    break;
                }
            }
            line++;
            position = 0;
        } 
        else if(input.startsWith("/*", i)) {
            for(i++, position++; i < input.length-1; i++, position++) {
                if(input[i] === "*" && input[i+1] === "/") {
                    i++;
                    position++;
                    break;
                }
                if(input[i] === "\n") {
                    line++;
                    position = 0;
                }
            }
            if(i === input.length-1) {
                errors.push(new TokenError("Unexpected EOF", line, position));
            }
            else {
                line++;
                position = 0;
            }
        }
        else if (input.startsWith("\r\n", i)) {
            tokens.push(new Token(TokenType.END_OF_STATEMENT, line, position, 0));
            i++;
            line++;
            position = 0;
        } 
        else {
            switch(input[i]) {
                // comment
                case "#":
                    for(i++, position++; i < input.length; i++, position++) {
                        if(input[i] === "\n") {
                            tokens.push(new Token(TokenType.END_OF_STATEMENT, line, position, 0));
                            line++;
                            position = 0;
                            break;
                        }
                    }
                    break;
                // quote
                case '"':
                case '\"':
                    {
                        // build up a word between quotes
                        const quote_begin = { line: line, position: position };
                        const quote_char = input[i];
                        let found_ending = false;

                        let quote = "";

                        do {
                            i++;
                            position++;
                            if(input[i] === "\\") {
                                i++;
                                position++;
                                const sequence = escape_sequence_mapper(input, i);

                                if(sequence.error) {
                                    errors.push(new TokenError(sequence.error.message, line, position));
                                }

                                position += sequence.read;
                                i += sequence.read;
                                quote += sequence.code;

                            }
                            else if(input[i] === quote_char) {
                                found_ending = true;
                                break;
                            }
                            else if(input[i] === "\n") {
                                line++;
                                position = 0;
                                break;
                            }
                            else {
                                quote += input[i];
                            }
                        } while(i < input.length);

                        if(found_ending) {
                            tokens.push(new Token(TokenType.QUOTE, line, position, quote.length+2, quote));
                        }
                        else {
                            //we reached the end of the line or the end of the file
                            errors.push(new TokenError(`Unexpected end of quote. Quote began at ${quote_begin.line}:${quote_begin.position}`, line, position));
                            line++;
                            position = 0;
                        }
                        break;
                    }
                // between (ex: 0...3 or 0-3)
                case "-":
                    tokens.push(new Token(TokenType.BETWEEN, line, position, 1));
                    break;
                case "+":
                    tokens.push(new Token(TokenType.KEYWORD_OR, line, position, 1));
                    tokens.push(new Token(TokenType.KEYWORD_MORE, line, position, 0));
                    break;
                case "\n":
                    tokens.push(new Token(TokenType.END_OF_STATEMENT, line, position, 0));
                    line++;
                    position = 0;
                    break;
                case "\r":
                    // ignore
                    break;
                case "\t":
                    tokens.push(new Token(TokenType.INDENT, line, position, 1));
                    break;
                case " ":
                    // ignore
                    break;
                default:
                    // is digit? build up a number
                    if(is_digit(input, i)) {
                        const digit_begin = position;

                        let digits = input[i];
                        
                        for(; i+1 < input.length && is_digit(input, i+1); i++, position++) {
                            digits += input[i+1];
                        }

                        tokens.push(new Token(TokenType.NUMBER, line, digit_begin, position-digit_begin+1, digits));
                    }
                    // is char? build up a word
                    else if(is_char(input, i)) {
                        const word_begin = position;

                        let text = input[i];

                        for(; i+1 < input.length && is_char(input, i+1); i++, position++) {
                            text += input[i+1];
                        }

                        const keyword_text = text.toLowerCase();

                        // keyword (ex. "match")
                        if(keywords[keyword_text]) {
                            tokens.push(new Token(keywords[keyword_text], line, word_begin, position-word_begin+1, keyword_text));
                        }
                        // text number (ex. "one")
                        else if(numbers[keyword_text]) {
                            tokens.push(new Token(TokenType.NUMBER, line, word_begin, position-word_begin+1, keyword_text));
                        }
                        else {
                            errors.push(new TokenError(`Unknown keyword "${text}"`, line, word_begin));
                        }
                    }
                    else {
                        errors.push(new TokenError(`Unknown character in text: "${input[i]}" (${input.charCodeAt(i)})`, line, position));
                    }
                    break;
            }
        }
    }

    // transform tokens
    transform_tokens(tokens, errors);

    return { tokens: tokens, errors: errors };
}