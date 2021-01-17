/*! Copyright (c) 2021 Patrick Demian; Licensed under MIT */
/**
 * The parser for Human2Regex
 * @packageDocumentation
 */
import { EmbeddedActionsParser, IToken } from "chevrotain";
import { RegularExpressionCST, RegexDialect } from "./generator";
import { CommonError } from "./utilities";
/**
 * The options for the Parser
 */
export declare class Human2RegexParserOptions {
    skip_validations: boolean;
    /**
     * Constructor for Human2RegexParserOptions
     *
     * @param skip_validations If true, the lexer will skip validations (~25% faster)
     */
    constructor(skip_validations?: boolean);
}
/**
 * Tokenization result
 */
export declare class ParseResult {
    private regexp_cst;
    errors: CommonError[];
    /**
     * Constructor for the TokenizeResult
     *
     * @param tokens The token stream
     * @param errors A list of lexing errors
     */
    constructor(regexp_cst: RegularExpressionCST, errors: CommonError[]);
    /**
     * Validate that this is both valid and can be generated in the specified language
     *
     * @remarks There is no guarantee toRegex or toRegExp will work unless validate returns no errors
     *
     * @param language the regex dialect we're validating
     * @returns A list of errors
     * @public
     */
    validate(language: RegexDialect): CommonError[];
    /**
     * Generate a regular expression string based on the parse result
     *
     * @remarks There is no guarantee toRegex will work unless validate returns no errors
     *
     * @param language the regex dialect we're generating
     * @returns a regular expression string
     * @public
     */
    toRegex(language: RegexDialect): string;
    /**
     * Generate a RegExp object based on the parse result
     *
     * @remarks There is no guarantee toRegExp will work unless validate returns no errors
     *
     * @param language the regex dialect we're generating
     * @returns a RegExp object
     * @public
     */
    toRegExp(language: RegexDialect): RegExp;
}
/**
 * The Parser class
 *
 * @remarks Only 1 parser instance allowed due to performance reasons
 */
export declare class Human2RegexParser extends EmbeddedActionsParser {
    private options;
    private static already_init;
    private regexp;
    /**
     * Parses the token stream
     *
     * @param tokens Tokens to parse
     * @returns a parse result which contains the token stream and error list
     * @public
     */
    parse(tokens: IToken[]): ParseResult;
    constructor(options?: Human2RegexParserOptions);
    /**
     * Sets the options for this parser
     *
     * @param options options for the parser
     * @see Human2RegexParserOptions
     * @public
     */
    setOptions(options: Human2RegexParserOptions): void;
}
