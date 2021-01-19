/*! Copyright (c) 2021 Patrick Demian; Licensed under MIT */

import { minimizeMatchString, groupIfRequired, dontClobberRepetition } from "../src/generator_helper";

describe("Generator helper functionality", function() {
    it("can minimize matches", function() {
        const test_cases = [
            { from: [], to: "" },
            { from: [ "abc" ], to: "abc" },
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

    it("groups correctly", function() {
        const test_cases = [
            { from: "(?P=test)", to: "(?P=test)" },
            { from: "[abc\\]]", to: "[abc\\]]" },
            { from: "abc", to: "(?:abc)" },
            { from: "(abc)|d", to: "(?:(abc)|d)" },
            { from: "[abc\\]][abc]", to: "(?:[abc\\]][abc])" },
            { from: "(abc(abc)\\))(abc)", to: "(?:(abc(abc)\\))(abc))" },
            { from: ".*", to: ".*" }
        ];

        for (const c of test_cases) {
            const got = groupIfRequired(c.from);

            expect(got).toBe(c.to);
        }
    });

    it("doesn't clobber the repetition", function() {
        const test_cases = [
            { fragment: "1+", repetition: "+", expected: "1+" },
            { fragment: "1*", repetition: "+", expected: "1+" },
            { fragment: "1+", repetition: "*", expected: "1+" },
            { fragment: "1*", repetition: "*", expected: "1*" },
            { fragment: "1+", repetition: "?", expected: "1+?" },
            { fragment: "1*", repetition: "?", expected: "1*?" },
            { fragment: "1+", repetition: "{0,}", expected: "(?:1+){0,}" },
            { fragment: "1*", repetition: "{0,}", expected: "1{0,}" },
            { fragment: "1+", repetition: "{1,2}", expected: "1{1,2}" },
            { fragment: "1*", repetition: "{1,2}", expected: "1{1,2}" },
        ];

        for (const c of test_cases) {
            const got = dontClobberRepetition(c.fragment, c.repetition);

            expect(got).toBe(c.expected);
        }
    });
});