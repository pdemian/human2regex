/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

import { Human2RegexParser, Human2RegexParserOptions } from "../src/parser";
import { Human2RegexLexer, Human2RegexLexerOptions } from "../src/lexer";
import { RegexDialect } from "../src/generator";


describe("Generator functionality", function() {
    const lexer = new Human2RegexLexer(new Human2RegexLexerOptions(true));
    // eslint-disable-next-line init-declarations
    const parser = new Human2RegexParser(new Human2RegexParserOptions(true));

    it("generates an empty regex", function() {
        parser.input = lexer.tokenize("").tokens;
        const reg0 = parser.parse();
        expect(reg0.validate(RegexDialect.JS).length).toBe(0);
        expect(reg0.toRegex(RegexDialect.JS)).toBe("//");

        parser.input = lexer.tokenize("\n/*hello world*/\n").tokens;
        const reg1 = parser.parse();
        expect(reg1.validate(RegexDialect.JS).length).toBe(0);
        expect(reg1.toRegex(RegexDialect.JS)).toBe("//");
    });

    it("generates a basic regex", function() {
        parser.input = lexer.tokenize('match "hello" or "world"').tokens;
        const reg0 = parser.parse();
        expect(reg0.validate(RegexDialect.JS).length).toBe(0);
        expect(reg0.toRegex(RegexDialect.JS)).toBe("/hello|world/");

        parser.input = lexer.tokenize('match "http" then optionally "s"').tokens;
        const reg1 = parser.parse();
        expect(reg1.validate(RegexDialect.JS).length).toBe(0);
        expect(reg1.toRegex(RegexDialect.JS)).toBe("/https?/");

        parser.input = lexer.tokenize("match 1+ words").tokens;
        const reg2 = parser.parse();
        expect(reg2.validate(RegexDialect.JS).length).toBe(0);
        expect(reg2.toRegex(RegexDialect.JS)).toBe("/\\w+/"); // used to generate w++. make sure not to regress
    });

    it("validates invalid regexes", function() {
        parser.input = lexer.tokenize('match unicode "Latin"').tokens;
        const reg0 = parser.parse();
        expect(reg0.validate(RegexDialect.DotNet).length).toBeGreaterThan(0);

        parser.input = lexer.tokenize("using global and global").tokens;
        const reg1 = parser.parse();
        expect(reg1.validate(RegexDialect.DotNet).length).toBeGreaterThan(0);

        parser.input = lexer.tokenize('match "a" to "asdf"').tokens;
        const reg2 = parser.parse();
        expect(reg2.validate(RegexDialect.DotNet).length).toBeGreaterThan(0);

    });

    it("runs complex scripts", function() {
        const str = `
using global and exact matching
create an optional group called protocol
    match "http"
    optionally match "s"
    match "://"
create an optional group called subdomain
    repeat
        match a word
        match "."
create a group called domain
    match 1+ words or "_" or "-"
    match "."
    match a word
# port, but we don't care about it, so ignore it
optionally match ":" then 0+ digits
create an optional group called path
    repeat
        match "/"
        match 0+ words or "_" or "-"
create an optional group
    # we don't want to capture the '?', so don't name the group until afterwards
    match "?"
    create a group called query
        repeat
            match 1+ words or "_" or "-"
            match "="
            match 1+ words or "_" or "-"
create an optional group
    # fragment, again, we don't care, so ignore everything afterwards
    match "#"
    match 0+ any thing
`;
    parser.input = lexer.tokenize(str).tokens;
    const reg = parser.parse();
    expect(reg.validate(RegexDialect.JS).length).toBe(0);
    expect(reg.toRegex(RegexDialect.JS)).toBe("/^(?<protocol>https?\\:\\/\\/)?(?<subdomain>(\\w+\\.)*)?(?<domain>(?:\\w+|_|\\-)+\\.\\w+)\\:?\\d*(?<path>(\\/(?:\\w+|_|\\-)*)*)?(\\?(?<query>((?:\\w+|_|\\-)+\=(?:\\w+|_|\\-)+)*))?(#.*)?$/g");
    });
});