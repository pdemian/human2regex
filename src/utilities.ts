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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function unusedParameter<T>(value: T, reason: string): void {
    /* empty on purpose */
}

/**
 * Fixes linter warnings about useless conditionals, however requires a reason why it's useless
 * 
 * @param conditional the supposedly useless conditional
 * @param reason the reason this value is required but considered useless
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function usefulConditional<T>(conditional: boolean | T, reason: string): boolean {
    return Boolean(conditional);
}


/* eslint-disable no-bitwise */
/**
 * Generates a bitwise flag based on the value provided
 * 
 * @param value the number of bits to shift
 * @returns 1 << value
 * @internal 
 */
export function makeFlag(value: number): number {
    return 1 << value;
}

/**
 * Checks if value has the given flag
 * 
 * @param value First flag to compare
 * @param flag Second flag to compare
 * @returns value & flag
 * @internal
 */
export function hasFlag(value: number, flag: number): boolean {
    return (value & flag) !== 0;
}

/**
 * Appends the flag to the value
 * 
 * @param value First flag
 * @param flag Second flag
 * @returns value | flag
 * @internal
 */
export function combineFlags(value: number, flag: number): number {
    return (value | flag);
}
/* eslint-enable no-bitwise */

/**
 * Checks to see if the character is a single regex character
 * 
 * @remarks unicode and escape characters count as a single character
 * 
 * @param char the character to check
 * @returns if the value is exactly 1 character
 * @internal
 */
export function isSingleRegexCharacter(char: string): boolean {
    return (char.startsWith("\\u") && char.length === 6) ||
           (char.startsWith("\\U") && char.length === 8) ||
           (char.startsWith("\\") && char.length === 2) ||
           char.length === 1;
}

/**
 * Gets the first element of an array
 * @remarks does not validate if array has any elements
 * 
 * @param array an array
 * @returns first element of an array
 * @internal
 */
export function first<T>(array: T[]): T {
    return array[0];
}

/**
 * Gets the last element of an array
 * @remarks does not validate if array has any elements
 * 
 * @param array an array
 * @returns last element of an array
 * @internal
 */
export function last<T>(array: T[]): T {
    return array[array.length-1];
}

/**
 * Find the last index of a given value in an array
 * 
 * @param array an array
 * @param value the value to find
 * @returns an index if found or -1 if not found
 * @internal
 */
export function findLastIndex<T>(array: T[], value: T): number {
    for (let index = array.length-1; index >= 0; index--) {
        if (array[index] === value) {
            return index;
        }
    }
    return -1;
}

/**
 * Removes start and end quotes from a string
 * 
 * @param input the string to remove quotes from
 * @returns a string without quote characters
 * @internal
 */
export function removeQuotes(input: string): string {
    return input.substring(1, input.length-1);
}

/**
 * Escapes a string so it may be used literally in a regular expression
 * 
 * @param input the string to escape
 * @returns a regex escaped string
 * @internal
 */
export function regexEscape(input: string): string {
    return input.replace("\\", "\\\\").replace(/([=:\-\.\[\]\^\|\(\)\*\+\?\{\}\$\/])/g, "\\$1");
}

/**
 * Common Error class that encapsulates information from the lexer, parser, and generator
 */
export class CommonError {
    private constructor(public type: string, public start_line: number, public start_column: number, public length: number, public message: string) {
        /* empty */
    }

    /**
     * Creates a common error from a lexing error
     * 
     * @param error The lexing error
     * @returns a new CommonError
     */
    public static fromLexError(error: ILexingError): CommonError {
        return new CommonError("Lexer Error", error.line, error.column, error.length, error.message);
    }

    /**
     * Creates a common error from a parsing error
     * 
     * @param error The parsing error
     * @returns a new CommonError
     */
    public static fromParseError(error: IRecognitionException): CommonError {
        return new CommonError("Parser Error", error.token.startLine ?? NaN, error.token.startColumn ?? NaN, error.token.endOffset ?? NaN - error.token.startOffset, error.name + ": " + error.message);
    }

    /**
     * Creates a common error from a semantic error
     * 
     * @param error The semantic error
     * @returns a new CommonError
     */
    public static fromSemanticError(error: ISemanticError): CommonError {
        return new CommonError("Semantic Error", error.startLine, error.startColumn, error.length, error.message);
    }

    /**
     * Generates a string representation of a CommonError
     * 
     * @returns a string representation
     */
    public toString(): string {
        return `${this.type} @ ${this.start_line} ${this.start_column}: ${this.message}`;
    }
}