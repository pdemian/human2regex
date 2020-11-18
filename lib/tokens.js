"use strict";
/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllTokens = exports.Outdent = exports.Indent = exports.StringLiteral = exports.NumberLiteral = exports.Identifier = exports.MultilineComment = exports.SingleLineComment = exports.WS = exports.EndOfLine = exports.OrMore = exports.CaseSensitive = exports.CaseInsensitive = exports.CarriageReturn = exports.Newline = exports.Repeat = exports.Called = exports.Create = exports.To = exports.From = exports.Exclusive = exports.Inclusive = exports.Exactly = exports.Times = exports.A = exports.Group = exports.Linefeed = exports.Tab = exports.Between = exports.Not = exports.Matching = exports.Exact = exports.Multiline = exports.Global = exports.Using = exports.Unicode = exports.Number = exports.Boundary = exports.Whitespace = exports.Integer = exports.Decimal = exports.Letter = exports.Character = exports.Digit = exports.Word = exports.And = exports.Or = exports.Anything = exports.Then = exports.Match = exports.Optional = exports.Ten = exports.Nine = exports.Eight = exports.Seven = exports.Six = exports.Five = exports.Four = exports.Three = exports.Two = exports.One = exports.Zero = void 0;
/**
 * The tokens required for Human2Regex
 * @packageDocumentation
 */
