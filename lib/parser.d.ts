/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */
/**
 * The parser for Human2Regex
 * @packageDocumentation
 */
import { EmbeddedActionsParser } from "chevrotain";
import { RegularExpressionCST } from "./generator";
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
 * The Parser class
 *
 * @remarks Only 1 parser instance allowed due to performance reasons
 */
export declare class Human2RegexParser extends EmbeddedActionsParser {
    private options;
    private static already_init;
    parse: (idxInCallingRule?: number, ...args: unknown[]) => RegularExpressionCST;
    constructor(options?: Human2RegexParserOptions);
    setOptions(options: Human2RegexParserOptions): void;
}
//# sourceMappingURL=parser.d.ts.map