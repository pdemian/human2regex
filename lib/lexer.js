"use strict";
/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Human2RegexLexer = exports.TokenizeResult = exports.Human2RegexLexerOptions = exports.IndentType = void 0;
/**
 * The Lexer for Human2Regex
 * @packageDocumentation
 */
const chevrotain_1 = require("chevrotain");
const utilities_1 = require("./utilities");
const tokens_1 = require("./tokens");
/**
 * Defines the type of indents the lexer will allow
 */
var IndentType;
(function (IndentType) {
    IndentType[IndentType["Tabs"] = 0] = "Tabs";
    IndentType[IndentType["Spaces"] = 1] = "Spaces";
    IndentType[IndentType["Both"] = 2] = "Both";
})(IndentType = exports.IndentType || (exports.IndentType = {}));
/**
 * The options for the Lexer
 */
class Human2RegexLexerOptions {
    /**
     * Constructor for the Human2RegexLexerOptions
     *
     * @param skip_validations If true, the lexer will skip validations (~25% faster)
     * @param type The type of indents the lexer will allow
     * @param spaces_per_tab Number of spaces per tab
     */
    constructor(skip_validations = false, type = IndentType.Both, spaces_per_tab = 4) {
        this.skip_validations = skip_validations;
        this.type = type;
        this.spaces_per_tab = spaces_per_tab;
        /* empty */
    }
}
exports.Human2RegexLexerOptions = Human2RegexLexerOptions;
/**
 * Tokenization result
 */
class TokenizeResult {
    /**
     * Constructor for the TokenizeResult
     *
     * @param tokens The token stream
     * @param errors A list of lexing errors
     */
    constructor(tokens, errors) {
        this.tokens = tokens;
        this.errors = errors;
        /* empty */
    }
}
exports.TokenizeResult = TokenizeResult;
/**
 * Human2Regex Lexer
 *
 * @remarks Only 1 lexer instance allowed due to a technical limitation and performance reasons
 */
