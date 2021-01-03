/*! Copyright (c) 2021 Patrick Demian; Licensed under MIT */

import { Human2RegexParser, Human2RegexParserOptions, ParseResult, 
         Human2RegexLexer, Human2RegexLexerOptions, TokenizeResult,
         RegexDialect, CommonError } from "../src/index";

describe("API functionality", function() {
    const lexer = new Human2RegexLexer(new Human2RegexLexerOptions(true));
    const parser = new Human2RegexParser(new Human2RegexParserOptions(true));

    it("API works", function() {
        const token_result = lexer.tokenize("match");
        expect(token_result).toBeInstanceOf(TokenizeResult);

        const parse_result = parser.parse(token_result.tokens);
        expect(parse_result).toBeInstanceOf(ParseResult);

        for (const err of parse_result.errors) {
            expect(err).toBeInstanceOf(CommonError);
        }

        const regex_result = parser.parse(lexer.tokenize("").tokens);
        expect(regex_result.validate(RegexDialect.JS)).toHaveLength(0);
        expect(regex_result.toRegex(RegexDialect.JS)).toBe("//");
        expect(regex_result.toRegExp(RegexDialect.JS)).toBeInstanceOf(RegExp);
    });
});