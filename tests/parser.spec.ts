/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

import { Human2RegexLexer, Human2RegexLexerOptions } from "../src/lexer";
import { Human2RegexParser, Human2RegexParserOptions } from "../src/parser";
import { IToken } from "chevrotain";
import { RegularExpressionCST } from "../src/generator";


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
        parser.input = tokens;
        expect(() => parser.parse()).not.toThrow();
        expect(parser.parse()).toBeInstanceOf(RegularExpressionCST);
        expect(parser.errors.length).toEqual(0);

        tokens = lexer.tokenize("\n/* hello world */\n").tokens;
        parser.input = tokens;
        expect(() => parser.parse()).not.toThrow();
        expect(parser.parse()).toBeInstanceOf(RegularExpressionCST);
        expect(parser.errors.length).toEqual(0);
    });

    it("parses something", function() {
        let tokens: IToken[] = [];

        tokens = lexer.tokenize('optionally create a group called test\n\toptionally match "-" or "$/()" then "^[]"\n').tokens;
        parser.input = tokens;
        expect(() => parser.parse()).not.toThrow();
        parser.input = tokens;
        expect(parser.parse()).toBeInstanceOf(RegularExpressionCST);
        expect(parser.errors.length).toEqual(0);

        tokens = lexer.tokenize('optionally create a group called test\n\trepeat 3..five\n\t\toptionally match "-" or "$/()" then "^[]"').tokens;
        parser.input = tokens;
        expect(() => parser.parse()).not.toThrow();
        parser.input = tokens;
        expect(parser.parse()).toBeInstanceOf(RegularExpressionCST);
        expect(parser.errors.length).toEqual(0);
    });

    it("fails to parse bad text", function() {
        let tokens: IToken[] = [];
        
        tokens = lexer.tokenize('optionally create a group called\n\toptionally match "-" or "$/()" then "^[]"\n').tokens;
        parser.input = tokens;
        expect(() => parser.parse()).not.toThrow();
        expect(parser.errors.length).toBeGreaterThan(0);

        tokens = lexer.tokenize('optionally create a called test\n\toptionally match "-" or "$/()" then "^[]"\n').tokens;
        parser.input = tokens;
        expect(() => parser.parse()).not.toThrow();
        expect(parser.errors.length).toBeGreaterThan(0);

        tokens = lexer.tokenize('optionally create a group\n\toptionally match or "$/()" then "^[]"\n').tokens;
        parser.input = tokens;
        expect(() => parser.parse()).not.toThrow();
        expect(parser.errors.length).toBeGreaterThan(0);
    });
});

