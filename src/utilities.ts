/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

import { ISemanticError } from "./generator";
import { IRecognitionException, ILexingError } from "chevrotain";

/* eslint-disable no-bitwise */
export function hasFlag(a: number, b: number) : boolean {
    return (a & b) !== 0;
}

export function combineFlags(a: number, b: number): number {
    return (a | b);
}
/* eslint-enable no-bitwise */

export function isSingleRegexCharacter(char: string): boolean {
    return (char.startsWith("\\u") && char.length === 6) ||
           (char.startsWith("\\U") && char.length === 8) ||
           (char.startsWith("\\") && char.length === 2) ||
           char.length === 1;
}

export function first<T>(array: T[]): T {
    return array[0];
}

export function last<T>(array: T[]): T {
    return array[array.length-1];
}

export function findLastIndex<T>(array: T[], value: T): number {
    for (let index = array.length-1; index >= 0; index--) {
        if (array[index] === value) {
            return index;
        }
    }
    return -1;
}

export function findLastIndexPredicate<T>(array: T[], predicate: (x: T) => boolean): number {
    for (let index = array.length-1; index >= 0; index--) {
        if (predicate(array[index])) {
            return index;
        }
    }
    return -1;
}

export function removeQuotes(input: string): string {
    return input.substring(1, input.length-1);
}

export function regexEscape(input: string) : string {
    return input.replace("\\", "\\\\").replace(/([=:\-\.\[\]\^\|\(\)\*\+\?\{\}\$\/])/g, "\\$1");
}

export class CommonError {
    constructor(public type: string, public start_line: number, public start_column: number, public length: number, public message: string) {
        /* empty */
    }

    public static fromLexError(error: ILexingError): CommonError {
        return new CommonError("Lexer Error", error.line, error.column, error.length, error.message);
    }

    public static fromParseError(error: IRecognitionException): CommonError {
        return new CommonError("Parser Error", error.token.startLine ?? NaN, error.token.startColumn ?? NaN, error.token.endOffset ?? NaN - error.token.startOffset, error.name + ": " + error.message);
    }

    public static fromSemanticError(error: ISemanticError): CommonError {
        return new CommonError("Semantic Error", error.startLine, error.startColumn, error.length, error.message);
    }

    public toString(): string {
        return `${this.type} @ ${this.start_line} ${this.start_column}: ${this.message}`;
    }
}