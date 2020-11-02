/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

/**
 * The parser for Human2Regex
 * @packageDocumentation
 */

import { EmbeddedActionsParser, IOrAlt, IToken } from "chevrotain";
import * as T from "./tokens";
import { CountSubStatementCST, UsingFlags, MatchSubStatementType, MatchSubStatementValue, MatchSubStatementCST, UsingStatementCST, RegularExpressionCST, StatementCST, RepeatStatementCST, MatchStatementValue, MatchStatementCST, GroupStatementCST } from "./generator";
import { first, usefulConditional, unusedParameter } from "./utilities";

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
 * The Parser class
 * 
 * @remarks Only 1 parser instance allowed due to performance reasons
 */
export class Human2RegexParser extends EmbeddedActionsParser {
    private static already_init = false;

    public parse: (idxInCallingRule?: number, ...args: unknown[]) => RegularExpressionCST;

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
                            return new TokenAndValue(val.token, [ val.value, null ]);
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
        let mss_rules: IOrAlt<MatchSubStatementValue>[] | null = null;
        const MatchSubStatement = $.RULE("MatchSubStatement", () => {
            let count: CountSubStatementCST | null = null;
            let invert: boolean = false;
            const values: MatchSubStatementValue[] = [];
            let from: string | null = null;
            let to: string | null = null;
            let type: MatchSubStatementType = MatchSubStatementType.Anything;

            const tokens: IToken[] = [];

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
                    values.push($.OR(mss_rules || (mss_rules = [

                        // range [a-z]
                        { ALT: () => {
                            $.OPTION4(() => $.CONSUME(T.From));
                            from = $.CONSUME2(T.StringLiteral).image; 
                            $.CONSUME(T.To);
                            const token = $.CONSUME3(T.StringLiteral);
                            tokens.push(token);
                            to = token.image;
                            type = MatchSubStatementType.Between;

                            return new MatchSubStatementValue(type, from, to);
                        }},

                        // range [a-z]
                        { ALT: () => {
                            $.CONSUME(T.Between);
                            from = $.CONSUME4(T.StringLiteral).image;
                            $.CONSUME(T.And);
                            const token = $.CONSUME5(T.StringLiteral);
                            to = token.image;
                            tokens.push(token);
                            type = MatchSubStatementType.Between;

                            return new MatchSubStatementValue(type, from, to);
                        }},

                        // exact string
                        { ALT: () => {
                            const token = $.CONSUME(T.StringLiteral);
                            tokens.push(token);
                            from = token.image;
                            type = MatchSubStatementType.SingleString;

                            return new MatchSubStatementValue(type, from);
                        }},
                        { ALT: () => { 
                            tokens.push($.CONSUME(T.Anything)); 
                            type = MatchSubStatementType.Anything;

                            return new MatchSubStatementValue(type);
                        }},
                        { ALT: () => { 
                            tokens.push($.CONSUME(T.Word)); 
                            type = MatchSubStatementType.Word;

                            return new MatchSubStatementValue(type);
                        }},
                        { ALT: () => { 
                            tokens.push($.CONSUME(T.Digit)); 
                            type = MatchSubStatementType.Digit;

                            return new MatchSubStatementValue(type);
                        }},
                        { ALT: () => { 
                            tokens.push($.CONSUME(T.Character)); 
                            type = MatchSubStatementType.Character;

                            return new MatchSubStatementValue(type);
                        }},
                        { ALT: () => { 
                            tokens.push($.CONSUME(T.Whitespace)); 
                            type = MatchSubStatementType.Whitespace;

                            return new MatchSubStatementValue(type);
                        }},
                        { ALT: () => { 
                            tokens.push($.CONSUME(T.Number)); 
                            type = MatchSubStatementType.Number;

                            return new MatchSubStatementValue(type);
                        }},
                        { ALT: () => { 
                            tokens.push($.CONSUME(T.Tab)); 
                            type = MatchSubStatementType.Tab;

                            return new MatchSubStatementValue(type);
                        }},
                        { ALT: () => { 
                            tokens.push($.CONSUME(T.Linefeed)); 
                            type = MatchSubStatementType.Linefeed;

                            return new MatchSubStatementValue(type);
                        }},
                        { ALT: () => { 
                            tokens.push($.CONSUME(T.Newline)); 
                            type = MatchSubStatementType.Newline;

                            return new MatchSubStatementValue(type);
                        }},
                        { ALT: () => { 
                            tokens.push($.CONSUME(T.CarriageReturn)); 
                            type = MatchSubStatementType.CarriageReturn;

                            return new MatchSubStatementValue(type);
                        }},
                    ])));
                }
            });

            return new MatchSubStatementCST(tokens, count, invert, values);
        });

        // optionally match "+" then 1+ words
        const MatchStatement = $.RULE("MatchStatement", () => {
            let optional = false;
            const msv: MatchStatementValue[] = [];
            const tokens: IToken[] = [];

            $.OPTION(() => {
                tokens.push($.CONSUME(T.Optional));
                optional = true;
            });
            tokens.push($.CONSUME(T.Match));
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

            return new MatchStatementCST(tokens, msv);
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
            tokens.push($.OR([
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
                }}
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

        // statement super class
        const Statement = $.RULE("Statement", () => {
            return $.OR([
                { ALT: () => $.SUBRULE(MatchStatement) },
                { ALT: () => $.SUBRULE(GroupStatement) },
                { ALT: () => $.SUBRULE(RepeatStatement) }
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

        this.parse = Regex;
    }

    public setOptions(options: Human2RegexParserOptions): void {
        unusedParameter(options, "skip_validations is not valid to change once we've already initialized");
    }
}