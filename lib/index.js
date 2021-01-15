"use strict";
/*! Copyright (c) 2021 Patrick Demian; Licensed under MIT */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegexDialect = exports.ParseResult = exports.Human2RegexParser = exports.Human2RegexParserOptions = exports.TokenizeResult = exports.IndentType = exports.Human2RegexLexer = exports.Human2RegexLexerOptions = exports.CommonError = void 0;
/**
 * Includes all packages
 * @packageDocumentation
 */
var utilities_1 = require("./utilities");
Object.defineProperty(exports, "CommonError", { enumerable: true, get: function () { return utilities_1.CommonError; } });
var lexer_1 = require("./lexer");
Object.defineProperty(exports, "Human2RegexLexerOptions", { enumerable: true, get: function () { return lexer_1.Human2RegexLexerOptions; } });
Object.defineProperty(exports, "Human2RegexLexer", { enumerable: true, get: function () { return lexer_1.Human2RegexLexer; } });
Object.defineProperty(exports, "IndentType", { enumerable: true, get: function () { return lexer_1.IndentType; } });
Object.defineProperty(exports, "TokenizeResult", { enumerable: true, get: function () { return lexer_1.TokenizeResult; } });
var parser_1 = require("./parser");
Object.defineProperty(exports, "Human2RegexParserOptions", { enumerable: true, get: function () { return parser_1.Human2RegexParserOptions; } });
Object.defineProperty(exports, "Human2RegexParser", { enumerable: true, get: function () { return parser_1.Human2RegexParser; } });
Object.defineProperty(exports, "ParseResult", { enumerable: true, get: function () { return parser_1.ParseResult; } });
var generator_1 = require("./generator");
Object.defineProperty(exports, "RegexDialect", { enumerable: true, get: function () { return generator_1.RegexDialect; } });
