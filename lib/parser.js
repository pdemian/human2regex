"use strict";
/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Human2RegexParser = exports.ParseResult = exports.Human2RegexParserOptions = void 0;
/**
 * The parser for Human2Regex
 * @packageDocumentation
 */
const chevrotain_1 = require("chevrotain");
const T = __importStar(require("./tokens"));
const generator_1 = require("./generator");
const utilities_1 = require("./utilities");
/**
 * The options for the Parser
 */
class Human2RegexParserOptions {
    /**
     * Constructor for Human2RegexParserOptions
     *
     * @param skip_validations If true, the lexer will skip validations (~25% faster)
     */
    constructor(skip_validations = false) {
        this.skip_validations = skip_validations;
        /* empty */
    }
}
exports.Human2RegexParserOptions = Human2RegexParserOptions;
class TokenAndValue {
    constructor(token, value) {
        this.token = token;
        this.value = value;
        /* empty */
    }
}
class TokensAndValue {
    constructor(tokens, value) {
        this.tokens = tokens;
        this.value = value;
        /* empty */
    }
}
/**
 * Tokenization result
 */
class ParseResult {
    /**
     * Constructor for the TokenizeResult
     *
     * @param tokens The token stream
     * @param errors A list of lexing errors
     */
    constructor(regexp_cst, errors) {
        this.regexp_cst = regexp_cst;
        this.errors = errors;
        /* empty */
    }
    /**
     * Validate that this is both valid and can be generated in the specified language
     *
     * @remarks There is no guarantee toRegex or toRegExp will work unless validate returns no errors
     *
     * @param language the regex dialect we're validating
     * @returns A list of errors
     * @public
     */
    validate(language) {
        return this.regexp_cst.validate(language, new generator_1.GeneratorContext()).map(utilities_1.CommonError.fromSemanticError);
    }
    /**
     * Generate a regular expression string based on the parse result
     *
     * @remarks There is no guarantee toRegex will work unless validate returns no errors
     *
     * @param language the regex dialect we're generating
     * @returns a regular expression string
     * @public
     */
    toRegex(language) {
        return this.regexp_cst.toRegex(language);
    }
    /**
     * Generate a RegExp object based on the parse result
     *
     * @remarks There is no guarantee toRegExp will work unless validate returns no errors
     *
     * @param language the regex dialect we're generating
     * @returns a RegExp object
     * @public
     */
    toRegExp(language) {
        return new RegExp(this.regexp_cst.toRegex(language));
    }
}
exports.ParseResult = ParseResult;
/**
 * The Parser class
 *
 * @remarks Only 1 parser instance allowed due to performance reasons
 */
