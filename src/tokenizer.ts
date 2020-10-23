/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

import { createToken, Lexer } from "chevrotain";

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
export const Anything = createToken({name: "Anything", pattern: /(any|anything|any thing)(s)?/i});
export const Of = createToken({name: "Of", pattern: /of/i});
export const Or = createToken({name: "Or", pattern: /or/i});
export const And = createToken({name: "And", pattern: /and/i});
export const Word = createToken({name: "WordSpecifier", pattern: /word(s)?/i});
export const Digit = createToken({name: "DigitSpecifier", pattern: /digit(s)?/i});
export const Character = createToken({name: "CharacterSpecifier", pattern: /character(s)?/i});
export const Whitespace = createToken({name: "WhitespaceSpecifier", pattern: /(white space|whitespace)(s)?/i});
export const Number = createToken({name: "NumberSpecifier", pattern: /number(s)?/i});
export const Multiple = createToken({name: "Multiple", pattern: /multiple/i});
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
export const exclusive = createToken({name: "Exclusive", pattern: /exclusive(ly)?/i});
export const From = createToken({name: "From", pattern: /from/i});
export const To = createToken({name: "To", pattern: /(to|\-|\.\.|\.\.\.)/i});
export const Create = createToken({name: "Create", pattern: /create(s)?/i});
export const Called = createToken({name: "Called", pattern: /called/i});
export const Repeat = createToken({name: "Repeat", pattern: /repeat(s|ing)?/i});
export const Newline = createToken({name: "Newline", pattern: /(new line|newline)/i});
export const None = createToken({name: "None", pattern: /none/i});
export const Neither = createToken({name: "Neither", pattern: /neither/i});
export const CarriageReturn = createToken({name: "CarriageReturn", pattern: /carriage return/i});
export const CaseInsensitive = createToken({name: "CaseInsensitive", pattern: /case insensitive/i});
export const CaseSensitive = createToken({name: "CaseSensitive", pattern: /case sensitive/i});
export const OrMore = createToken({name: "OrMore", pattern: /\+/ });

export const Indent = createToken({name: "Indent", pattern: /(( ){4}\t)/ });
export const EndOfLine = createToken({name: "EOL", pattern: /\n/ });
export const WhiteSpace = createToken({name: "WhiteSpace", pattern: /\s+/, group: Lexer.SKIPPED });
export const SingleLineComment = createToken({name: "SingleLineComment", pattern: /(#|\/\/).*/, group: Lexer.SKIPPED });
export const MultilineComment = createToken({name: "MultiLineComment", pattern: /\/\*(.*)\*\//, line_breaks: true, group: Lexer.SKIPPED });

export const Identifier = createToken({name: "Identifier", pattern: /[a-z]\w*/i });
export const NumberLiteral = createToken({name: "NumberLiteral", pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/ });
export const StringLiteral = createToken({name: "StringLiteral", pattern: /"(?:[^\\"]|\\(?:[bfnrtv"\\/]|u[0-9a-f]{4}|U[0-9a-f]{8}))*"/i });


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
  Multiple,
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
  exclusive,
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
  Indent,
  EndOfLine,
  WhiteSpace,
  SingleLineComment,
  MultilineComment,
  Identifier,
  NumberLiteral,
  StringLiteral,
];

export const Human2RegexLexer = new Lexer(AllTokens, { ensureOptimizations: true });