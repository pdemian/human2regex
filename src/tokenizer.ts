/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

import { Lexer, IToken, createTokenInstance, ILexingResult, ILexingError } from "chevrotain";
import { last, findLastIndex } from "./utilities";
import { Indent, Outdent, EndOfLine, AllTokens } from "./tokens";

export enum IndentType {
    Tabs,
    Spaces,
    Both
}

export class Human2RegexLexerOptions {
    constructor(public type: IndentType = IndentType.Both, public spaces_per_tab: number = 4) {
        /* empty */
    }
}

export class Human2RegexLexer {
    private static already_init = false;

    private lexer!: Lexer;
    private options!: Human2RegexLexerOptions;

    constructor(options: Human2RegexLexerOptions = new Human2RegexLexerOptions()) {
        if (Human2RegexLexer.already_init) {
            throw new Error("Only 1 instance of Human2RegexLexer allowed");
        }

        Human2RegexLexer.already_init = true;

        this.set_options(options);
    }

    public set_options(options: Human2RegexLexerOptions) : void {
        this.options = options;
        
        let indent_regex: RegExp | null = null;

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

        Indent.PATTERN = indent_regex;

        this.lexer = new Lexer(AllTokens, { ensureOptimizations: true });
    }

    private lex_error(token: IToken) : ILexingError {
        return { 
            offset: token.startOffset,
            line: token.startLine ?? NaN,
            column: token.startColumn ?? NaN,
            length: token.endOffset ?? NaN - token.startOffset,
            message: "Unexpected indentation found"
        };
    }

    public tokenize(text: string) : ILexingResult {
        const lexResult = this.lexer.tokenize(text);

        if (lexResult.tokens.length === 0) {
            return lexResult;
        }

        // create Outdents
        const tokens: IToken[] = [];
        const indentStack = [ 0 ];

        let currIndentLevel = 0;
        let startOfLine = true;
        let hadIndents = false;

        for (let i = 0; i < lexResult.tokens.length; i++) {

            // EoL? check for indents next (by setting startOfLine = true)
            if (lexResult.tokens[i].tokenType === EndOfLine) {
                if(tokens.length === 0 || tokens[tokens.length-1].tokenType === EndOfLine) {
                    // Ignore multiple EOLs and ignore first EOL
                }
                else {
                    startOfLine = true;
                    tokens.push(lexResult.tokens[i]);
                }
            }
            // start with 1 indent. Append all other indents 
            else if (lexResult.tokens[i].tokenType === Indent) {
                hadIndents = true;
                currIndentLevel = 1; 

                const start_token = lexResult.tokens[i];
                let length = lexResult.tokens[i].image.length;

                // grab all the indents (and their length)
                while (lexResult.tokens.length > i && lexResult.tokens[i+1].tokenType === Indent) {
                    currIndentLevel++;
                    i++;
                    length += lexResult.tokens[i].image.length;
                }

                start_token.endOffset = start_token.startOffset + length;
                start_token.endColumn = lexResult.tokens[i].endColumn;
                // must be the same line
                //start_token.endLine = lexResult.tokens[i].endLine;

                // are we an empty line? 
                if (lexResult.tokens.length > i && lexResult.tokens[i+1].tokenType === EndOfLine) {
                    // Ignore all indents AND newline
                    // continue;
                }
                else if (!startOfLine || (currIndentLevel > last(indentStack) + 1)) {
                    lexResult.errors.push(this.lex_error(start_token));
                }
                else if (currIndentLevel > last(indentStack)) {
                    indentStack.push(currIndentLevel);
                    tokens.push(start_token);
                }
                else if (currIndentLevel < last(indentStack)) {
                    const index = findLastIndex(indentStack, currIndentLevel);

                    if (index < 0) {
                        lexResult.errors.push(this.lex_error(start_token));
                    }
                    else {
                        const numberOfDedents = indentStack.length - index - 1;
                    
                        for(let i = 0; i < numberOfDedents; i++) {
                            indentStack.pop();
                            tokens.push(createTokenInstance(Outdent, "", start_token.startOffset, start_token.startOffset + length, start_token.startLine ?? NaN, start_token.endLine ?? NaN, start_token.startColumn ?? NaN, (start_token.startColumn ?? NaN) + length));
                        }
                    }
                }
                else {
                    // same indent level: don't care
                    // continue;
                }
            }
            else {
                if(startOfLine && !hadIndents) {
                    const tok = lexResult.tokens[i];

                    //add remaining Outdents
                    while (indentStack.length > 1) {
                        indentStack.pop();
                        tokens.push(createTokenInstance(Outdent, "", tok.startOffset, tok.startOffset, tok.startLine ?? NaN, NaN, tok.startColumn ?? NaN, NaN));
                    }
                }
                startOfLine = false;
                hadIndents = false;
                tokens.push(lexResult.tokens[i]);
            }
        }

        const tok = last(tokens);

        // Do we have an EOL marker at the end?
        if(tok.tokenType !== EndOfLine) {
            tokens.push(createTokenInstance(EndOfLine, "\n", tok.endOffset ?? NaN, tok.endOffset ?? NaN, tok.startLine ?? NaN, NaN, tok.startColumn ?? NaN, NaN)); 
        }
    
        //add remaining Outdents
        while (indentStack.length > 1) {
            indentStack.pop();
            tokens.push(createTokenInstance(Outdent, "", tok.endOffset ?? NaN, tok.endOffset ?? NaN, tok.startLine ?? NaN, NaN, tok.startColumn ?? NaN, NaN));
        }

        lexResult.tokens = tokens;
        return lexResult;
    }
}