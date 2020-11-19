/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

/**
 * The tokens required for Human2Regex
 * @packageDocumentation
 */

import { createToken, Lexer } from "chevrotain";

/** @internal */ export const Zero = createToken({name: "Zero", pattern: /zero/i});
/** @internal */ export const One = createToken({name: "One", pattern: /one/i});
/** @internal */ export const Two = createToken({name: "Two", pattern: /two/i});
/** @internal */ export const Three = createToken({name: "Three", pattern: /three/i});
/** @internal */ export const Four = createToken({name: "Four", pattern: /four/i});
/** @internal */ export const Five = createToken({name: "Five", pattern: /five/i});
/** @internal */ export const Six = createToken({name: "Six", pattern: /six/i});
/** @internal */ export const Seven = createToken({name: "Seven", pattern: /seven/i});
/** @internal */ export const Eight = createToken({name: "Eight", pattern: /eight/i});
/** @internal */ export const Nine = createToken({name: "Nine", pattern: /nine/i});
/** @internal */ export const Ten = createToken({name: "Ten", pattern: /ten/i});

/** @internal */ export const Optional = createToken({name: "Optional", pattern: /(optional(ly)?|possibl[ye]|maybe)/i});
/** @internal */ export const Match = createToken({name: "Match", pattern: /match(es)?/i});
/** @internal */ export const Then = createToken({name: "Then", pattern: /then/i});
/** @internal */ export const Anything = createToken({name: "Anything", pattern: /(any thing|any|anything)(s)?/i});
/** @internal */ export const Or = createToken({name: "Or", pattern: /or/i});
/** @internal */ export const And = createToken({name: "And", pattern: /and|,/i});
/** @internal */ export const Word = createToken({name: "WordSpecifier", pattern: /word(s)?/i});
/** @internal */ export const Digit = createToken({name: "DigitSpecifier", pattern: /digit(s)?/i});
/** @internal */ export const Character = createToken({name: "CharacterSpecifier", pattern: /character(s)?/i});
/** @internal */ export const Letter = createToken({name: "LetterSpecifier", pattern: /letter(s)?/i });
/** @internal */ export const Decimal = createToken({name: "DecimalSpecifier", pattern: /decimal(s)?/i });
/** @internal */ export const Integer = createToken({name: "IntegerSpecifier", pattern: /integer(s)?/i });
/** @internal */ export const Whitespace = createToken({name: "WhitespaceSpecifier", pattern: /(white space|whitespace)s?/i});
/** @internal */ export const Boundary = createToken({name: "BoundarySpecifier", pattern: /(word )?boundary/i});
/** @internal */ export const Number = createToken({name: "NumberSpecifier", pattern: /number(s)?/i});
/** @internal */ export const Unicode = createToken({name: "UnicodeSpecifier", pattern: /unicode( class)?/i});
/** @internal */ export const Using = createToken({name: "Using", pattern: /using/i});
/** @internal */ export const Global = createToken({name: "Global", pattern: /global/i});
/** @internal */ export const Multiline = createToken({name: "Multiline", pattern: /(multi line|multiline)/i});
/** @internal */ export const Exact = createToken({name: "Exact", pattern: /exact/i});
/** @internal */ export const Matching = createToken({name: "Matching", pattern: /matching/i});
/** @internal */ export const Not = createToken({name: "Not", pattern: /not|anything but|any thing but|everything but|every thing but/i});
/** @internal */ export const Between = createToken({name: "Between", pattern: /between/i});
/** @internal */ export const Tab = createToken({name: "Tab", pattern: /tab/i});
/** @internal */ export const Linefeed = createToken({name: "Linefeed", pattern: /(line feed|linefeed)/i});
/** @internal */ export const Group = createToken({name: "Group", pattern: /group/i});
/** @internal */ export const A = createToken({name: "A", pattern: /a(n)?/i });
/** @internal */ export const Times = createToken({name: "Times", pattern: /times/i});
/** @internal */ export const Exactly = createToken({name: "Exactly", pattern: /exact(ly)?/i});
/** @internal */ export const Inclusive = createToken({name: "Inclusive", pattern: /inclusive(ly)?/i});
/** @internal */ export const Exclusive = createToken({name: "Exclusive", pattern: /exclusive(ly)?/i});
/** @internal */ export const From = createToken({name: "From", pattern: /from/i});
/** @internal */ export const To = createToken({name: "To", pattern: /(to|through|thru|\-|\.\.\.?)/i});
/** @internal */ export const Create = createToken({name: "Create", pattern: /create(s)?/i});
/** @internal */ export const Called = createToken({name: "Called", pattern: /name(d)?|call(ed)?/i});
/** @internal */ export const Repeat = createToken({name: "Repeat", pattern: /repeat(s|ing)?/i});
/** @internal */ export const Newline = createToken({name: "Newline", pattern: /(new line|newline)/i});
/** @internal */ export const CarriageReturn = createToken({name: "CarriageReturn", pattern: /carriage return/i});
/** @internal */ export const CaseInsensitive = createToken({name: "CaseInsensitive", pattern: /case insensitive/i});
/** @internal */ export const CaseSensitive = createToken({name: "CaseSensitive", pattern: /case sensitive/i});
/** @internal */ export const OrMore = createToken({name: "OrMore", pattern: /\+|or more/i});
/** @internal */ export const Call = createToken({name: "Call", pattern: /call|invoke|execute|run|do|perform/i});
/** @internal */ export const The = createToken({name: "The", pattern: /the/i });
/*
//Not being used currently
export const Of = createToken({name: "Of", pattern: /of/i});
export const Nothing = createToken({name: "Nothing", pattern: /nothing/i});
export const As = createToken({name: "As", pattern: /as/i});
export const If = createToken({name: "If", pattern: /if/i});
export const Start = createToken({name: "Start", pattern: /start(s) with?/i});
export const Ends = createToken({name: "Ends", pattern: /end(s)? with/i});
export const Else = createToken({name: "Else", pattern: /(other wise|otherwise|else)/i});
export const Unless = createToken({name: "Unless", pattern: /unless/i});
export const While = createToken({name: "While", pattern: /while/i});
export const More = createToken({name: "More", pattern: /more/i});
export const LBracket = createToken({name: "Left Bracket", pattern: /\(/ });
export const RBracket = createToken({name: "Right Bracket", pattern: /\)/ });
export const None = createToken({name: "None", pattern: /none/i});
export const Neither = createToken({name: "Neither", pattern: /neither/i});

export const By = createToken({name: "By", pattern: /by/i});
*/


