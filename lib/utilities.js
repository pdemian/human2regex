"use strict";
/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonError = exports.regexEscape = exports.removeQuotes = exports.findLastIndex = exports.last = exports.first = exports.isSingleRegexCharacter = exports.combineFlags = exports.hasFlag = exports.makeFlag = exports.usefulConditional = exports.unusedParameter = void 0;
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
function unusedParameter(value, reason) {
    /* empty on purpose */
}
exports.unusedParameter = unusedParameter;
/**
 * Fixes linter warnings about useless conditionals, however requires a reason why it's useless
 *
 * @param conditional the supposedly useless conditional
 * @param reason the reason this value is required but considered useless
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function usefulConditional(conditional, reason) {
    return Boolean(conditional);
}
exports.usefulConditional = usefulConditional;
/* eslint-disable no-bitwise */
/**
 * Generates a bitwise flag based on the value provided
 *
 * @param value the number of bits to shift
 * @returns 1 << value
 * @internal
 */
function makeFlag(value) {
    return 1 << value;
}
exports.makeFlag = makeFlag;
/**
 * Checks if value has the given flag
 *
 * @param value First flag to compare
 * @param flag Second flag to compare
 * @returns value & flag
 * @internal
 */
function hasFlag(value, flag) {
    return (value & flag) !== 0;
}
exports.hasFlag = hasFlag;
/**
 * Appends the flag to the value
 *
 * @param value First flag
 * @param flag Second flag
 * @returns value | flag
 * @internal
 */
function combineFlags(value, flag) {
    return (value | flag);
}
exports.combineFlags = combineFlags;
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
function isSingleRegexCharacter(char) {
    return (char.startsWith("\\u") && char.length === 6) ||
        (char.startsWith("\\U") && char.length === 8) ||
        (char.startsWith("\\") && char.length === 2) ||
        char.length === 1;
}
exports.isSingleRegexCharacter = isSingleRegexCharacter;
/**
 * Gets the first element of an array
 * @remarks does not validate if array has any elements
 *
 * @param array an array
 * @returns first element of an array
 * @internal
 */
function first(array) {
    return array[0];
}
exports.first = first;
/**
 * Gets the last element of an array
 * @remarks does not validate if array has any elements
 *
 * @param array an array
 * @returns last element of an array
 * @internal
 */
function last(array) {
    return array[array.length - 1];
}
exports.last = last;
/**
 * Find the last index of a given value in an array
 *
 * @param array an array
 * @param value the value to find
 * @returns an index if found or -1 if not found
 * @internal
 */
function findLastIndex(array, value) {
    for (let index = array.length - 1; index >= 0; index--) {
        if (array[index] === value) {
            return index;
        }
    }
    return -1;
}
exports.findLastIndex = findLastIndex;
/**
 * Removes start and end quotes from a string
 *
 * @param input the string to remove quotes from
 * @returns a string without quote characters
 * @internal
 */
function removeQuotes(input) {
    return input.substring(1, input.length - 1);
}
exports.removeQuotes = removeQuotes;
/**
 * Escapes a string so it may be used literally in a regular expression
 *
 * @param input the string to escape
 * @returns a regex escaped string
 * @internal
 */
function regexEscape(input) {
    return input.replace(/([:\\\-\.\[\]\^\|\(\)\*\+\?\{\}\$\/])/g, "\\$1");
}
exports.regexEscape = regexEscape;
/**
 * Common Error class that encapsulates information from the lexer, parser, and generator
 */
class CommonError {
    constructor(type, start_line, start_column, length, message) {
        this.type = type;
        this.start_line = start_line;
        this.start_column = start_column;
        this.length = length;
        this.message = message;
        /* empty */
    }
    /**
     * Creates a common error from a lexing error
     *
     * @param error The lexing error
     * @returns a new CommonError
     */
    static fromLexError(error) {
        // not really fond of --> and <--
        const new_msg = error.message.replace(/(--?>|<--?)/g, "");
        return new CommonError("Lexer Error", error.line, error.column, error.length, new_msg);
    }
    /**
     * Creates a common error from a parsing error
     *
     * @param error The parsing error
     * @returns a new CommonError
     */
    static fromParseError(error) {
        var _a, _b, _c;
        // not really fond of --> and <--
        const new_msg = error.name + " - " + error.message.replace(/(--?>|<--?)/g, "");
        return new CommonError("Parser Error", (_a = error.token.startLine) !== null && _a !== void 0 ? _a : NaN, (_b = error.token.startColumn) !== null && _b !== void 0 ? _b : NaN, (_c = error.token.endOffset) !== null && _c !== void 0 ? _c : NaN - error.token.startOffset, new_msg);
    }
    /**
     * Creates a common error from a semantic error
     *
     * @param error The semantic error
     * @returns a new CommonError
     */
    static fromSemanticError(error) {
        return new CommonError("Semantic Error", error.startLine, error.startColumn, error.length, error.message);
    }
    /**
     * Generates a string representation of a CommonError
     *
     * @returns a string representation
     */
    toString() {
        return `${this.type} @ (${this.start_line}, ${this.start_column}): ${this.message}`;
    }
}
exports.CommonError = CommonError;