class Human2RegexLexer {
    /**
     * Human2Regex Lexer
     *
     * @remarks Only 1 lexer instance allowed due to a technical limitation and performance reasons
     * @param options options for the lexer
     * @see Human2RegexLexerOptions
     */
    constructor(options = new Human2RegexLexerOptions()) {
        if (Human2RegexLexer.already_init) {
            throw new Error("Only 1 instance of Human2RegexLexer allowed");
        }
        Human2RegexLexer.already_init = true;
        this.setOptions(options);
    }
    /**
     * Sets the options for this lexer
     *
     * @param options options for the lexer
     * @see Human2RegexLexerOptions
     */
    setOptions(options) {
        this.options = options;
        let indent_regex = null;
        // Generate an index lexer (accepts tabs or spaces or both based on options)
        if (this.options.type === IndentType.Tabs) {
            indent_regex = /\t/y;
        }
        else {
            let reg = ` {${this.options.spaces_per_tab}}`;
            if (this.options.type === IndentType.Both) {
                reg += "|\\t";
            }
            indent_regex = new RegExp(reg, "y");
        }
        tokens_1.Indent.PATTERN = indent_regex;
        this.lexer = new chevrotain_1.Lexer(tokens_1.AllTokens, { ensureOptimizations: true, skipValidations: options.skip_validations });
    }
    lexError(token) {
        var _a, _b, _c;
        return {
            offset: token.startOffset,
            line: (_a = token.startLine) !== null && _a !== void 0 ? _a : NaN,
            column: (_b = token.startColumn) !== null && _b !== void 0 ? _b : NaN,
            length: (_c = token.endOffset) !== null && _c !== void 0 ? _c : NaN - token.startOffset,
            message: "Unexpected indentation found"
        };
    }
    /**
     * Tokenizes the given text
     *
     * @param text the text to analyze
     * @returns a tokenize result which contains the token stream and error list
     * @public
     */
    tokenize(text) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        const lex_result = this.lexer.tokenize(text);
        if (lex_result.tokens.length === 0) {
            return new TokenizeResult(lex_result.tokens, lex_result.errors.map(utilities_1.CommonError.fromLexError));
        }
        const tokens = [];
        const indent_stack = [0];
        let curr_indent_level = 0;
        let start_of_line = true;
        let had_indents = false;
        // create Outdents
        for (let i = 0; i < lex_result.tokens.length; i++) {
            // EoL? check for indents next (by setting startOfLine = true)
            if (lex_result.tokens[i].tokenType === tokens_1.EndOfLine) {
                if (tokens.length === 0 || tokens[tokens.length - 1].tokenType === tokens_1.EndOfLine) {
                    // Ignore multiple EOLs and ignore first EOL
                }
                else {
                    start_of_line = true;
                    tokens.push(lex_result.tokens[i]);
                }
            }
            // start with 1 indent. Append all other indents 
            else if (lex_result.tokens[i].tokenType === tokens_1.Indent) {
                had_indents = true;
                curr_indent_level = 1;
                const start_token = lex_result.tokens[i];
                let length = lex_result.tokens[i].image.length;
                // grab all the indents (and their length)
                while (lex_result.tokens.length > i && lex_result.tokens[i + 1].tokenType === tokens_1.Indent) {
                    curr_indent_level++;
                    i++;
                    length += lex_result.tokens[i].image.length;
                }
                start_token.endOffset = start_token.startOffset + length;
                start_token.endColumn = lex_result.tokens[i].endColumn;
                // must be the same line
                //start_token.endLine = lex_result.tokens[i].endLine;
                // are we an empty line? 
                if (lex_result.tokens.length > i && lex_result.tokens[i + 1].tokenType === tokens_1.EndOfLine) {
                    // Ignore all indents AND newline
                    // continue;
                }
                // new indent is too far ahead
                else if (!start_of_line || (curr_indent_level > utilities_1.last(indent_stack) + 1)) {
                    lex_result.errors.push(this.lexError(start_token));
                }
                // new indent is just 1 above
                else if (curr_indent_level > utilities_1.last(indent_stack)) {
                    indent_stack.push(curr_indent_level);
                    tokens.push(start_token);
                }
                // new indent is below the past indent
                else if (curr_indent_level < utilities_1.last(indent_stack)) {
                    const index = utilities_1.findLastIndex(indent_stack, curr_indent_level);
                    if (index < 0) {
                        lex_result.errors.push(this.lexError(start_token));
                    }
                    else {
                        const number_of_dedents = indent_stack.length - index - 1;
                        for (let j = 0; j < number_of_dedents; j++) {
                            indent_stack.pop();
                            tokens.push(chevrotain_1.createTokenInstance(tokens_1.Outdent, "", start_token.startOffset, start_token.startOffset + length, (_a = start_token.startLine) !== null && _a !== void 0 ? _a : NaN, (_b = start_token.endLine) !== null && _b !== void 0 ? _b : NaN, (_c = start_token.startColumn) !== null && _c !== void 0 ? _c : NaN, ((_d = start_token.startColumn) !== null && _d !== void 0 ? _d : NaN) + length));
                        }
                    }
                }
                else {
                    // same indent level: don't care
                    // continue;
                }
            }
            else {
                if (start_of_line && !had_indents) {
                    const tok = lex_result.tokens[i];
                    //add remaining Outdents
                    while (indent_stack.length > 1) {
                        indent_stack.pop();
                        tokens.push(chevrotain_1.createTokenInstance(tokens_1.Outdent, "", tok.startOffset, tok.startOffset, (_e = tok.startLine) !== null && _e !== void 0 ? _e : NaN, NaN, (_f = tok.startColumn) !== null && _f !== void 0 ? _f : NaN, NaN));
                    }
                }
                start_of_line = false;
                had_indents = false;
                tokens.push(lex_result.tokens[i]);
            }
        }
        const tok = utilities_1.last(tokens);
        // Do we have an EOL marker at the end?
        if (tokens.length > 0 && tok.tokenType !== tokens_1.EndOfLine) {
            tokens.push(chevrotain_1.createTokenInstance(tokens_1.EndOfLine, "\n", (_g = tok.endOffset) !== null && _g !== void 0 ? _g : NaN, (_h = tok.endOffset) !== null && _h !== void 0 ? _h : NaN, (_j = tok.startLine) !== null && _j !== void 0 ? _j : NaN, NaN, (_k = tok.startColumn) !== null && _k !== void 0 ? _k : NaN, NaN));
        }
        //add remaining Outdents
        while (indent_stack.length > 1) {
            indent_stack.pop();
            tokens.push(chevrotain_1.createTokenInstance(tokens_1.Outdent, "", (_l = tok.endOffset) !== null && _l !== void 0 ? _l : NaN, (_m = tok.endOffset) !== null && _m !== void 0 ? _m : NaN, (_o = tok.startLine) !== null && _o !== void 0 ? _o : NaN, NaN, (_p = tok.startColumn) !== null && _p !== void 0 ? _p : NaN, NaN));
        }
        return new TokenizeResult(tokens, lex_result.errors.map(utilities_1.CommonError.fromLexError));
    }
}
exports.Human2RegexLexer = Human2RegexLexer;
Human2RegexLexer.already_init = false;
