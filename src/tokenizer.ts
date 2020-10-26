/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

import { createToken, Lexer, IToken, createTokenInstance, ILexingResult } from "chevrotain";

export const Zero = createToken({name: "Zero", pattern: /zero/i });
export const One = createToken({name: "One", pattern: /one/i });
export const Two = createToken({name: "Two", pattern: /two/i });
export const Three = createToken({name: "Three", pattern: /three/i });
export const Four = createToken({name: "Four", pattern: /four/i });
export const Five = createToken({name: "Five", pattern: /five/i });
export const Six = createToken({name: "Six", pattern: /six/i });
export const Seven = createToken({name: "Seven", pattern: /seven/i });
export const Eight = createToken({name: "Eight", pattern: /eight/i });
export const Nine = createToken({name: "Nine", pattern: /nine/i });
export const Ten = createToken({name: "Ten", pattern: /ten/i });

export const Optional = createToken({name: "Optional", pattern: /optional(ly)?/i });
export const Match = createToken({name: "Match", pattern: /match(es)?/i });
export const Then = createToken({name: "Then", pattern: /then/i });
export const Anything = createToken({name: "Anything", pattern: /(any thing|any|anything)(s)?/i});
export const Of = createToken({name: "Of", pattern: /of/i});
export const Or = createToken({name: "Or", pattern: /or/i});
export const And = createToken({name: "And", pattern: /and|,/i});
export const Word = createToken({name: "Word Specifier", pattern: /word(s)?/i});
export const Digit = createToken({name: "Digit Specifier", pattern: /digit(s)?/i});
export const Character = createToken({name: "Character Specifier", pattern: /character(s)?/i});
export const Whitespace = createToken({name: "Whitespace Specifier", pattern: /(white space|whitespace)(s)?/i});
export const Number = createToken({name: "NumberSpecifier", pattern: /number(s)?/i});
export const As = createToken({name: "As", pattern: /as/i});
export const If = createToken({name: "If", pattern: /if/i});
export const Start = createToken({name: "Start", pattern: /start(s)?/i});
export const With = createToken({name: "With", pattern: /with/i});
export const Ends = createToken({name: "Ends", pattern: /end(s)?/i});
export const Otherwise = createToken({name: "Otherwise", pattern: /(other wise|otherwise)/i});
export const Else = createToken({name: "Else", pattern: /else/i});
export const Unless = createToken({name: "Unless", pattern: /unless/i});
export const While = createToken({name: "While", pattern: /while/i});
export const More = createToken({name: "More", pattern: /more/i});
export const Using = createToken({name: "Using", pattern: /using/i});
export const Global = createToken({name: "Global", pattern: /global/i});
export const Multiline = createToken({name: "Multiline", pattern: /(multi line|multiline)/i});
export const Exact = createToken({name: "Exact", pattern: /exact/i});
export const Matching = createToken({name: "Matching", pattern: /matching/i});
export const Nothing = createToken({name: "Nothing", pattern: /nothing/i});
export const Not = createToken({name: "Not", pattern: /not/i }); //, longer_alt: Nothing});
export const Between = createToken({name: "Between", pattern: /between/i});
export const Tab = createToken({name: "Tab", pattern: /tab/i});
export const Linefeed = createToken({name: "Linefeed", pattern: /(line feed|linefeed)/i});
export const Group = createToken({name: "Group", pattern: /group/i});
export const By = createToken({name: "By", pattern: /by/i});
export const A = createToken({name: "A", pattern: /a(n)?/i }); //, longer_alt: Anything});
export const The = createToken({name: "The", pattern: /the/i }); //, longer_alt: Then});
export const Exactly = createToken({name: "Exactly", pattern: /exact(ly)?/i});
export const Inclusive = createToken({name: "Inclusive", pattern: /inclusive(ly)?/i});
export const Exclusive = createToken({name: "Exclusive", pattern: /exclusive(ly)?/i});
export const From = createToken({name: "From", pattern: /from/i});
export const To = createToken({name: "To", pattern: /(to|\-|\.\.|\.\.\.)/i});
export const Create = createToken({name: "Create", pattern: /create(s)?/i});
export const Called = createToken({name: "Called", pattern: /called/i});
export const Repeat = createToken({name: "Repeat", pattern: /repeat(s|ing)?/i});
export const Newline = createToken({name: "Newline", pattern: /(new line|newline)/i});
export const None = createToken({name: "None", pattern: /none/i});
export const Neither = createToken({name: "Neither", pattern: /neither/i});
export const CarriageReturn = createToken({name: "Carriage Return", pattern: /carriage return/i});
export const CaseInsensitive = createToken({name: "Case Insensitive", pattern: /case insensitive/i});
export const CaseSensitive = createToken({name: "Case Sensitive", pattern: /case sensitive/i});
export const OrMore = createToken({name: "Or More", pattern: /\+/ });

