/*! Copyright (c) 2021 Patrick Demian; Licensed under MIT */

/**
 * The parser for Human2Regex
 * @packageDocumentation
 */

import { EmbeddedActionsParser, IOrAlt, IToken } from "chevrotain";
import * as T from "./tokens";
import { CountSubStatementCST, UsingFlags, MatchSubStatementType, MatchSubStatementValue, MatchSubStatementCST, UsingStatementCST, RegularExpressionCST, StatementCST, RepeatStatementCST, MatchStatementValue, MatchStatementCST, GroupStatementCST, RegexDialect, BackrefStatementCST, GeneratorContext, IfPatternStatementCST, IfIdentStatementCST } from "./generator";
import { first, usefulConditional, unusedParameter, CommonError } from "./utilities";

/**
 * The options for the Parser
 */
export class Human2RegexParserOptions {
    /**
     * Constructor for Human2RegexParserOptions
     * 
     * @param skip_validations If true, the lexer will skip validations (~25% faster)
     */
    constructor(public skip_validations: boolean = false) {
        /* empty */
    }
}

class TokenAndValue<T> {
    constructor(public token: IToken, public value: T) {
        /* empty */
    }
}
class TokensAndValue<T> {
    constructor(public tokens: IToken[], public value: T) {
        /* empty */
    }
}

/**
 * Tokenization result
 */
export class ParseResult {
    
