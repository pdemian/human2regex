/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

// TODO: replace every version of switch(<some string>) with switch(<some string>.charCodeAt(0))

import { Token, TokenType, TokenError } from "./tokens";

const keywords = {
    "optional": TokenType.KEYWORD_OPTIONAL,
    "optionally": TokenType.KEYWORD_OPTIONAL,
    "match": TokenType.KEYWORD_MATCH,
    "then": TokenType.KEYWORD_THEN,
    "any": TokenType.KEYWORD_ANY, 
    "anything": TokenType.KEYWORD_ANY,
    "of": TokenType.KEYWORD_OF,
    "or": TokenType.KEYWORD_OR,
    "and": TokenType.KEYWORD_AND,
    "word": TokenType.KEYWODE_WORD_SPECIFIER,
    "digit": TokenType.KEYWORD_DIGIT_SPECIFIER,
    "character": TokenType.KEYWORD_CHAR_SPECIFIER, 
    "whitespace": TokenType.KEYWORD_WHITESPACE_SPECIFIER,
    "number": TokenType.KEYWORD_NUMBER_SPECIFIER, 
    "multiple": TokenType.KEYWORD_MULTIPLE, 
    "as": TokenType.KEYWORD_AS,
    "if": TokenType.KEYWORD_IF,
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
    "carriage": TokenType.KEYWORD_CARRIAGE,
    "return": TokenType.KEYWORD_RETURN,
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
    "to": TokenType.KEYWORD_TO
};

const escape_sequences = {
    'a': '\a',
    'b': '\b',
    'e': '\e',
    'f': '\f',
    'n': '\n',
    'r': '\r',
    't': '\t',
    '"': '"',
    '\'': '\'',
    '\\': '\\',
};

export class TokenizerOptions {
    public convert_spaces_to_tabs: boolean = false;
}

const escape_sequence_hex_regex = new RegExp(/[0-9A-Fa-f]/g);

function escape_sequence_gather_hex(input: string, i : number, max: number) : string {
    let hex = "";
    for(i++; i < input.length && max-- > 0; i++) {
        if(escape_sequence_hex_regex.test(input[i])) hex += input[i];
    }
    return hex;
}

