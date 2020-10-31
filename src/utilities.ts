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

export interface ICommonError {
	type: string,
	startLine: number,
    startColumn: number,
    length: number,
    message: string
}

export function lexErrorToCommonError(error: ILexingError): ICommonError {
	return {
		type: "Lexer Error",
		startLine: error.line,
		startColumn: error.column,
		length: error.length,
		message: error.message
	};
}

export function parseErrorToCommonError(error: IRecognitionException): ICommonError {
	return {
		type: "Parser Error",
		startLine: error.token.startLine ?? NaN,
		startColumn: error.token.startColumn ?? NaN,
		length: error.token.endOffset ?? NaN - error.token.startOffset,
		message: error.name + ": " + error.message,
	};
}

export function semanticErrorToCommonError(error: ISemanticError): ICommonError {
	(error as ICommonError).type = "Semantic Error";
	return error as ICommonError;
}