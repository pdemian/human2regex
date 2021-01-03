/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */
/**
 * Some utility functions for Human2Regex
 * @packageDocumentation
 */
import { ISemanticError } from "./generator";
import { IRecognitionException, ILexingError } from "chevrotain";
/**
 * The following section is used because the linter is set up to warn about certain operations
 * and for good reason! I'd much rather have these functions than accidently use bitwise operations, or
 * create a bunch of usless conditionals
 * Plus, it signifies exactly what you wish to do (ex, calling hasFlag means you want to check if the
 * bitpattern matches a given flag)
 */
/**
 * Fixes linter warnings about unused variables, however requires a reason why it's unused
 *
 * @param value the value you want to specify that is unused
 * @param reason the reason this value is required but unused in this context
 * @internal
 */
export declare function unusedParameter<T>(value: T, reason: string): void;
/**
 * Fixes linter warnings about useless conditionals, however requires a reason why it's useless
 *
 * @param conditional the supposedly useless conditional
 * @param reason the reason this value is required but considered useless
 * @internal
 */
export declare function usefulConditional<T>(conditional: boolean | T, reason: string): boolean;
/**
 * Generates a bitwise flag based on the value provided
 *
 * @param value the number of bits to shift
 * @returns 1 << value
 * @internal
 */
export declare function makeFlag(value: number): number;
/**
 * Checks if value has the given flag
 *
 * @param value First flag to compare
 * @param flag Second flag to compare
 * @returns value & flag
 * @internal
 */
export declare function hasFlag(value: number, flag: number): boolean;
/**
 * Appends the flag to the value
 *
 * @param value First flag
 * @param flag Second flag
 * @returns value | flag
 * @internal
 */
export declare function combineFlags(value: number, flag: number): number;
/**
 * Checks to see if the character is a single regex character
 *
 * @remarks unicode and escape characters count as a single character
 *
 * @param char the character to check
 * @returns if the value is exactly 1 character
 * @internal
 */
export declare function isSingleRegexCharacter(char: string): boolean;
/**
 * Gets the first element of an array
 * @remarks does not validate if array has any elements
 *
 * @param array an array
 * @returns first element of an array
 * @internal
 */
export declare function first<T>(array: T[]): T;
/**
 * Gets the last element of an array
 * @remarks does not validate if array has any elements
 *
 * @param array an array
 * @returns last element of an array
 * @internal
 */
export declare function last<T>(array: T[]): T;
/**
 * Find the last index of a given value in an array
 *
 * @param array an array
 * @param value the value to find
 * @returns an index if found or -1 if not found
 * @internal
 */
export declare function findLastIndex<T>(array: T[], value: T): number;
/**
 * Removes start and end quotes from a string
 *
 * @param input the string to remove quotes from
 * @returns a string without quote characters
 * @internal
 */
export declare function removeQuotes(input: string): string;
/**
 * Escapes a string so it may be used literally in a regular expression
 *
 * @param input the string to escape
 * @returns a regex escaped string
 * @internal
 */
export declare function regexEscape(input: string): string;
/**
 * Append a list of arrays to an array
 *
 * @param array the array to append to
 * @param arrays the list of arrays that you want to add to array
 * @internal
 */
export declare function append<T>(array: T[], ...arrays: T[][]): void;
/**
 * Common Error class that encapsulates information from the lexer, parser, and generator
 */
export declare class CommonError {
    type: string;
    start_line: number;
    start_column: number;
    length: number;
    message: string;
    private constructor();
    /**
     * Creates a common error from a lexing error
     *
     * @param error The lexing error
     * @returns a new CommonError
     * @internal
     */
    static fromLexError(error: ILexingError): CommonError;
    /**
     * Creates a common error from a parsing error
     *
     * @param error The parsing error
     * @returns a new CommonError
     * @internal
     */
    static fromParseError(error: IRecognitionException): CommonError;
    /**
     * Creates a common error from a semantic error
     *
     * @param error The semantic error
     * @returns a new CommonError
     * @internal
     */
    static fromSemanticError(error: ISemanticError): CommonError;
    /**
     * Generates a string representation of a CommonError
     *
     * @returns a string representation
     */
    toString(): string;
}
