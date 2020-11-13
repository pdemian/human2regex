/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */
/**
 * The Lexer for Human2Regex
 * @packageDocumentation
 */
import { ILexingResult } from "chevrotain";
/**
 * Defines the type of indents the lexer will allow
 */
export declare enum IndentType {
    Tabs = 0,
    Spaces = 1,
    Both = 2
}
/**
 * The options for the Lexer
 */
export declare class Human2RegexLexerOptions {
    skip_validations: boolean;
    type: IndentType;
    spaces_per_tab: number;
    /**
     * Constructor for the Human2RegexLexerOptions
     *
     * @param skip_validations If true, the lexer will skip validations (~25% faster)
     * @param type The type of indents the lexer will allow
     * @param spaces_per_tab Number of spaces per tab
     */
    constructor(skip_validations?: boolean, type?: IndentType, spaces_per_tab?: number);
}
/**
 * Human2Regex Lexer
 *
 * @remarks Only 1 lexer instance allowed due to a technical limitation and performance reasons
 */
export declare class Human2RegexLexer {
    private static already_init;
    private lexer;
    private options;
    /**
     * Human2Regex Lexer
     *
     * @remarks Only 1 lexer instance allowed due to a technical limitation and performance reasons
     * @param options options for the lexer
     * @see Human2RegexLexerOptions
     */
    constructor(options?: Human2RegexLexerOptions);
    /**
     * Sets the options for this lexer
     *
     * @param options options for the lexer
     * @see Human2RegexLexerOptions
     */
    setOptions(options: Human2RegexLexerOptions): void;
    private lexError;
    /**
     * Tokenizes the given text
     *
     * @param text the text to analyze
     * @returns a lexing result which contains the token stream and error list
     */
    tokenize(text: string): ILexingResult;
}