class Human2RegexParser extends chevrotain_1.EmbeddedActionsParser {
    constructor(options = new Human2RegexParserOptions()) {
        super(T.AllTokens, { recoveryEnabled: false, maxLookahead: 2, skipValidations: options.skip_validations });
        this.options = options;
        if (Human2RegexParser.already_init) {
            throw new Error("Only 1 instance of Human2RegexParser allowed");
        }
        Human2RegexParser.already_init = true;
        const $ = this;
        /**
         * IN REGARDS TO KEEPING TOKENS:
         * We don't really need to keep each token, only the first and last tokens
         * This is due to the fact we calculate the difference between those tokens
         * However, sometimes we have optional starts and ends
         * Each optional near the start and end MUST be recorded because they may be the first/last token
         * ex) "optional match 3..." the start token is "optional", but "match 3..."'s start token is "match"
         * */
        // number rules
        let nss_rules = null;
        const NumberSubStatement = $.RULE("NumberSubStatement", () => {
            return $.OR(nss_rules || (nss_rules = [
                { ALT: () => new TokenAndValue($.CONSUME(T.Zero), 0) },
                { ALT: () => new TokenAndValue($.CONSUME(T.One), 1) },
                { ALT: () => new TokenAndValue($.CONSUME(T.Two), 2) },
                { ALT: () => new TokenAndValue($.CONSUME(T.Three), 3) },
                { ALT: () => new TokenAndValue($.CONSUME(T.Four), 4) },
                { ALT: () => new TokenAndValue($.CONSUME(T.Five), 5) },
                { ALT: () => new TokenAndValue($.CONSUME(T.Six), 6) },
                { ALT: () => new TokenAndValue($.CONSUME(T.Seven), 7) },
                { ALT: () => new TokenAndValue($.CONSUME(T.Eight), 8) },
                { ALT: () => new TokenAndValue($.CONSUME(T.Nine), 9) },
                { ALT: () => new TokenAndValue($.CONSUME(T.Ten), 10) },
                { ALT: () => {
                        const tok = $.CONSUME(T.NumberLiteral);
                        return new TokenAndValue(tok, parseInt(tok.image));
                    } }
            ]));
        });
        // 1, 1..2, between 1 and/to 2 inclusively/exclusively
        const CountSubStatement = $.RULE("CountSubStatement", () => {
            return $.OR([
                // between 1 to 4
                { ALT: () => {
                        const tokens = [];
                        tokens.push($.CONSUME(T.Between));
                        const from = $.SUBRULE4(NumberSubStatement);
                        $.OR3([
                            { ALT: () => $.CONSUME2(T.To) },
                            { ALT: () => $.CONSUME(T.And) }
                        ]);
                        const to = $.SUBRULE5(NumberSubStatement);
                        tokens.push(to.token);
                        $.OPTION4(() => tokens.push($.CONSUME3(T.Times)));
                        const opt = $.OPTION5(() => {
                            return $.OR4([
                                { ALT: () => {
                                        tokens.push($.CONSUME(T.Inclusive));
                                        return "inclusive";
                                    } },
                                { ALT: () => {
                                        tokens.push($.CONSUME(T.Exclusive));
                                        return "exclusive";
                                    } }
                            ]);
                        });
                        return new generator_1.CountSubStatementCST(tokens, from.value, to.value, opt);
                    } },
                // from 1 to 4
                { ALT: () => {
                        const tokens = [];
                        $.OPTION2(() => tokens.push($.CONSUME(T.From)));
                        const from = $.SUBRULE2(NumberSubStatement);
                        const to = $.OR2([
                            { ALT: () => new TokenAndValue($.CONSUME(T.OrMore), [null, "+"]) },
                            { ALT: () => {
                                    $.CONSUME(T.To);
                                    const val = $.SUBRULE3(NumberSubStatement);
                                    let token = val.token;
                                    const opt = $.OPTION7(() => {
                                        return $.OR5([
                                            { ALT: () => {
                                                    token = $.CONSUME2(T.Inclusive);
                                                    return "inclusive";
                                                } },
                                            { ALT: () => {
                                                    token = $.CONSUME2(T.Exclusive);
                                                    return "exclusive";
                                                } }
                                        ]);
                                    });
                                    return new TokenAndValue(token, [val.value, opt]);
                                } }
                        ]);
                        tokens.push(to.token);
                        $.OPTION3(() => tokens.push($.CONSUME2(T.Times)));
                        return new generator_1.CountSubStatementCST(tokens, from.value, to.value ? to.value[0] : null, to.value ? to.value[1] : null);
                    } },
                // exactly 2
                { ALT: () => {
                        const tokens = [];
                        $.OPTION(() => tokens.push($.CONSUME(T.Exactly)));
                        const from = $.SUBRULE(NumberSubStatement);
                        tokens.push(from.token);
                        $.OPTION6(() => tokens.push($.CONSUME(T.Times)));
                        return new generator_1.CountSubStatementCST(tokens, from.value);
                    } }
            ]);
        });
        // match sub rules
        let mss_rules = null;
        const MatchSubStatement = $.RULE("MatchSubStatement", () => {
            let count = null;
            let invert = false;
            const values = [];
            let from = null;
            let value = null;
            let to = null;
            let type = generator_1.MatchSubStatementType.Anything;
            let tokens = [];
            count = $.OPTION(() => {
                const css = $.SUBRULE(CountSubStatement);
                if (utilities_1.usefulConditional(css.tokens, "due to how chevrotain works, the first run produces a null value")) {
                    tokens.push(utilities_1.first(css.tokens));
                }
                return css;
            });
            invert = $.OPTION2(() => {
                tokens.push($.CONSUME(T.Not));
                return true;
            });
            $.AT_LEAST_ONE_SEP({
                SEP: T.Or,
                DEF: () => {
                    $.OPTION3(() => $.CONSUME(T.A));
                    const result = $.OR(mss_rules || (mss_rules = [
                        // range [a-z]
                        { ALT: () => {
                                const token0 = $.OPTION4(() => $.CONSUME(T.From));
                                const token1 = $.CONSUME2(T.StringLiteral);
                                from = token1.image;
                                $.CONSUME(T.To);
                                const token2 = $.CONSUME3(T.StringLiteral);
                                to = token2.image;
                                type = generator_1.MatchSubStatementType.Between;
                                if (utilities_1.usefulConditional(token0, "Bug in type definition. Option should return <T|undefined>, but it doesn't")) {
                                    return { tokens: [token0, token2], statement: new generator_1.MatchSubStatementValue(type, from, to) };
                                }
                                return { tokens: [token1, token2], statement: new generator_1.MatchSubStatementValue(type, from, to) };
                            } },
                        // range [a-z]
                        { ALT: () => {
                                const token1 = $.CONSUME(T.Between);
                                from = $.CONSUME4(T.StringLiteral).image;
                                $.CONSUME(T.And);
                                const token2 = $.CONSUME5(T.StringLiteral);
                                to = token2.image;
                                type = generator_1.MatchSubStatementType.Between;
                                return { tokens: [token1, token2], statement: new generator_1.MatchSubStatementValue(type, from, to) };
                            } },
                        // exact string
                        { ALT: () => {
                                const token = $.CONSUME(T.StringLiteral);
                                value = token.image;
                                type = generator_1.MatchSubStatementType.SingleString;
                                return { tokens: [token], statement: new generator_1.MatchSubStatementValue(type, value) };
                            } },
                        //unicode
                        { ALT: () => {
                                const token1 = $.CONSUME(T.Unicode);
                                const token2 = $.CONSUME6(T.StringLiteral);
                                value = token2.image;
                                type = generator_1.MatchSubStatementType.Unicode;
                                return { tokens: [token1, token2], statement: new generator_1.MatchSubStatementValue(type, value) };
                            } },
                        { ALT: () => {
                                const token = $.CONSUME(T.Anything);
                                type = generator_1.MatchSubStatementType.Anything;
                                return { tokens: [token], statement: new generator_1.MatchSubStatementValue(type) };
                            } },
                        { ALT: () => {
                                const token = $.CONSUME(T.Boundary);
                                type = generator_1.MatchSubStatementType.Boundary;
                                return { tokens: [token], statement: new generator_1.MatchSubStatementValue(type) };
                            } },
                        { ALT: () => {
                                const token = $.CONSUME(T.Word);
                                type = generator_1.MatchSubStatementType.Word;
                                return { tokens: [token], statement: new generator_1.MatchSubStatementValue(type) };
                            } },
                        { ALT: () => {
                                const token = $.CONSUME(T.Digit);
                                type = generator_1.MatchSubStatementType.Digit;
                                return { tokens: [token], statement: new generator_1.MatchSubStatementValue(type) };
                            } },
                        { ALT: () => {
                                const token = $.CONSUME(T.Character);
                                type = generator_1.MatchSubStatementType.Character;
                                return { tokens: [token], statement: new generator_1.MatchSubStatementValue(type) };
                            } },
                        { ALT: () => {
                                const token = $.CONSUME(T.Letter);
                                type = generator_1.MatchSubStatementType.Letter;
                                return { tokens: [token], statement: new generator_1.MatchSubStatementValue(type) };
                            } },
                        { ALT: () => {
                                const token = $.CONSUME(T.Decimal);
                                type = generator_1.MatchSubStatementType.Decimal;
                                return { tokens: [token], statement: new generator_1.MatchSubStatementValue(type) };
                            } },
                        { ALT: () => {
                                const token = $.CONSUME(T.Integer);
                                type = generator_1.MatchSubStatementType.Integer;
                                return { tokens: [token], statement: new generator_1.MatchSubStatementValue(type) };
                            } },
                        { ALT: () => {
                                const token = $.CONSUME(T.Whitespace);
                                type = generator_1.MatchSubStatementType.Whitespace;
                                return { tokens: [token], statement: new generator_1.MatchSubStatementValue(type) };
                            } },
                        { ALT: () => {
                                const token = $.CONSUME(T.Number);
                                type = generator_1.MatchSubStatementType.Number;
                                return { tokens: [token], statement: new generator_1.MatchSubStatementValue(type) };
                            } },
                        { ALT: () => {
                                const token = $.CONSUME(T.Tab);
                                type = generator_1.MatchSubStatementType.Tab;
                                return { tokens: [token], statement: new generator_1.MatchSubStatementValue(type) };
                            } },
                        { ALT: () => {
                                const token = $.CONSUME(T.Linefeed);
                                type = generator_1.MatchSubStatementType.Linefeed;
                                return { tokens: [token], statement: new generator_1.MatchSubStatementValue(type) };
                            } },
                        { ALT: () => {
                                const token = $.CONSUME(T.Newline);
                                type = generator_1.MatchSubStatementType.Newline;
                                return { tokens: [token], statement: new generator_1.MatchSubStatementValue(type) };
                            } },
                        { ALT: () => {
                                const token = $.CONSUME(T.CarriageReturn);
                                type = generator_1.MatchSubStatementType.CarriageReturn;
                                return { tokens: [token], statement: new generator_1.MatchSubStatementValue(type) };
                            } },
                    ]));
                    tokens = tokens.concat(result.tokens);
                    values.push(result.statement);
                }
            });
            return new generator_1.MatchSubStatementCST(tokens, count, invert, values);
        });
        // optionally match "+" then 1+ words
        const MatchStatement = $.RULE("MatchStatement", () => {
            let optional = false;
            let completely_optional = false;
            const msv = [];
            const tokens = [];
            $.OPTION(() => {
                tokens.push($.CONSUME(T.Optional));
                completely_optional = true;
            });
            tokens.push($.CONSUME(T.Match));
            $.OPTION4(() => {
                $.CONSUME3(T.Optional);
                optional = true;
            });
            msv.push(new generator_1.MatchStatementValue(optional, $.SUBRULE(MatchSubStatement)));
            $.MANY(() => {
                $.OR([
                    { ALT: () => {
                            $.OPTION2(() => $.CONSUME2(T.And));
                            $.CONSUME(T.Then);
                        } },
                    { ALT: () => $.CONSUME(T.And) },
                ]);
                optional = false;
                $.OPTION3(() => {
                    $.CONSUME2(T.Optional);
                    optional = true;
                });
                msv.push(new generator_1.MatchStatementValue(optional, $.SUBRULE2(MatchSubStatement)));
            });
            tokens.push($.CONSUME(T.EndOfLine));
            return new generator_1.MatchStatementCST(tokens, completely_optional, msv);
        });
        // using global matching
        let us_rules = null;
        const UsingStatement = $.RULE("UsingStatement", () => {
            const usings = [];
            const tokens = [$.CONSUME(T.Using)];
            $.AT_LEAST_ONE_SEP({
                SEP: T.And,
                DEF: () => {
                    usings.push($.OR(us_rules || (us_rules = [
                        { ALT: () => {
                                $.CONSUME(T.Multiline);
                                return generator_1.UsingFlags.Multiline;
                            } },
                        { ALT: () => {
                                $.CONSUME(T.Global);
                                return generator_1.UsingFlags.Global;
                            } },
                        { ALT: () => {
                                $.CONSUME(T.CaseInsensitive);
                                return generator_1.UsingFlags.Insensitive;
                            } },
                        { ALT: () => {
                                $.CONSUME(T.CaseSensitive);
                                return generator_1.UsingFlags.Sensitive;
                            } },
                        { ALT: () => {
                                $.CONSUME(T.Exact);
                                return generator_1.UsingFlags.Exact;
                            } }
                    ])));
                    $.OPTION(() => $.CONSUME(T.Matching));
                }
            });
            tokens.push($.CONSUME(T.EndOfLine));
            return new TokensAndValue(tokens, usings);
        });
        // group rules
        const GroupStatement = $.RULE("GroupStatement", () => {
            const tokens = [];
            let optional = false;
            let name = null;
            const statement = [];
            // position of optional must be OR'd because 
            // otherwise it could appear twice
            // ex) optional? create an optional? group
            tokens.push($.OR([
                { ALT: () => {
                        optional = true;
                        const first_token = $.CONSUME(T.Optional);
                        $.CONSUME(T.Create);
                        $.CONSUME(T.A);
                        return first_token;
                    } },
                { ALT: () => {
                        const first_token = $.CONSUME2(T.Create);
                        $.CONSUME2(T.A);
                        $.OPTION2(() => {
                            $.CONSUME2(T.Optional);
                            optional = true;
                        });
                        return first_token;
                    } }
            ]));
            $.CONSUME(T.Group);
            $.OPTION(() => {
                $.CONSUME(T.Called);
                name = $.CONSUME(T.Identifier).image;
            });
            // Note: Technically not the end token, 
            // BUT this is way more useful than the Outdent for error reporting
            tokens.push($.CONSUME2(T.EndOfLine));
            $.CONSUME(T.Indent);
            $.AT_LEAST_ONE(() => {
                statement.push($.SUBRULE(Statement));
            });
            $.CONSUME(T.Outdent);
            return new generator_1.GroupStatementCST(tokens, optional, name, statement);
        });
        // repeat rules
        const RepeatStatement = $.RULE("RepeatStatement", () => {
            const tokens = [];
            let optional = false;
            let count = null;
            const statements = [];
            $.OPTION3(() => {
                tokens.push($.CONSUME(T.Optional));
                optional = true;
            });
            tokens.push($.CONSUME(T.Repeat));
            $.OPTION(() => count = $.SUBRULE(CountSubStatement));
            $.CONSUME3(T.EndOfLine);
            $.CONSUME(T.Indent);
            $.AT_LEAST_ONE(() => {
                statements.push($.SUBRULE(Statement));
            });
            tokens.push($.CONSUME(T.Outdent));
            return new generator_1.RepeatStatementCST(tokens, optional, count, statements);
        });
        const BackrefStatement = $.RULE("BackrefStatement", () => {
            const tokens = [];
            let optional = false;
            let count = null;
            $.OPTION5(() => {
                tokens.push($.CONSUME(T.Optional));
                optional = true;
            });
            tokens.push($.CONSUME(T.Call));
            $.OPTION6(() => count = $.SUBRULE(CountSubStatement));
            $.OPTION7(() => {
                $.OPTION(() => $.CONSUME(T.The));
                $.CONSUME(T.Group);
                $.OPTION2(() => $.CONSUME(T.Called));
            });
            const name = $.CONSUME(T.Identifier).image;
            tokens.push($.CONSUME4(T.EndOfLine));
            return new generator_1.BackrefStatementCST(tokens, optional, count, name);
        });
        // statement super class
        const Statement = $.RULE("Statement", () => {
            return $.OR([
                { ALT: () => $.SUBRULE(MatchStatement) },
                { ALT: () => $.SUBRULE(GroupStatement) },
                { ALT: () => $.SUBRULE(RepeatStatement) },
                { ALT: () => $.SUBRULE(BackrefStatement) }
            ]);
        });
        // full regex
        const Regex = $.RULE("Regex", () => {
            let tokens = [];
            let usings = [];
            const statements = [];
            $.MANY(() => {
                const using = $.SUBRULE(UsingStatement);
                tokens = tokens.concat(using.tokens);
                usings = usings.concat(using.value);
            });
            $.MANY2(() => statements.push($.SUBRULE(Statement)));
            return new generator_1.RegularExpressionCST([], new generator_1.UsingStatementCST(tokens, usings), statements);
        });
        this.performSelfAnalysis();
        this.regexp = Regex;
    }
    /**
     * Parses the token stream
     *
     * @param tokens Tokens to parse
     * @returns a parse result which contains the token stream and error list
     * @public
     */
    parse(tokens) {
        this.input = tokens;
        return new ParseResult(this.regexp(), this.errors.map(utilities_1.CommonError.fromParseError));
    }
    /**
     * Sets the options for this parser
     *
     * @param options options for the parser
     * @see Human2RegexParserOptions
     * @public
     */
    setOptions(options) {
        utilities_1.unusedParameter(options, "skip_validations is not valid to change once we've already initialized");
    }
}
exports.Human2RegexParser = Human2RegexParser;
Human2RegexParser.already_init = false;