const chevrotain_1 = require("chevrotain");
/** @internal */ exports.Zero = chevrotain_1.createToken({ name: "Zero", pattern: /zero/i });
/** @internal */ exports.One = chevrotain_1.createToken({ name: "One", pattern: /one/i });
/** @internal */ exports.Two = chevrotain_1.createToken({ name: "Two", pattern: /two/i });
/** @internal */ exports.Three = chevrotain_1.createToken({ name: "Three", pattern: /three/i });
/** @internal */ exports.Four = chevrotain_1.createToken({ name: "Four", pattern: /four/i });
/** @internal */ exports.Five = chevrotain_1.createToken({ name: "Five", pattern: /five/i });
/** @internal */ exports.Six = chevrotain_1.createToken({ name: "Six", pattern: /six/i });
/** @internal */ exports.Seven = chevrotain_1.createToken({ name: "Seven", pattern: /seven/i });
/** @internal */ exports.Eight = chevrotain_1.createToken({ name: "Eight", pattern: /eight/i });
/** @internal */ exports.Nine = chevrotain_1.createToken({ name: "Nine", pattern: /nine/i });
/** @internal */ exports.Ten = chevrotain_1.createToken({ name: "Ten", pattern: /ten/i });
/** @internal */ exports.Optional = chevrotain_1.createToken({ name: "Optional", pattern: /(optional(ly)?|possibl[ye]|maybe)/i });
/** @internal */ exports.Match = chevrotain_1.createToken({ name: "Match", pattern: /match(es)?/i });
/** @internal */ exports.Then = chevrotain_1.createToken({ name: "Then", pattern: /then/i });
/** @internal */ exports.Anything = chevrotain_1.createToken({ name: "Anything", pattern: /(any thing|any|anything)(s)?/i });
/** @internal */ exports.Or = chevrotain_1.createToken({ name: "Or", pattern: /or/i });
/** @internal */ exports.And = chevrotain_1.createToken({ name: "And", pattern: /and|,/i });
/** @internal */ exports.Word = chevrotain_1.createToken({ name: "WordSpecifier", pattern: /word(s)?/i });
/** @internal */ exports.Digit = chevrotain_1.createToken({ name: "DigitSpecifier", pattern: /digit(s)?/i });
/** @internal */ exports.Character = chevrotain_1.createToken({ name: "CharacterSpecifier", pattern: /character(s)?/i });
/** @internal */ exports.Letter = chevrotain_1.createToken({ name: "LetterSpecifier", pattern: /letter(s)?/i });
/** @internal */ exports.Decimal = chevrotain_1.createToken({ name: "DecimalSpecifier", pattern: /decimal(s)?/i });
/** @internal */ exports.Integer = chevrotain_1.createToken({ name: "IntegerSpecifier", pattern: /integer(s)?/i });
/** @internal */ exports.Whitespace = chevrotain_1.createToken({ name: "WhitespaceSpecifier", pattern: /(white space|whitespace)s?/i });
/** @internal */ exports.Boundary = chevrotain_1.createToken({ name: "BoundarySpecifier", pattern: /(word )?boundary/i });
/** @internal */ exports.Number = chevrotain_1.createToken({ name: "NumberSpecifier", pattern: /number(s)?/i });
/** @internal */ exports.Unicode = chevrotain_1.createToken({ name: "UnicodeSpecifier", pattern: /unicode( class)?/i });
/** @internal */ exports.Using = chevrotain_1.createToken({ name: "Using", pattern: /using/i });
/** @internal */ exports.Global = chevrotain_1.createToken({ name: "Global", pattern: /global/i });
/** @internal */ exports.Multiline = chevrotain_1.createToken({ name: "Multiline", pattern: /(multi line|multiline)/i });
/** @internal */ exports.Exact = chevrotain_1.createToken({ name: "Exact", pattern: /exact/i });
/** @internal */ exports.Matching = chevrotain_1.createToken({ name: "Matching", pattern: /matching/i });
/** @internal */ exports.Not = chevrotain_1.createToken({ name: "Not", pattern: /not|anything but|any thing but|everything but|every thing but/i });
/** @internal */ exports.Between = chevrotain_1.createToken({ name: "Between", pattern: /between/i });
/** @internal */ exports.Tab = chevrotain_1.createToken({ name: "Tab", pattern: /tab/i });
/** @internal */ exports.Linefeed = chevrotain_1.createToken({ name: "Linefeed", pattern: /(line feed|linefeed)/i });
/** @internal */ exports.Group = chevrotain_1.createToken({ name: "Group", pattern: /group/i });
/** @internal */ exports.A = chevrotain_1.createToken({ name: "A", pattern: /a(n)?/i });
/** @internal */ exports.Times = chevrotain_1.createToken({ name: "Times", pattern: /times/i });
/** @internal */ exports.Exactly = chevrotain_1.createToken({ name: "Exactly", pattern: /exact(ly)?/i });
/** @internal */ exports.Inclusive = chevrotain_1.createToken({ name: "Inclusive", pattern: /inclusive(ly)?/i });
/** @internal */ exports.Exclusive = chevrotain_1.createToken({ name: "Exclusive", pattern: /exclusive(ly)?/i });
/** @internal */ exports.From = chevrotain_1.createToken({ name: "From", pattern: /from/i });
/** @internal */ exports.To = chevrotain_1.createToken({ name: "To", pattern: /(to|through|thru|\-|\.\.\.?)/i });
/** @internal */ exports.Create = chevrotain_1.createToken({ name: "Create", pattern: /create(s)?/i });
/** @internal */ exports.Called = chevrotain_1.createToken({ name: "Called", pattern: /name(d)?|call(ed)?/i });
/** @internal */ exports.Repeat = chevrotain_1.createToken({ name: "Repeat", pattern: /repeat(s|ing)?/i });
/** @internal */ exports.Newline = chevrotain_1.createToken({ name: "Newline", pattern: /(new line|newline)/i });
/** @internal */ exports.CarriageReturn = chevrotain_1.createToken({ name: "CarriageReturn", pattern: /carriage return/i });
/** @internal */ exports.CaseInsensitive = chevrotain_1.createToken({ name: "CaseInsensitive", pattern: /case insensitive/i });
/** @internal */ exports.CaseSensitive = chevrotain_1.createToken({ name: "CaseSensitive", pattern: /case sensitive/i });
/** @internal */ exports.OrMore = chevrotain_1.createToken({ name: "OrMore", pattern: /\+|or more/i });
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
export const The = createToken({name: "The", pattern: /the/i }); //, longer_alt: Then});
export const By = createToken({name: "By", pattern: /by/i});
*/
/** @internal */ exports.EndOfLine = chevrotain_1.createToken({ name: "EOL", pattern: /\n/ });
/** @internal */ exports.WS = chevrotain_1.createToken({ name: "Whitespace", pattern: /[^\S\n]+/, start_chars_hint: [" ", "\r"], group: chevrotain_1.Lexer.SKIPPED });
/** @internal */ exports.SingleLineComment = chevrotain_1.createToken({ name: "SingleLineComment", pattern: /(#|\/\/).*/, group: chevrotain_1.Lexer.SKIPPED });
/** @internal */ exports.MultilineComment = chevrotain_1.createToken({ name: "MultiLineComment", pattern: /\/\*(.*)\*\//, line_breaks: true, group: chevrotain_1.Lexer.SKIPPED });
/** @internal */ exports.Identifier = chevrotain_1.createToken({ name: "Identifier", pattern: /[a-z]\w*/i });
/** @internal */ exports.NumberLiteral = chevrotain_1.createToken({ name: "NumberLiteral", pattern: /\d+/ });
/** @internal */ exports.StringLiteral = chevrotain_1.createToken({ name: "StringLiteral", pattern: /"(?:[^\\"]|\\(?:[bfnrtv"\\/]|u[0-9a-f]{4}|U[0-9a-f]{8}))*"/i });
/** @internal */ exports.Indent = chevrotain_1.createToken({ name: "Indent" });
/** @internal */ exports.Outdent = chevrotain_1.createToken({ name: "Outdent" });
/**
 * All the tokens used
 * @internal
 */
exports.AllTokens = [
    exports.Zero,
    exports.One,
    exports.Two,
    exports.Three,
    exports.Four,
    exports.Five,
    exports.Six,
    exports.Seven,
    exports.Eight,
    exports.Nine,
    exports.Ten,
    exports.Optional,
    exports.Matching,
    exports.Match,
    exports.Then,
    exports.Not,
    exports.Anything,
    exports.And,
    exports.Boundary,
    exports.Word,
    exports.Digit,
    exports.Letter,
    exports.Decimal,
    exports.Integer,
    exports.Character,
    exports.Whitespace,
    exports.Number,
    exports.Unicode,
    /*
    Of,
    As,
    If,
    Start,
    Ends,
    Else,
    Unless,
    While,
    More,
    Nothing,
    By,
    The,
    None,
    Neither,
    */
    exports.Using,
    exports.Global,
    exports.Multiline,
    exports.Exact,
    exports.Between,
    exports.Tab,
    exports.Linefeed,
    exports.Group,
    exports.A,
    exports.Times,
    exports.Exactly,
    exports.Inclusive,
    exports.Exclusive,
    exports.From,
    exports.Create,
    exports.Called,
    exports.Repeat,
    exports.Newline,
    exports.CarriageReturn,
    exports.CaseInsensitive,
    exports.CaseSensitive,
    exports.OrMore,
    exports.Or,
    exports.To,
    exports.EndOfLine,
    exports.Indent,
    exports.WS,
    exports.SingleLineComment,
    exports.MultilineComment,
    exports.Identifier,
    exports.NumberLiteral,
    exports.StringLiteral,
];
