/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

import { Human2RegexLexer, Human2RegexLexerOptions } from "../src/lexer";
import { Human2RegexParser, Human2RegexParserOptions, ParseResult } from "../src/parser";
import { IToken } from "chevrotain";

describe("Parser capabilities", function() {
    const lexer = new Human2RegexLexer(new Human2RegexLexerOptions(true));
    // eslint-disable-next-line init-declarations
    let parser!: Human2RegexParser;

    it("validates", function() {
        expect(() => parser = new Human2RegexParser(new Human2RegexParserOptions(false))).not.toThrow();
    });

    it("parses nothing", function() {
        let tokens: IToken[] = [];

        tokens = lexer.tokenize("").tokens;
        expect(() => parser.parse(tokens)).not.toThrow();
        const result0 = parser.parse(tokens);
        expect(result0).toBeInstanceOf(ParseResult);
        expect(result0.errors.length).toEqual(0);

        tokens = lexer.tokenize("\n/* hello world */\n").tokens;
        expect(() => parser.parse(tokens)).not.toThrow();
        const result1 = parser.parse(tokens);
        expect(result1).toBeInstanceOf(ParseResult);
        expect(result1.errors.length).toEqual(0);
    });

    it("parses something", function() {
        let tokens: IToken[] = [];

        tokens = lexer.tokenize('optionally create a group called test\n\toptionally match "-" or "$/()" then "^[]"\n').tokens;
        expect(() => parser.parse(tokens)).not.toThrow();
        expect(parser.parse(tokens)).toBeInstanceOf(ParseResult);
        expect(parser.errors.length).toEqual(0);

        tokens = lexer.tokenize('optionally create a group called test\n\trepeat 3..five\n\t\toptionally match "-" or "$/()" then "^[]"').tokens;
        expect(() => parser.parse(tokens)).not.toThrow();
        expect(parser.parse(tokens)).toBeInstanceOf(ParseResult);
        expect(parser.errors.length).toEqual(0);
    });

    it("fails to parse bad text", function() {
        let tokens: IToken[] = [];
        
        tokens = lexer.tokenize('optionally create a group called\n\toptionally match "-" or "$/()" then "^[]"\n').tokens;
        expect(() => parser.parse(tokens)).not.toThrow();
        expect(parser.errors.length).toBeGreaterThan(0);

        tokens = lexer.tokenize('optionally create a called test\n\toptionally match "-" or "$/()" then "^[]"\n').tokens;
        expect(() => parser.parse(tokens)).not.toThrow();
        expect(parser.errors.length).toBeGreaterThan(0);

        tokens = lexer.tokenize('optionally create a group\n\toptionally match or "$/()" then "^[]"\n').tokens;
        expect(() => parser.parse(tokens)).not.toThrow();
        expect(parser.errors.length).toBeGreaterThan(0);
    });
});