/** @internal */ export const EndOfLine = createToken({name: "EOL", pattern: /\n/});
/** @internal */ export const WS = createToken({name: "Whitespace", pattern: /[^\S\n]+/, start_chars_hint: [ " ", "\r" ], group: Lexer.SKIPPED});
/** @internal */ export const SingleLineComment = createToken({name: "SingleLineComment", pattern: /(#|\/\/).*/, group: Lexer.SKIPPED});
/** @internal */ export const MultilineComment = createToken({name: "MultiLineComment", pattern: /\/\*(.*)\*\//, line_breaks: true, group: Lexer.SKIPPED});

/** @internal */ export const Identifier = createToken({name: "Identifier", pattern: /[a-z]\w*/i});
/** @internal */ export const NumberLiteral = createToken({name: "NumberLiteral", pattern: /\d+/});
/** @internal */ export const StringLiteral = createToken({name: "StringLiteral", pattern: /"(?:[^\\"]|\\(?:[bfnrtv"\\/]|u[0-9a-f]{4}|U[0-9a-f]{8}))*"/i});

/** @internal */ export const Indent = createToken({name: "Indent"});
/** @internal */ export const Outdent = createToken({name: "Outdent"});

/**
 * All the tokens used
 * @internal
 */
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
    Not,
    Anything,
    And,
    Boundary,
    Word,
    Digit,
    Letter,
    Decimal,
    Integer,
    Character,
    Whitespace,
    Number,
    Unicode,
    Called,
    Call,
    The,
    Using,
    Global,
    Multiline,
    Exact,
    Between,
    Tab,
    Linefeed,
    Group,
    A,
    Times,
    Exactly,
    Inclusive,
    Exclusive,
    From,
    Create,
    Repeat,
    Newline,
    CarriageReturn,
    CaseInsensitive,
    CaseSensitive,
    OrMore,
    Or,
    To,
    EndOfLine,
    Indent,
    WS,
    SingleLineComment,
    MultilineComment,
    Identifier,
    NumberLiteral,
    StringLiteral,
];