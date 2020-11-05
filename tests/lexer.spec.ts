/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

import { Human2RegexLexer, Human2RegexLexerOptions, IndentType } from "../src/lexer";
import { Indent } from "../src/tokens";

describe("Lexer capabilities", function() {
    const lexer = new Human2RegexLexer(new Human2RegexLexerOptions(true));

    it("validates", function() {
        expect(() => lexer.setOptions(new Human2RegexLexerOptions(false, IndentType.Both))).not.toThrow();
    });

    it("parses nothing", function() {
        expect(() => lexer.tokenize("")).not.toThrow();
        expect(lexer.tokenize("").errors).toHaveLength(0);
        expect(lexer.tokenize("").tokens).toHaveLength(0);

        expect(() => lexer.tokenize("\n/* hello world */\n")).not.toThrow();
        expect(lexer.tokenize("\n/* hello world */\n").errors).toHaveLength(0);
        expect(lexer.tokenize("\n/* hello world */\n").tokens).toHaveLength(0);
    });

    it("parses something", function() {
        // tabs
        expect(() => lexer.tokenize('optionally create a group called test\n\toptionally match "-" or "$/()" then "^[]"\n')).not.toThrow();
        expect(lexer.tokenize('optionally create a group called test\n\toptionally match "-" or "$/()" then "^[]"\n').errors).toHaveLength(0);
        expect(lexer.tokenize('optionally create a group called test\n\toptionally match "-" or "$/()" then "^[]"\n').tokens).toHaveLength(17);

        // spaces
        expect(() => lexer.tokenize('optionally create a group called test\n    optionally match "-" or "$/()" then "^[]"\n')).not.toThrow();
        expect(lexer.tokenize('optionally create a group called test\n    optionally match "-" or "$/()" then "^[]"\n').errors).toHaveLength(0);
        expect(lexer.tokenize('optionally create a group called test\n    optionally match "-" or "$/()" then "^[]"\n').tokens).toHaveLength(17);

        // no EOF newline
        expect(() => lexer.tokenize('optionally create a group called test\n\toptionally match "-" or "$/()" then "^[]"')).not.toThrow();
        expect(lexer.tokenize('optionally create a group called test\n\toptionally match "-" or "$/()" then "^[]"').errors).toHaveLength(0);
        expect(lexer.tokenize('optionally create a group called test\n\toptionally match "-" or "$/()" then "^[]"').tokens).toHaveLength(17);

        // Outdent
        expect(() => lexer.tokenize('optionally create a group\n\trepeat\n\t\tmatch "-"\n\toptionally match "-" or "$/()" then "^[]"\n')).not.toThrow();
        expect(lexer.tokenize('optionally create a group\n\trepeat\n\t\tmatch "-"\n\toptionally match "-" or "$/()" then "^[]"\n').errors).toHaveLength(0);
        expect(lexer.tokenize('optionally create a group\n\trepeat\n\t\tmatch "-"\n\toptionally match "-" or "$/()" then "^[]"\n').tokens).toHaveLength(22);
    });

    it("fails to parse bad text", function() {
        // double indent
        expect(() => lexer.tokenize('optionally create a group called test\n\t\toptionally match "-" or "$/()" then "^[]"')).not.toThrow();
        expect(lexer.tokenize('optionally create a group called test\n\t\toptionally match "-" or "$/()" then "^[]"').errors.length).toBeGreaterThan(0);
        
        // missing " at end
        expect(() => lexer.tokenize('optionally create a group\n\toptionally match "- or "$/()" then "^[]')).not.toThrow();
        expect(lexer.tokenize('optionally create a group\n\toptionally match "- or "$/()" then "^[]').errors.length).toBeGreaterThan(0);
    });

    it("handles switching between tabs and spaces", function() {
        lexer.setOptions(new Human2RegexLexerOptions(true, IndentType.Tabs));

        // tabs
        expect(() => lexer.tokenize('optionally create a group called test\n\toptionally match "-" or "$/()" then "^[]"\n')).not.toThrow();
        expect(lexer.tokenize('optionally create a group called test\n\toptionally match "-" or "$/()" then "^[]"\n').errors).toHaveLength(0);
        expect(lexer.tokenize('optionally create a group called test\n\toptionally match "-" or "$/()" then "^[]"\n').tokens).toHaveLength(17);
        expect(lexer.tokenize('optionally create a group called test\n\toptionally match "-" or "$/()" then "^[]"\n').tokens.map((x) => x.tokenType)).toContain(Indent);

        // spaces should be ignored
        expect(() => lexer.tokenize('optionally create a group called test\n    optionally match "-" or "$/()" then "^[]"\n')).not.toThrow();
        expect(lexer.tokenize('optionally create a group called test\n    optionally match "-" or "$/()" then "^[]"\n').errors).toHaveLength(0);
        expect(lexer.tokenize('optionally create a group called test\n    optionally match "-" or "$/()" then "^[]"\n').tokens.map((x) => x.tokenType)).not.toContain(Indent);
    });
});