    /**
     * Constructor for the TokenizeResult
     * 
     * @param tokens The token stream
     * @param errors A list of lexing errors
     */
    public constructor(private regexp_cst: RegularExpressionCST, public errors: CommonError[]) {
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
    public validate(language: RegexDialect): CommonError[] {
        return this.regexp_cst.validate(language, new GeneratorContext()).map(CommonError.fromSemanticError);
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
    public toRegex(language: RegexDialect): string {
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
    public toRegExp(language: RegexDialect): RegExp {
        return new RegExp(this.regexp_cst.toRegex(language));
    }
}


/**
 * The Parser class
 * 
 * @remarks Only 1 parser instance allowed due to performance reasons
 */
export class Human2RegexParser extends EmbeddedActionsParser {
    private static already_init = false;

    private regexp: (idxInCallingRule?: number, ...args: unknown[]) => RegularExpressionCST;

    /**
     * Parses the token stream
     * 
     * @param tokens Tokens to parse
     * @returns a parse result which contains the token stream and error list
     * @public
     */
    public parse(tokens: IToken[]): ParseResult {
        this.input = tokens;

        return new ParseResult(this.regexp(), this.errors.map(CommonError.fromParseError));
    }

    constructor(private options: Human2RegexParserOptions = new Human2RegexParserOptions()) {
        super(T.AllTokens, { recoveryEnabled: false, maxLookahead: 2, skipValidations: options.skip_validations });

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
        let nss_rules: IOrAlt<TokenAndValue<number>>[] | null = null;
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
                }}
            ]));
        });

        // 1, 1..2, between 1 and/to 2 inclusively/exclusively
        const CountSubStatement = $.RULE("CountSubStatement", () => {
            return $.OR([

                // between 1 to 4
                { ALT: () => {
                    const tokens: IToken[] = [];

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
                            }},
                            { ALT: () => {
                                tokens.push($.CONSUME(T.Exclusive));
                                return "exclusive";
                            }}
                        ]);
                    });

                    return new CountSubStatementCST(tokens, from.value, to.value, opt as "inclusive" | "exclusive" | null);
                }},
                
                // from 1 to 4
                { ALT: () => {
                    const tokens: IToken[] = [];

                    $.OPTION2(() => tokens.push($.CONSUME(T.From)));
                    const from = $.SUBRULE2(NumberSubStatement);
                    const to = $.OR2([
                        { ALT: () => new TokenAndValue($.CONSUME(T.OrMore), [ null, "+" ]) },
                        { ALT: () => { 
                            $.CONSUME(T.To); 
                            const val = $.SUBRULE3(NumberSubStatement);

                            let token = val.token;
                            const opt = $.OPTION7(() => {
                                return $.OR5([
                                    { ALT: () => {
                                        token = $.CONSUME2(T.Inclusive);
                                        return "inclusive";
                                    }},
                                    { ALT: () => {
                                        token = $.CONSUME2(T.Exclusive);
                                        return "exclusive";
                                    }}
                                ]);
                            });

                            return new TokenAndValue(token, [ val.value, opt ]);
                        }}
                    ]);
                    tokens.push(to.token);
                    $.OPTION3(() => tokens.push($.CONSUME2(T.Times)));

                    return new CountSubStatementCST(tokens, from.value, to.value ? to.value[0] : null, to.value ? to.value[1] : null);
                }},

                // exactly 2
                { ALT: () => { 
                    const tokens: IToken[] = [];
                    $.OPTION(() => tokens.push($.CONSUME(T.Exactly)));
                    const from = $.SUBRULE(NumberSubStatement);
                    tokens.push(from.token);
                    $.OPTION6(() => tokens.push($.CONSUME(T.Times)));

                    return new CountSubStatementCST(tokens, from.value);
                }} 
            ]);
        });

        // match sub rules
        let mss_rules: IOrAlt<{tokens: IToken[], statement: MatchSubStatementValue}>[] | null = null;
        const MatchSubStatement = $.RULE("MatchSubStatement", () => {
            let count: CountSubStatementCST | null = null;
            let invert: boolean = false;
            const values: MatchSubStatementValue[] = [];
            let from: string | null = null;
            let value: string | null = null;
            let to: string | null = null;
            let type: MatchSubStatementType = MatchSubStatementType.Anything;

            let tokens: IToken[] = [];

            count = $.OPTION(() => {
                const css = $.SUBRULE(CountSubStatement);

                if (usefulConditional(css.tokens, "due to how chevrotain works, the first run produces a null value")) {
                    tokens.push(first(css.tokens));
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
                            type = MatchSubStatementType.Between;

                            if (usefulConditional(token0, "Bug in type definition. Option should return <T|undefined>, but it doesn't")) {
                                return { tokens: [ token0, token2 ], statement: new MatchSubStatementValue(type, from, to) };
                            }
                            return { tokens: [ token1, token2 ], statement: new MatchSubStatementValue(type, from, to) };
                        }},

                        // range [a-z]
                        { ALT: () => {
                            const token1 = $.CONSUME(T.Between);
                            from = $.CONSUME4(T.StringLiteral).image;
                            $.CONSUME(T.And);
                            const token2 = $.CONSUME5(T.StringLiteral);
                            to = token2.image;
                            type = MatchSubStatementType.Between;

                            return { tokens: [ token1, token2 ], statement: new MatchSubStatementValue(type, from, to) };
                        }},

                        // exact string
                        { ALT: () => {
                            const token = $.CONSUME(T.StringLiteral);
                            value = token.image;
                            type = MatchSubStatementType.SingleString;

                            return { tokens: [ token ], statement: new MatchSubStatementValue(type, value) };
                        }},

                        //unicode
                        { ALT: () => {
                            const token1 = $.CONSUME(T.Unicode);
                            const token2 = $.CONSUME6(T.StringLiteral);
                            value = token2.image;
                            type = MatchSubStatementType.Unicode;

                            return { tokens: [ token1, token2 ], statement: new MatchSubStatementValue(type, value) };
                        }},

                        { ALT: () => { 
                            const token = $.CONSUME(T.Anything); 
                            type = MatchSubStatementType.Anything;

                            return { tokens: [ token ], statement: new MatchSubStatementValue(type) };
                        }},
                        { ALT: () => {
                            const token = $.CONSUME(T.Boundary);
                            type = MatchSubStatementType.Boundary;

                            return { tokens: [ token ], statement: new MatchSubStatementValue(type) };
                        }},
                        { ALT: () => { 
                            const token = $.CONSUME(T.Word); 
                            type = MatchSubStatementType.Word;

                            return { tokens: [ token ], statement: new MatchSubStatementValue(type) };
                        }},
                        { ALT: () => { 
                            const token = $.CONSUME(T.Digit); 
                            type = MatchSubStatementType.Digit;

                            return { tokens: [ token ], statement: new MatchSubStatementValue(type) };
                        }},
                        { ALT: () => { 
                            const token = $.CONSUME(T.Character); 
                            type = MatchSubStatementType.Character;

                            return { tokens: [ token ], statement: new MatchSubStatementValue(type) };
                        }},
                        { ALT: () => { 
                            const token = $.CONSUME(T.Letter); 
                            type = MatchSubStatementType.Letter;

                            return { tokens: [ token ], statement: new MatchSubStatementValue(type) };
                        }},
                        { ALT: () => { 
                            const token = $.CONSUME(T.Decimal); 
                            type = MatchSubStatementType.Decimal;

                            return { tokens: [ token ], statement: new MatchSubStatementValue(type) };
                        }},
                        { ALT: () => { 
                            const token = $.CONSUME(T.Integer); 
                            type = MatchSubStatementType.Integer;

                            return { tokens: [ token ], statement: new MatchSubStatementValue(type) };
                        }},
                        { ALT: () => { 
                            const token = $.CONSUME(T.Whitespace); 
                            type = MatchSubStatementType.Whitespace;

                            return { tokens: [ token ], statement: new MatchSubStatementValue(type) };
                        }},
                        { ALT: () => { 
                            const token = $.CONSUME(T.Number); 
                            type = MatchSubStatementType.Number;

                            return { tokens: [ token ], statement: new MatchSubStatementValue(type) };
                        }},
                        { ALT: () => { 
                            const token = $.CONSUME(T.Tab); 
                            type = MatchSubStatementType.Tab;

                            return { tokens: [ token ], statement: new MatchSubStatementValue(type) };
                        }},
                        { ALT: () => { 
                            const token = $.CONSUME(T.Linefeed); 
                            type = MatchSubStatementType.Linefeed;

                            return { tokens: [ token ], statement: new MatchSubStatementValue(type) };
                        }},
                        { ALT: () => { 
                            const token = $.CONSUME(T.Newline); 
                            type = MatchSubStatementType.Newline;

                            return { tokens: [ token ], statement: new MatchSubStatementValue(type) };
                        }},
                        { ALT: () => { 
                            const token = $.CONSUME(T.CarriageReturn); 
                            type = MatchSubStatementType.CarriageReturn;

                            return { tokens: [ token ], statement: new MatchSubStatementValue(type) };
                        }},
                    ]));

                    tokens = tokens.concat(result.tokens);
                    values.push(result.statement);
                }
            });

            return new MatchSubStatementCST(tokens, count, invert, values);
        });

        // optionally match "+" then 1+ words
        const MatchStatement = $.RULE("MatchStatement", () => {
            let optional = false;
            let completely_optional = false;
            const msv: MatchStatementValue[] = [];
            const tokens: IToken[] = [];

            $.OPTION(() => {
                tokens.push($.CONSUME(T.Optional));
                completely_optional = true;
            });
            tokens.push($.CONSUME(T.Match));
            $.OPTION4(() => {
                $.CONSUME3(T.Optional);
                optional = true;
            });

            msv.push(new MatchStatementValue(optional, $.SUBRULE(MatchSubStatement)));
            $.MANY(() => {
                $.OR([
                    { ALT: () => { 
                        $.OPTION2(() => $.CONSUME2(T.And)); 
                        $.CONSUME(T.Then); 
                    }},
                    { ALT: () => $.CONSUME(T.And) },
                ]);
                optional = false;
                $.OPTION3(() => {
                     $.CONSUME2(T.Optional);
                     optional = true;
                });
                msv.push(new MatchStatementValue(optional, $.SUBRULE2(MatchSubStatement)));
            });
            tokens.push($.CONSUME(T.EndOfLine));

            return new MatchStatementCST(tokens, completely_optional, msv);
        });

        // using global matching
        let us_rules: IOrAlt<UsingFlags>[] | null = null;
        const UsingStatement = $.RULE("UsingStatement", () => {
            const usings: UsingFlags[] = [];

            const tokens = [ $.CONSUME(T.Using) ];
            $.AT_LEAST_ONE_SEP({
                SEP: T.And,
                DEF: () => {
                    usings.push($.OR(us_rules || (us_rules = [
                        { ALT: () => {
                            $.CONSUME(T.Multiline);
                            return UsingFlags.Multiline;
                        }},
                        { ALT: () => { 
                            $.CONSUME(T.Global);
                            return UsingFlags.Global;
                        }},
                        { ALT: () => { 
                            $.CONSUME(T.CaseInsensitive);
                            return UsingFlags.Insensitive; 
                        }},
                        { ALT: () => { 
                            $.CONSUME(T.CaseSensitive);
                            return UsingFlags.Sensitive; 
                        }},
                        { ALT: () => { 
                            $.CONSUME(T.Exact); 
                            return UsingFlags.Exact;
                        }}
                    ])));
                    $.OPTION(() => $.CONSUME(T.Matching));
                }
            });
            tokens.push($.CONSUME(T.EndOfLine));

            return new TokensAndValue(tokens, usings);
        });

        // group rules
        const GroupStatement = $.RULE("GroupStatement", () => {
            const tokens: IToken[] = [];
            let optional = false;
            let name: string | null = null;
            const statement: StatementCST[] = [];

            // position of optional must be OR'd because 
            // otherwise it could appear twice
            // ex) optional? create an optional? group
            $.OPTION4(() => {
                tokens.push($.OR3([
                    { ALT: () => {
                        optional = true;
                        const first_token = $.CONSUME(T.Optional);
                        $.CONSUME(T.Create);
                        $.CONSUME(T.A);

                        return first_token;
                    }},
                    { ALT: () => {
                        const first_token = $.CONSUME2(T.Create);
                        $.CONSUME2(T.A);
                        $.OPTION2(() => {
                            $.CONSUME2(T.Optional);
                            optional = true;
                        });

                        return first_token;
                    }},
                    { ALT: () => {
                        optional = true;
                        return $.CONSUME3(T.Optional);
                    }}
                ]));
            });

            tokens.push($.CONSUME(T.Group));
            $.OPTION5(() => {
                name = $.OR([
                    { ALT: () => {
                        $.CONSUME(T.Called);
                        const n = $.CONSUME(T.Identifier).image;
                        $.OPTION(() => $.CONSUME(T.Is));
                        return n;
                    }},
                    { ALT: () => {
                        const n = $.CONSUME2(T.Identifier).image;
                        $.CONSUME2(T.Is);
                        return n;
                    }},
                ]);
            });
            // Note: Technically not the end token, 
            // BUT this is way more useful than the Outdent for error reporting
            tokens.push($.CONSUME2(T.EndOfLine));
            $.CONSUME(T.Indent);
            $.AT_LEAST_ONE(() => {
                statement.push($.SUBRULE(Statement));
            });
            $.CONSUME(T.Outdent);

            return new GroupStatementCST(tokens, optional, name, statement);
        });

        // repeat rules
        const RepeatStatement = $.RULE("RepeatStatement", () => {
            const tokens: IToken[] = [];
            let optional = false;
            let count: CountSubStatementCST | null = null;
            const statements: StatementCST[] = [];

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

            return new RepeatStatementCST(tokens, optional, count, statements);
        });

        const BackrefStatement = $.RULE("BackrefStatement", () => {
            const tokens: IToken[] = [];
            let optional = false;
            let count: CountSubStatementCST | null = null;

            $.OPTION5(() => {
                tokens.push($.CONSUME(T.Optional));
                optional = true;
            });
            tokens.push($.CONSUME(T.Rerun));

            $.OPTION6(() => count = $.SUBRULE(CountSubStatement));

            $.OPTION7(() => {
                $.OPTION(() => $.CONSUME(T.The));
                $.CONSUME(T.Group);
                $.OPTION2(() => $.CONSUME(T.Called));
            });
                   
            const name = $.CONSUME(T.Identifier).image;

            tokens.push($.CONSUME4(T.EndOfLine));

            return new BackrefStatementCST(tokens, optional, count, name);
        });

        const IfStatement = $.RULE("IfStatement", () => {
            const tokens: IToken[] = [];
            const msv: MatchStatementValue[] = [];
            let optional = false;
            const true_statements: StatementCST[] = [];
            const false_statements: StatementCST[] = [];
            let name: string = "";

            tokens.push($.CONSUME(T.If));

            $.OR2([
                {ALT: () => {
                    name = $.CONSUME(T.Identifier).image;
                }},
                {ALT: () => {
                    $.CONSUME(T.Match);

                    $.OPTION4(() => {
                        $.CONSUME3(T.Optional);
                        optional = true;
                    });
        
                    msv.push(new MatchStatementValue(optional, $.SUBRULE(MatchSubStatement)));
                    $.MANY(() => {
                        $.OR([
                            { ALT: () => { 
                                $.OPTION2(() => $.CONSUME2(T.And)); 
                                $.CONSUME(T.Then); 
                            }},
                            { ALT: () => $.CONSUME(T.And) },
                        ]);
                        optional = false;
                        $.OPTION3(() => {
                             $.CONSUME2(T.Optional);
                             optional = true;
                        });
                        msv.push(new MatchStatementValue(optional, $.SUBRULE2(MatchSubStatement)));
                    });
                }}
            ]);

            tokens.push($.CONSUME3(T.EndOfLine));
            
            $.CONSUME2(T.Indent);
            $.AT_LEAST_ONE2(() => {
                true_statements.push($.SUBRULE(Statement));
            });
            $.CONSUME2(T.Outdent);

            $.OPTION(() => {
                $.CONSUME(T.Else);
                $.CONSUME4(T.EndOfLine);
                $.CONSUME3(T.Indent);
                $.AT_LEAST_ONE3(() => {
                    false_statements.push($.SUBRULE2(Statement));
                });
                $.CONSUME3(T.Outdent);
            });

            if (name === "") {
                return new IfPatternStatementCST(tokens, msv, true_statements, false_statements);
            }
            else {
                return new IfIdentStatementCST(tokens, name, true_statements, false_statements);
            }
        });

        // statement super class
        const Statement = $.RULE("Statement", () => {
            return $.OR([
                { ALT: () => $.SUBRULE(MatchStatement) },
                { ALT: () => $.SUBRULE(GroupStatement) },
                { ALT: () => $.SUBRULE(RepeatStatement) },
                { ALT: () => $.SUBRULE(BackrefStatement) },
                { ALT: () => $.SUBRULE(IfStatement) }
            ]);
        });

        // full regex
        const Regex = $.RULE("Regex", () => {
            let tokens: IToken[] = [];
            let usings: UsingFlags[] = [];
            const statements: StatementCST[] = [];

            $.MANY(() => {
                const using = $.SUBRULE(UsingStatement);
                tokens = tokens.concat(using.tokens);
                usings = usings.concat(using.value);
            });
            $.MANY2(() => statements.push($.SUBRULE(Statement)) );

            return new RegularExpressionCST([], new UsingStatementCST(tokens, usings), statements);
        });

        this.performSelfAnalysis();

        this.regexp = Regex;
    }

    /**
     * Sets the options for this parser
     * 
     * @param options options for the parser
     * @see Human2RegexParserOptions
     * @public
     */
    public setOptions(options: Human2RegexParserOptions): void {
        unusedParameter(options, "skip_validations is not valid to change once we've already initialized");
    }
}