/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

import { Lexer, IToken, createTokenInstance, ILexingResult } from "chevrotain";
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

    private lexer : Lexer;

    constructor(private options: Human2RegexLexerOptions = new Human2RegexLexerOptions()) {
        if (Human2RegexLexer.already_init) {
            throw new Error("Only 1 instance of Human2RegexLexer allowed");
        }

        Human2RegexLexer.already_init = true;

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

    public tokenize(text: string) : ILexingResult {
        const lexResult = this.lexer.tokenize(text);

        if (lexResult.tokens.length == 0) {
            return lexResult;
        }

        // create Outdents

        const tokens: IToken[] = [];

        const indentStack = [ 0 ];

        let currIndentLevel = 0;
        let startOfLine = true;
        let hadIndents = false;

        for (let i = 0; i < lexResult.tokens.length; i++) {
            if (lexResult.tokens[i].tokenType === EndOfLine) {
                startOfLine = true;
                tokens.push(lexResult.tokens[i]);
            }
            else if (lexResult.tokens[i].tokenType === Indent) {
                hadIndents = true;
                currIndentLevel = 1; 

                const start_token = lexResult.tokens[i];
                let length = lexResult.tokens[i].image.length;

                while (lexResult.tokens[i+1].tokenType === Indent) {
                    currIndentLevel++;
                    i++;
                    length += lexResult.tokens[i].image.length;
                }

                if (!startOfLine || (currIndentLevel > last(indentStack) + 1)) {
                    lexResult.errors.push({ 
                        offset: start_token.startOffset,
                        line: start_token.startLine ?? NaN,
                        column: start_token.startColumn ?? NaN,
                        length: length,
                        message: "Unexpected indentation found"
                    });
                }
                else if (currIndentLevel > last(indentStack)) {
                    indentStack.push(currIndentLevel);
                    tokens.push(start_token);
                }
                else if (currIndentLevel < last(indentStack)) {
                    const index = findLastIndex(indentStack, currIndentLevel);

                    if (index < 0) {
                        lexResult.errors.push({ 
                            offset: start_token.startOffset,
                            line: start_token.startLine ?? NaN,
                            column: start_token.startColumn ?? NaN,
                            length: length,
                            message: "Unexpected indentation found"
                        });
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
                }
            }
            else {
                if(startOfLine && !hadIndents) {
                    const tok = lexResult.tokens[i];

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