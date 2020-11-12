/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */
import { IToken } from "chevrotain";
/**
 * List of regular expression dialects we support
 */
export declare enum RegexDialect {
    JS = 0,
    PCRE = 1,
    DotNet = 2,
    Java = 3
}
/**
 * Interface for all semantic errors
 */
export interface ISemanticError {
    startLine: number;
    startColumn: number;
    length: number;
    message: string;
}
/**
 * The base concrete syntax tree class
 *
 * @internal
 */
export declare abstract class H2RCST {
    tokens: IToken[];
    /**
     * Constructor for H2RCST
     *
     * @param tokens Tokens used to calculate where an error occured
     * @internal
     */
    constructor(tokens: IToken[]);
    /**
     * Validate that this is both valid and can be generated in the specified language
     *
     * @remarks There is no guarantee toRegex will work unless validate returns no errors
     *
     * @param language the regex dialect we're validating
     * @returns A list of errors
     * @public
     */
    abstract validate(language: RegexDialect): ISemanticError[];
    /**
     * Generate a regular expression fragment based on this syntax tree
     *
     * @remarks There is no guarantee toRegex will work unless validate returns no errors
     *
     * @param language the regex dialect we're generating
     * @returns a regular expression fragment
     * @public
     */
    abstract toRegex(language: RegexDialect): string;
    /**
     * Creates an ISemanticError with a given message and the tokens provided from the constructor
     *
     * @param message the message
     * @internal
     */
    protected error(message: string): ISemanticError;
}
/**
 * Flags for the using statement
 *
 * @internal
 */
export declare enum UsingFlags {
    Multiline,
    Global,
    Sensitive,
    Insensitive,
    Exact
}
/**
 * Type of match arguments
 *
 * @remarks SingleString means an escaped string
 * @remarks Between means a range (ex. a-z)
 * @remarks Anything means .
 * @remarks Word, Digit, Character, Whitespace, Number, Tab, Linefeed, Newline, and Carriage return are \w+, \d, \w, \s, \d+, \t, \n, \n, \r respectively
 * @internal
 */
export declare enum MatchSubStatementType {
    SingleString = 0,
    Between = 1,
    Anything = 2,
    Word = 3,
    Digit = 4,
    Character = 5,
    Whitespace = 6,
    Number = 7,
    Tab = 8,
    Linefeed = 9,
    Newline = 10,
    CarriageReturn = 11,
    Boundary = 12,
    Unicode = 13
}
/**
 * Container for match statements
 *
 * @internal
 */
export declare class MatchSubStatementValue {
    type: MatchSubStatementType;
    from: string | null;
    to: string | null;
    /**
     * Constructor for MatchSubStatementValue
     *
     * @param type the type of this match
     * @param from optional value or range string
     * @param to  optional range string
     * @internal
     */
    constructor(type: MatchSubStatementType, from?: string | null, to?: string | null);
}
/**
 * Container for MatchStatementValue
 *
 * @internal
 */
export declare class MatchStatementValue {
    optional: boolean;
    statement: MatchSubStatementCST;
    /**
     * Constructor for MatchStatementValue
     *
     * @param optional is this match optional
     * @param statement the substatement to generate
     * @internal
     */
    constructor(optional: boolean, statement: MatchSubStatementCST);
}
/**
 * The base class for all statement concrete syntax trees
 *
 * @internal
 */
export declare abstract class StatementCST extends H2RCST {
}
/**
 * Concrete Syntax Tree for Match Sub statements
 *
 * @internal
 */
export declare class MatchSubStatementCST extends H2RCST {
    private count;
    private invert;
    private values;
    /**
     * Constructor for MatchSubStatementCST
     *
     * @param tokens Tokens used to calculate where an error occured
     * @param count optional count statement
     * @param invert is this match inverted (ex, [^a-z] or [a-z])
     * @param values sub statements to match
     */
    constructor(tokens: IToken[], count: CountSubStatementCST | null, invert: boolean, values: MatchSubStatementValue[]);
    validate(language: RegexDialect): ISemanticError[];
    toRegex(language: RegexDialect): string;
}
/**
 * Concrete Syntax Tree for Using statements
 *
 * @internal
 */
export declare class UsingStatementCST extends H2RCST {
    private flags;
    /**
     * Constructor for UsingStatementCST
     *
     * @param tokens Tokens used to calculate where an error occured
     * @param flags using flags
     */
    constructor(tokens: IToken[], flags: UsingFlags[]);
    validate(language: RegexDialect): ISemanticError[];
    toRegex(language: RegexDialect): string;
}
/**
 * Concrete Syntax Tree for Count sub statements
 *
 * @internal
 */
export declare class CountSubStatementCST extends H2RCST {
    private from;
    private to;
    private opt;
    /**
     * Constructor for CountSubStatementCST
     *
     * @param tokens Tokens used to calculate where an error occured
     * @param from number to count from
     * @param to optional number to count to
     * @param opt option modifier
     */
    constructor(tokens: IToken[], from: number, to?: number | null, opt?: "inclusive" | "exclusive" | "+" | null);
    validate(language: RegexDialect): ISemanticError[];
    toRegex(language: RegexDialect): string;
}
/**
 * Concrete Syntax Tree for a Match statement
 *
 * @internal
 */
export declare class MatchStatementCST extends StatementCST {
    private matches;
    /**
     * Constructor for MatchStatementCST
     *
     * @param tokens Tokens used to calculate where an error occured
     * @param matches
     */
    constructor(tokens: IToken[], matches: MatchStatementValue[]);
    validate(language: RegexDialect): ISemanticError[];
    toRegex(language: RegexDialect): string;
}
/**
 * Concrete Syntax Tree for a Repeat statement
 *
 * @internal
 */
export declare class RepeatStatementCST extends StatementCST {
    private optional;
    private count;
    private statements;
    /**
     * Constructor for RepeatStatementCST
     *
     * @param tokens Tokens used to calculate where an error occured
     * @param optional is this repetition optional
     * @param count optional number of times to repeat
     * @param statements the statements to repeat
     */
    constructor(tokens: IToken[], optional: boolean, count: CountSubStatementCST | null, statements: StatementCST[]);
    validate(language: RegexDialect): ISemanticError[];
    toRegex(language: RegexDialect): string;
}
/**
 * Conrete Syntax Tree for a group Statement
 *
 * @internal
 */
export declare class GroupStatementCST extends StatementCST {
    private optional;
    private name;
    private statements;
    /**
     * Constructor for GroupStatementCST
     *
     * @param tokens Tokens used to calculate where an error occured
     * @param optional is this group optional
     * @param name optional name for named group
     * @param statements other statements
     * @internal
     */
    constructor(tokens: IToken[], optional: boolean, name: string | null, statements: StatementCST[]);
    validate(language: RegexDialect): ISemanticError[];
    toRegex(language: RegexDialect): string;
}
/**
 * Concrete Syntax Tree for a regular expression
 *
 * @public
 */
export declare class RegularExpressionCST extends H2RCST {
    private usings;
    private statements;
    /**
     * Constructor for RegularExpressionCST
     *
     * @param tokens Tokens used to calculate where an error occured
     * @param usings using statements
     * @param statements other statements
     * @internal
     */
    constructor(tokens: IToken[], usings: UsingStatementCST, statements: StatementCST[]);
    validate(language: RegexDialect): ISemanticError[];
    toRegex(language: RegexDialect): string;
}
//# sourceMappingURL=generator.d.ts.map