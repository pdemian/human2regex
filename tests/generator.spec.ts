/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

import { Human2RegexParser, Human2RegexParserOptions } from "../src/parser";
import { Human2RegexLexer, Human2RegexLexerOptions } from "../src/lexer";
import { RegexDialect, minimizeMatchString } from "../src/generator";


describe("Generator functionality", function() {
    const lexer = new Human2RegexLexer(new Human2RegexLexerOptions(true));
    const parser = new Human2RegexParser(new Human2RegexParserOptions(true));

    it("generates an empty regex", function() {
        const toks0 = lexer.tokenize("").tokens;
        const reg0 = parser.parse(toks0);
        expect(reg0.validate(RegexDialect.JS).length).toBe(0);
        expect(reg0.toRegex(RegexDialect.JS)).toBe("//");

        const toks1 = lexer.tokenize("\n/*hello world*/\n").tokens;
        const reg1 = parser.parse(toks1);
        expect(reg1.validate(RegexDialect.JS).length).toBe(0);
        expect(reg1.toRegex(RegexDialect.JS)).toBe("//");
    });

    it("generates a basic regex", function() {
        const toks0 = lexer.tokenize('match "hello" or "world"').tokens;
        const reg0 = parser.parse(toks0);
        expect(reg0.validate(RegexDialect.JS).length).toBe(0);
        expect(reg0.toRegex(RegexDialect.JS)).toBe("/hello|world/");

        const toks1 = lexer.tokenize('match "http" then optionally "s"').tokens;
        const reg1 = parser.parse(toks1);
        expect(reg1.validate(RegexDialect.JS).length).toBe(0);
        expect(reg1.toRegex(RegexDialect.JS)).toBe("/https?/");

        const toks2 = lexer.tokenize('match "a" or "b" or "c"').tokens;
        const reg2 = parser.parse(toks2);
        expect(reg2.validate(RegexDialect.JS).length).toBe(0);
        expect(reg2.toRegex(RegexDialect.JS)).toBe("/[abc]/");

        const toks3 = lexer.tokenize('optionally repeat 3..5 times\n\tmatch "hello"').tokens;
        const reg3 = parser.parse(toks3);
        expect(reg3.validate(RegexDialect.JS).length).toBe(0);
        expect(reg3.toRegex(RegexDialect.JS)).toBe("/(?:(?:hello){3,5})?/");
    });

    it("validates invalid regexes", function() {
        const toks0 = lexer.tokenize('match unicode "NotARealClass"').tokens;
        const reg0 = parser.parse(toks0);
        expect(reg0.validate(RegexDialect.JS).length).toBeGreaterThan(0);

        const toks1 = lexer.tokenize("using global and global").tokens;
        const reg1 = parser.parse(toks1);
        expect(reg1.validate(RegexDialect.JS).length).toBeGreaterThan(0);

        const toks2 = lexer.tokenize('match "a" to "asdf"').tokens;
        const reg2 = parser.parse(toks2);
        expect(reg2.validate(RegexDialect.JS).length).toBeGreaterThan(0);

        const toks3 = lexer.tokenize('match "asdf" to "zsdf"').tokens;
        const reg3 = parser.parse(toks3);
        expect(reg3.validate(RegexDialect.JS).length).toBeGreaterThan(0);

        const toks4 = lexer.tokenize("using case insensitive and case sensitive matching").tokens;
        const reg4 = parser.parse(toks4);
        expect(reg4.validate(RegexDialect.JS).length).toBeGreaterThan(0);

        const toks5 = lexer.tokenize('match between 2 and 2 exclusive "hello"').tokens;
        const reg5 = parser.parse(toks5);
        expect(reg5.validate(RegexDialect.JS).length).toBeGreaterThan(0);
    });

    it("handles ranges", function() {
        const toks0 = lexer.tokenize('match "a" to "z"').tokens;
        const reg0 = parser.parse(toks0);
        expect(reg0.validate(RegexDialect.JS).length).toBe(0);
        expect(reg0.toRegex(RegexDialect.JS)).toBe("/[a-z]/");

        const toks1 = lexer.tokenize('match "\\u0061" to "\\u007A"').tokens;
        const reg1 = parser.parse(toks1);
        expect(reg1.validate(RegexDialect.JS).length).toBe(0);
        expect(reg1.toRegex(RegexDialect.JS)).toBe("/[\\u0061-\\u007A]/");
    });

    it("handles specifiers", function() {
        const toks0 = lexer.tokenize("match boundary, word, digit, character, whitespace, number, tab, newline, carriage return").tokens;
        const reg0 = parser.parse(toks0);
        expect(reg0.validate(RegexDialect.JS).length).toBe(0);
        expect(reg0.toRegex(RegexDialect.JS)).toBe("/\\b\\w+\\d\\w\\s\\d+\\t\\n\\r/");

        const toks1 = lexer.tokenize("match not boundary, not word, not digit, not character, not whitespace, not number, not tab, not newline, not carriage return").tokens;
        const reg1 = parser.parse(toks1);
        expect(reg1.validate(RegexDialect.JS).length).toBe(0);
        expect(reg1.toRegex(RegexDialect.JS)).toBe("/\\B\\W+\\D\\W\\S\\D+[^\\t][^\\n][^\\r]/");
    });

    it("doesn't clobber repetition", function() {
        const toks0 = lexer.tokenize("match 1+ word").tokens;
        const reg0 = parser.parse(toks0);
        expect(reg0.validate(RegexDialect.JS).length).toBe(0);

        // should be \w+ not \w++
        expect(reg0.toRegex(RegexDialect.JS)).toBe("/\\w+/");

        const toks1 = lexer.tokenize('match 1 ... seven exclusive not "hello"').tokens;
        const reg1 = parser.parse(toks1);
        expect(reg1.validate(RegexDialect.JS).length).toBe(0);

        // should be (?!hello) not (?:(?!hello))
        expect(reg1.toRegex(RegexDialect.JS)).toBe("/(?!hello){1,6}/");
    });

    it("can minimize matches", function() {
        const test_cases = [
            { from: [ "abc", "abc" ], to: "abc" },
            { from: [ "a", "ab" ], to: "ab?" },
            { from: [ "a1x1z", "a2y2z", "a3z3z" ], to: "a(?:1x1|2y2|3z3)z" },
            { from: [ "ab", "cd" ], to: "ab|cd" },
            { from: [ "abc", "bc" ], to: "a?bc" },
            { from: [ "abc", "xb" ], to: "abc|xb" }
        ];

        for (const c of test_cases) {
            const got = minimizeMatchString(c.from);

            expect(got).toBe(c.to);
        }
    });

    it("optimizes correctly", function() {
        const toks0 = lexer.tokenize('match "a" or "b" or "b"').tokens;
        const reg0 = parser.parse(toks0);
        expect(reg0.validate(RegexDialect.JS).length).toBe(0);
        expect(reg0.toRegex(RegexDialect.JS)).toBe("/[ab]/");

        const toks1 = lexer.tokenize('match "a" or "a"').tokens;
        const reg1 = parser.parse(toks1);
        expect(reg1.validate(RegexDialect.JS).length).toBe(0);
        expect(reg1.toRegex(RegexDialect.JS)).toBe("/a/");

        const toks2 = lexer.tokenize('match "a1z" or "a2z" or "a3z"').tokens;
        const reg2 = parser.parse(toks2);
        expect(reg2.validate(RegexDialect.JS).length).toBe(0);
        expect(reg2.toRegex(RegexDialect.JS)).toBe("/a[123]z/");

        const toks3 = lexer.tokenize('match "a11z" or "a2z" or "a3z"').tokens;
        const reg3 = parser.parse(toks3);
        expect(reg3.validate(RegexDialect.JS).length).toBe(0);
        expect(reg3.toRegex(RegexDialect.JS)).toBe("/a(?:11|2|3)z/");

        const toks4 = lexer.tokenize('match "a1x1z" or "a2x2z" or "a3x3z"').tokens;
        const reg4 = parser.parse(toks4);
        expect(reg4.validate(RegexDialect.JS).length).toBe(0);
        expect(reg4.toRegex(RegexDialect.JS)).toBe("/a(?:1x1|2x2|3x3)z/");
    });

    it("handles unicode", function() {
        const toks0 = lexer.tokenize('match unicode class "Latin"').tokens;
        const reg0 = parser.parse(toks0);

        expect(reg0.validate(RegexDialect.JS).length).toBe(0);
        expect(reg0.toRegex(RegexDialect.JS)).toBe("/\\p{Latin}/");

        // .NET requires "IsLatin"
        expect(reg0.validate(RegexDialect.DotNet).length).toBeGreaterThan(0);
        const toks1 = lexer.tokenize('match unicode class "IsLatin"').tokens;
        const reg1 = parser.parse(toks1);
        expect(reg1.validate(RegexDialect.DotNet).length).toBe(0);
        expect(reg1.toRegex(RegexDialect.DotNet)).toBe("/\\p{IsLatin}/");
    });

    it("runs complex scripts", function() {
        const str = `
using global and multiline and exact matching
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
    const toks = lexer.tokenize(str).tokens;
    const reg = parser.parse(toks);
    expect(reg.validate(RegexDialect.JS).length).toBe(0);
    expect(reg.toRegex(RegexDialect.JS)).toBe("/^(?<protocol>https?\\:\\/\\/)?(?<subdomain>(?:\\w+\\.)*)?(?<domain>(?:\\w+|_|\\-)+\\.\\w+)(?:\\:\\d*)?(?<path>(?:\\/(?:\\w+|_|\\-)*)*)?(\\?(?<query>(?:(?:\\w+|_|\\-)+=(?:\\w+|_|\\-)+)*))?(#.*)?$/gm");
    });
});