function escape_sequence_mapper(input: string, i : number) : { code: string, read: number, error?: Error } {
    if(escape_sequences[input[i]] != undefined) {
        return { code: escape_sequences[input[i]], read: 1 };
    }
    //variable hex code
    else if(input[i] == 'x') {
        const hex = escape_sequence_gather_hex(input, ++i, 4);

        return { code:  String.fromCharCode(parseInt(hex, 16)), read: hex.length + 1 };
    }
    //4 hex unicode
    else if(input[i] == 'u') {
        const unicode = escape_sequence_gather_hex(input, ++i, 4);
        if(unicode.length != 4) {
            return { code: "", read: unicode.length + 1, error: new Error("Bad escape sequence")};
        }
        else {
            return { code: String.fromCharCode(parseInt(unicode, 16)), read: 5 };
        }
    }
    else if(input[i] == 'U') {
        const unicode = escape_sequence_gather_hex(input, ++i, 8);

        if(unicode.length != 8) {
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

function is_digit(input: string) : boolean {
    //return /[0-9]/g.test(input);
    const value = input.charCodeAt(0);
    return value >= 48 && value <= 57;
}

function is_char(input: string) : boolean {
    //return input.toUpperCase() != input.toLowerCase();
    //return /[a-zA-Z]/g.test(input);

    const value = input.charCodeAt(0);
    return ((value >= 65 && value <= 90) || (value >= 97 && value <= 122));
}

/* Basic Tokenizer */
export function tokenize(input: string, options: TokenizerOptions) : { tokens: Token[], errors: TokenError[] } {
    let line = 1;
    let position = 1;
    
    let tokens : Token[] = [];
    let errors : TokenError[] = [];

    for(let i = 0; i < input.length; i++, position++) {
        // 4 spaces = 1 tab. That is final. Debate over
        if(options.convert_spaces_to_tabs && input.startsWith("    ", i)) {
            tokens.push(new Token(TokenType.INDENT, line, position));
            i += 3;
            position += 3;
        } 
        // between (ex: 0...3 or 0-3)
        else if(input.startsWith("...", i)) {
            tokens.push(new Token(TokenType.BETWEEN, line, position));
            i += 2;
            position += 2;
        } 
        else if(input.startsWith("..", i)) {
            tokens.push(new Token(TokenType.BETWEEN, line, position));
            i++;
            position++;
        } 
        // comments
        else if(input.startsWith("//", i)) {
            for(i++, position++; i < input.length; i++, position++) {
                if(input[i] == '\n') {
                    tokens.push(new Token(TokenType.END_OF_STATEMENT, line, position));
                    break;
                }
            }
            line++;
            position = 0;
        } 
        else if(input.startsWith("/*", i)) {
            for(i++, position++; i < input.length-1; i++, position++) {
                if(input[i] == '*' && input[i+1] == '/') {
                    tokens.push(new Token(TokenType.END_OF_STATEMENT, line, position));
                    i++;
                    position++;
                    break;
                }
                if(input[i] == '\n') {
                    line++;
                    position = 0;
                }
            }
            if(i == input.length-1) {
                errors.push(new TokenError("Unexpected EOF", line, position));
            }
            else {
                line++;
                position = 0;
            }
        }
        else if (input.startsWith("\r\n", i)) {
            tokens.push(new Token(TokenType.END_OF_STATEMENT, line, position));
            i++;
            line++;
            position = 0;
        } 
        else {
            switch(input[i]) {
                // comment
                case '#':
                    for(i++, position++; i < input.length; i++, position++) {
                        if(input[i] == '\n') {
                            tokens.push(new Token(TokenType.END_OF_STATEMENT, line, position));
                            line++;
                            position = 0;
                            break;
                        }
                    }
                    break;
                // quote
                case '"':
                case '\"':
                    // build up a word between quotes
                    const quote_begin = { line: line, position: position };
                    const quote_char = input[i];
                    let found_ending = false;

                    let quote = "";

                    do {
                        i++;
                        position++;
                        if(input[i] == '\\') {
                            i++;
                            position++;
                            const sequence = escape_sequence_mapper(input, i);

                            if(sequence.error != undefined) {
                                errors.push(new TokenError(sequence.error.message, line, position));
                            }

                            position += sequence.read;
                            i += sequence.read;
                            quote += sequence.code;

                        }
                        else if(input[i] == quote_char) {
                            found_ending = true;
                            break;
                        }
                        else if(input[i] == '\n') {
                            line++;
                            position = 0;
                            break;
                        }
                        else {
                            quote += input[i];
                        }
                    } while(i < input.length);

                    if(found_ending) {
                        tokens.push(new Token(TokenType.QUOTE, line, position, quote));
                    }
                    else {
                        //we reached the end of the line or the end of the file
                        errors.push(new TokenError(`Unexpected end of quote. Quote began at ${quote_begin.line}:${quote_begin.position}`, line, position));
                        line++;
                        position = 0;
                    }
                    break;

                // between (ex: 0...3 or 0-3)
                case '-':
                    tokens.push(new Token(TokenType.BETWEEN, line, position));
                    break;
                case '\n':
                    tokens.push(new Token(TokenType.END_OF_STATEMENT, line, position));
                    break;
                case '\r':
                    // ignore
                    break;
                case '\t':
                    tokens.push(new Token(TokenType.INDENT, line, position));
                    break;
                case ' ':
                    break;
                default:
                    // is digit? build up a number
                    if(is_digit(input[i])) {
                        let digits = input[i];
                        
                        do {
                            i++; position++;
                            digits += input[i];
                        } while(i+1 < input.length && is_digit(input[i+1]));

                        tokens.push(new Token(TokenType.NUMBER, line, position, digits));
                    }
                    // is char? build up a word
                    else if(is_char(input[i])) {
                        let text = input[i];

                        do {
                            i++; position++;
                            text += input[i];
                        } while(i+1 < input.length && is_char(input[i+1]));

                        const keyword_text = text.toLowerCase();

                        if(keywords[keyword_text] != undefined) {
                            tokens.push(new Token(keywords[keyword_text], line, position));
                        }
                        else {
                            switch(keyword_text) {
                                case "none":
                                case "zero":
                                    tokens.push(new Token(TokenType.NUMBER, line, position, "0")); 
                                    break;
                                case "one": 
                                    tokens.push(new Token(TokenType.NUMBER, line, position, "1")); 
                                    break;
                                case "two": 
                                    tokens.push(new Token(TokenType.NUMBER, line, position, "2")); 
                                    break;
                                case "three": 
                                    tokens.push(new Token(TokenType.NUMBER, line, position, "3")); 
                                    break;
                                case "four": 
                                    tokens.push(new Token(TokenType.NUMBER, line, position, "4")); 
                                    break;
                                case "five": 
                                    tokens.push(new Token(TokenType.NUMBER, line, position, "5")); 
                                    break;
                                case "six": 
                                    tokens.push(new Token(TokenType.NUMBER, line, position, "6")); 
                                    break;
                                case "seven": 
                                    tokens.push(new Token(TokenType.NUMBER, line, position, "7")); 
                                    break;
                                case "eight": 
                                    tokens.push(new Token(TokenType.NUMBER, line, position, "8")); 
                                    break;
                                case "nine": 
                                    tokens.push(new Token(TokenType.NUMBER, line, position, "9")); 
                                    break;
                                case "ten": 
                                    tokens.push(new Token(TokenType.NUMBER, line, position, "10")); 
                                    break;
                                default:
                                    errors.push(new TokenError(`Unknown keyword ${text}`, line, position));
                                    break;
                            }
                        }
                    }
                    else {
                        errors.push(new TokenError(`Unknown character in text: ${input.charCodeAt(i)}`, line, position));
                    }
                    break;
            }
        }
    }

    return { tokens: tokens, errors: errors };
}