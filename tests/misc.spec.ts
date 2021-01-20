/*! Copyright (c) 2021 Patrick Demian; Licensed under MIT */

import { Human2RegexParser, Human2RegexParserOptions } from "../src/parser";
import { Human2RegexLexer, Human2RegexLexerOptions } from "../src/lexer";

describe("Misc functionality", function() {
    const lexer = new Human2RegexLexer(new Human2RegexLexerOptions(false));
    const parser = new Human2RegexParser(new Human2RegexParserOptions(false));

    it("should only allow 1 instance", function() {
        expect(() => new Human2RegexLexer(new Human2RegexLexerOptions(true))).toThrow();
        expect(() => new Human2RegexParser(new Human2RegexParserOptions(true))).toThrow();
    });
});