export const LBracket = createToken({name: "Left Bracket", pattern: /\(/ });
export const RBracket = createToken({name: "Right Bracket", pattern: /\)/ });

export const EndOfLine = createToken({name: "EOL", pattern: /\n/, group: "nl" });
export const WhiteSpace = createToken({name: "Whitespace", pattern: /\s+/, group: Lexer.SKIPPED });
export const SingleLineComment = createToken({name: "Single-Line Comment", pattern: /(#|\/\/).*/, group: Lexer.SKIPPED });
export const MultilineComment = createToken({name: "Multi-Line Comment", pattern: /\/\*(.*)\*\//, line_breaks: true, group: Lexer.SKIPPED });

export const Identifier = createToken({name: "Identifier", pattern: /[a-z]\w*/i });
export const NumberLiteral = createToken({name: "Number Literal", pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/ });
export const StringLiteral = createToken({name: "String Literal", pattern: /"(?:[^\\"]|\\(?:[bfnrtv"\\/]|u[0-9a-f]{4}|U[0-9a-f]{8}))*"/i });

enum IndentBaseType {
    Indent,
    Outdent
}

export const Indent = createToken({
    name: "Indent",
    start_chars_hint: [ "\t", " " ],
    pattern: (text, offset, matchedTokens, groups) => Human2RegexLexer.matchIndentBase(text, offset, matchedTokens, groups, IndentBaseType.Indent),
    // custom token patterns should explicitly specify the line_breaks option
    line_breaks: false
});

export const Outdent = createToken({
    name: "Outdent",
    start_chars_hint: [ "\t", " " ],
    pattern: (text, offset, matchedTokens, groups) => Human2RegexLexer.matchIndentBase(text, offset, matchedTokens, groups, IndentBaseType.Outdent),
    // custom token patterns should explicitly specify the line_breaks option
    line_breaks: false
});

export const AllTokens = [
    Zero,
    One,
    Two,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    Ten,
    Optional,
    Matching,
    Match,
    Then,
    Anything,
    Of,
    Or,
    And,
    Word,
    Digit,
    Character,
    Whitespace,
    Number,
    As,
    If,
    Start,
    With,
    Ends,
    Otherwise,
    Else,
    Unless,
    While,
    More,
    Using,
    Global,
    Multiline,
    Exact,
    Nothing,
    Not,
    Between,
    Tab,
    Linefeed,
    Group,
    By,
    A,
    The,
    Exactly,
    Inclusive,
    Exclusive,
    From,
    Create,
    Called,
    Repeat,
    Newline,
    None,
    Neither,
    CarriageReturn,
    CaseInsensitive,
    CaseSensitive,
    OrMore,
    To,
    EndOfLine,
    Indent,
    Outdent,
    WhiteSpace,
    SingleLineComment,
    MultilineComment,
    Identifier,
    NumberLiteral,
    StringLiteral,
];

const H2RLexer = new Lexer(AllTokens, { ensureOptimizations: true });

export enum IndentType {
    Tabs,
    Spaces,
    Both
}

export class Human2RegexLexerOptions {
    constructor(public type: IndentType = IndentType.Both, public spaces_per_tab: number = 4) {
        /* empty */
    }
}

export class Human2RegexLexer {
    //Taken and adapted from https://github.com/SAP/chevrotain/blob/master/examples/lexer/python_indentation/python_indentation.js

    // State required for matching the indentations
    private static options = new Human2RegexLexerOptions();
    private static indentStack = [ 0 ];
    private static wsRegExp: RegExp;
    private static spacesPerTab = "   ";

    private static findLastIndex<T>(array: T[], predicate: (x: T) => boolean) : number {
        for (let index = array.length; index >= 0; index--) {
            if (predicate(array[index])) {
                return index;
            }
        }
        return -1;
    }

    /**
     * This custom Token matcher uses Lexer context ("matchedTokens" and "groups" arguments)
     * combined with state via closure ("indentStack" and "lastTextMatched") to match indentation.
     */
    public static matchIndentBase(text: string, offset: number, matchedTokens: IToken[], groups: {[groupName: string]: IToken[]}, type: IndentBaseType) : RegExpExecArray | null  {
        const noTokensMatchedYet = !matchedTokens.length;
        const newLines = groups.nl;
        const noNewLinesMatchedYet = !newLines.length;
        const isFirstLine = noTokensMatchedYet && noNewLinesMatchedYet;
        const isStartOfLine =
            // only newlines matched so far
            (noTokensMatchedYet && !noNewLinesMatchedYet) ||
            // Both newlines and other Tokens have been matched AND the offset is just after the last newline
            (!noTokensMatchedYet &&
            !noNewLinesMatchedYet &&
            offset === newLines[newLines.length-1].startOffset + 1);

        // indentation can only be matched at the start of a line.
        if (isFirstLine || isStartOfLine) {
            let currIndentLevel: number = -1;

            Human2RegexLexer.wsRegExp.lastIndex = offset;
            const match = Human2RegexLexer.wsRegExp.exec(text);
            
            // possible non-empty indentation
            if (match !== null) {
                currIndentLevel = match[0].length;
                //if (this.options.type === IndentType.Tabs) {
                //    currIndentLevel = match[0].length;
                //}
                //else {
                //    currIndentLevel = match[0].replace(Human2RegexLexer.spacesPerTab, "\t").length;
                //}
            }
            // "empty" indentation means indentLevel of 0.
            else {
                currIndentLevel = 0;
            }

            const prevIndentLevel = this.indentStack[this.indentStack.length-1];
            // deeper indentation
            if (currIndentLevel > prevIndentLevel && type === IndentBaseType.Indent) {
                this.indentStack.push(currIndentLevel);
                return match;
            }
            // shallower indentation
            else if (currIndentLevel < prevIndentLevel && type === IndentBaseType.Outdent) {
                const matchIndentIndex = this.findLastIndex(this.indentStack, (stackIndentDepth) => stackIndentDepth === currIndentLevel);

                // any outdent must match some previous indentation level.
                if (matchIndentIndex === -1) {
                    throw Error(`invalid outdent at offset: ${offset}`);
                }

                const numberOfDedents = this.indentStack.length - matchIndentIndex - 1;

                // This is a little tricky
                // 1. If there is no match (0 level indent) than this custom token
                //    matcher would return "null" and so we need to add all the required outdents ourselves.
                // 2. If there was match (> 0 level indent) than we need to add minus one number of outsents
                //    because the lexer would create one due to returning a none null result.
                const iStart = match !== null ? 1 : 0;
                for (let i = iStart; i < numberOfDedents; i++) {
                    this.indentStack.pop();
                    matchedTokens.push(createTokenInstance(Outdent, "", NaN, NaN, NaN, NaN, NaN, NaN));
                }

                // even though we are adding fewer outdents directly we still need to update the indent stack fully.
                if (iStart === 1) {
                    this.indentStack.pop();
                }
                return match;
            } 
            else {
                // same indent, this should be lexed as simple whitespace and ignored
                return null;
            }
        } 
        else {
            // indentation cannot be matched under other circumstances
            return null;
        }
    }

    public static tokenize(text: string, options: Human2RegexLexerOptions | null = null) : ILexingResult{
        // have to reset the indent stack between processing of different text inputs
        Human2RegexLexer.indentStack = [ 0 ];

        if (options !== null) {
            Human2RegexLexer.options = this.options;
        }

        /*
        if (this.options.type === IndentType.Tabs) {
            Human2RegexLexer.wsRegExp = /\t/y;
        }
        else {
            let reg = ` {${this.options.spaces_per_tab}}`;

            if (this.options.type === IndentType.Both) {
                reg += "|\\t";
            }

            Human2RegexLexer.wsRegExp = new RegExp(reg, "y");

            Human2RegexLexer.spacesPerTab = Array(this.options.spaces_per_tab+1).join(" ");
        }*/
        Human2RegexLexer.wsRegExp = / +/y;
    
        const lexResult = H2RLexer.tokenize(text);
    
        //add remaining Outdents
        while (Human2RegexLexer.indentStack.length > 1) {
            lexResult.tokens.push(createTokenInstance(Outdent, "", NaN, NaN, NaN, NaN, NaN, NaN));
            Human2RegexLexer.indentStack.pop();
        }
    
        return lexResult;
    }
}