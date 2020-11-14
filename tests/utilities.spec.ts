/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

import "../src/utilities";
import { isSingleRegexCharacter, findLastIndex, removeQuotes, regexEscape, hasFlag, combineFlags, makeFlag, first, last, CommonError } from "../src/utilities";
import { UsingFlags, ISemanticError } from "../src/generator";
import { IRecognitionException, ILexingError, createTokenInstance } from "chevrotain";
import { Indent } from "../src/tokens";

describe("Utility functions", function() {

    it("should handle flags", function() {
        expect(makeFlag(0)).toBe(1);
        expect(makeFlag(7)).toBe(1*2*2*2*2*2*2*2);

        expect(combineFlags(UsingFlags.Exact, UsingFlags.Global)).toBe(UsingFlags.Exact + UsingFlags.Global);
        expect(combineFlags(UsingFlags.Multiline, combineFlags(UsingFlags.Exact, UsingFlags.Global))).toBe(UsingFlags.Exact + UsingFlags.Global + UsingFlags.Multiline);

        expect(hasFlag(UsingFlags.Exact, UsingFlags.Exact)).toBe(true);
        expect(hasFlag(UsingFlags.Exact, UsingFlags.Global)).toBe(false);

        expect(hasFlag(UsingFlags.Global + UsingFlags.Exact, UsingFlags.Exact)).toBe(true);
        expect(hasFlag(UsingFlags.Global + UsingFlags.Exact, UsingFlags.Multiline)).toBe(false);

        expect(hasFlag(combineFlags(UsingFlags.Global, UsingFlags.Exact), UsingFlags.Exact)).toBe(true);
        expect(hasFlag(combineFlags(UsingFlags.Global, UsingFlags.Exact), UsingFlags.Global)).toBe(true);
        expect(hasFlag(combineFlags(UsingFlags.Global, UsingFlags.Exact), UsingFlags.Multiline)).toBe(false);
    });

    it("should return correct array elements", function() {
        expect(first([ 1, 2, 3 ])).toBe(1);
        expect(last([ 1, 2, 3 ])).toBe(3);
    });

    it("should recognize single regex regular characters", function() {
        expect(isSingleRegexCharacter("")).toBe(false);
        expect(isSingleRegexCharacter("a")).toBe(true);
        expect(isSingleRegexCharacter("ab")).toBe(false);
    });

    it("should recognize single regex escape characters", function() {
        expect(isSingleRegexCharacter("\\n")).toBe(true);
        expect(isSingleRegexCharacter("\\r\\n")).toBe(false);
        expect(isSingleRegexCharacter("\\na")).toBe(false);
        expect(isSingleRegexCharacter("\\?")).toBe(true);
    });

    it("should recognize single unicode characters", function() {
        expect(isSingleRegexCharacter("\\u1")).toBe(false);
        expect(isSingleRegexCharacter("\\u1234")).toBe(true);
        expect(isSingleRegexCharacter("\\u1234\\u1234")).toBe(false);
        expect(isSingleRegexCharacter("\\U12345678")).toBe(false);
        expect(isSingleRegexCharacter("\\U1")).toBe(false);
        expect(isSingleRegexCharacter("௹")).toBe(true);
        expect(isSingleRegexCharacter("💩")).toBe(false);
    });

    it("should remove quotes correctly", function() {
        expect(removeQuotes('""')).toEqual("");
        expect(removeQuotes('"hello world"')).toEqual("hello world");
        expect(removeQuotes('"hello"world"')).toEqual('hello"world');
    });

    it("should escape regex correctly", function() {
        expect(regexEscape("")).toEqual("");
        expect(regexEscape("\\$")).toEqual("\\\\\\$");
        expect(regexEscape("^(.*)?\\?$")).toEqual("\\^\\(\\.\\*\\)\\?\\\\\\?\\$");
        expect(regexEscape("\\p{Latin}")).toEqual("\\\\p\\{Latin\\}");
    });

    it("should find the last index of an element", function() {
        expect(findLastIndex([], 3)).toBe(-1);
        expect(findLastIndex([ 3, 1, 2, 3, 3 ], 3)).toBe(4);
        expect(findLastIndex([ 3, 1, 2, 3, 3 ], 1)).toBe(1);
        expect(findLastIndex([ 3, 1, 2, 3, 3 ], 9)).toBe(-1);
    });

    it("should generate CommonError correctly", function() {
        const lex_error: ILexingError = {
            offset: 123,
            line: 123,
            column: 123,
            length: 123,
            message: "error"
        };

        const par_error: IRecognitionException = {
            name: "Recognition Exception",
            message: "Mismatch at 1,1",
            // eslint-disable-next-line no-magic-numbers
            token: createTokenInstance(Indent, "", 123, 124, 123, 123, 123, 124),
            resyncedTokens: [],
            context: { ruleStack: [], ruleOccurrenceStack: [] }
        };

        const sem_error: ISemanticError = {
            startLine: 123,
            startColumn: 123,
            length: 123,
            message: "error"
        };

        expect(CommonError.fromLexError(lex_error)).toBeInstanceOf(CommonError);
        expect(CommonError.fromParseError(par_error)).toBeInstanceOf(CommonError);
        expect(CommonError.fromSemanticError(sem_error)).toBeInstanceOf(CommonError);

        expect(() => CommonError.fromSemanticError(sem_error).toString()).not.toThrow();
        expect(CommonError.fromSemanticError(sem_error).toString()).not.toBeNull();
    });
});