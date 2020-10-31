/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

import { EmbeddedActionsParser, IOrAlt } from "chevrotain";
import * as T from "./tokens";
import { CountSubStatementCST, UsingFlags, MatchSubStatementType, MatchSubStatementValue, MatchSubStatementCST, UsingStatementCST, RegularExpressionCST, StatementCST, RepeatStatementCST, MatchStatementValue, MatchStatementCST, GroupStatementCST } from "./generator";

export class Human2RegexParserOptions {
    constructor(public skip_validations: boolean = false) {
        /* empty */
    }
}

export class Human2RegexParser extends EmbeddedActionsParser {
    private static already_init = false;

    public parse : (idxInCallingRule?: number, ...args: unknown[]) => RegularExpressionCST;

    constructor(private options: Human2RegexParserOptions = new Human2RegexParserOptions()) {
        super(T.AllTokens, { recoveryEnabled: false, maxLookahead: 2, skipValidations: options.skip_validations });

        if (Human2RegexParser.already_init) {
            throw new Error("Only 1 instance of Human2RegexParser allowed");
        }

        Human2RegexParser.already_init = true;
        
        const $ = this;

        let nss_rules : IOrAlt<number>[] | null = null;
        const NumberSubStatement = $.RULE("NumberSubStatement", () => {
            let value: number = 0;

            value = $.OR(nss_rules || (nss_rules = [
                { ALT: () => {
                    $.CONSUME(T.Zero); 
                    return 0; 
                }},
                { ALT: () => {
                    $.CONSUME(T.One); 
                    return 1; 
                }},
                { ALT: () => {
                    $.CONSUME(T.Two); 
                    return 2; 
                }},
                { ALT: () => {
                    $.CONSUME(T.Three); 
                    return 3; 
                }},
                { ALT: () => {
                    $.CONSUME(T.Four); 
                    return 4; 
                }},
                { ALT: () => {
                    $.CONSUME(T.Five); 
                    return 5; 
                }},
                { ALT: () => {
                    $.CONSUME(T.Six); 
                    return 6; 
                }},
                { ALT: () => {
                    $.CONSUME(T.Seven); 
                    return 7; 
                }},
                { ALT: () => {
                    $.CONSUME(T.Eight); 
                    return 8; 
                }},
                { ALT: () => {
                    $.CONSUME(T.Nine); 
                    return 9; 
                }},
                { ALT: () => {
                    $.CONSUME(T.Ten); 
                    return 10; 
                }},

                { ALT: () => parseInt($.CONSUME(T.NumberLiteral).image) },
            ]));

            return value;
        });

        // 1, 1..2, between 1 and/to 2 inclusively/exclusively
        const CountSubStatement = $.RULE("CountSubStatement", () => {
            let from : number = 0;
            let to: number | null = null;
            let opt: "inclusive" | "exclusive" | "+" | null = null;
            
            $.OR([
                { ALT: () => {
                    $.CONSUME(T.Between);
                    from = $.SUBRULE4(NumberSubStatement);
                    $.OR3([
                        { ALT: () => $.CONSUME2(T.To) },
                        { ALT: () => $.CONSUME(T.And) }
                    ]);
                    to = $.SUBRULE5(NumberSubStatement);
                    $.OPTION4(() => $.CONSUME3(T.Times));
                    $.OPTION5(() => {
                        $.OR4([
                            { ALT: () => {
                                $.CONSUME(T.Inclusive);
                                opt = "inclusive";
                            }},
                            { ALT: () => {
                                $.CONSUME(T.Exclusive);
                                opt = "exclusive";
                            }}
                        ]);
                    });
                }},
                
                { ALT: () => { 
                    $.OPTION2(() => $.CONSUME(T.From));
                    from = $.SUBRULE2(NumberSubStatement);
                    $.OR2([
                        { ALT: () => {
                            $.CONSUME(T.OrMore);
                            opt = "+";
                        }},
                        { ALT: () => { 
                            $.CONSUME(T.To); 
                            to = $.SUBRULE3(NumberSubStatement); 
                        }}
                    ]);
                    $.OPTION3(() => $.CONSUME2(T.Times));
                }},

                { ALT: () => { 
                    $.OPTION(() => $.CONSUME(T.Exactly));
                    from = $.SUBRULE(NumberSubStatement);
                    $.OPTION6(() => $.CONSUME(T.Times));
                }} 
            ]);

            return new CountSubStatementCST(from, to, opt);
        });

        let mss_rules : IOrAlt<MatchSubStatementValue>[] | null = null;
        const MatchSubStatement = $.RULE("MatchSubStatement", () => {
            let count: CountSubStatementCST | null = null;
            let invert: boolean = false;
            const values: MatchSubStatementValue[] = [];
            let from : string | null = null;
            let to : string | null = null;
            let type : MatchSubStatementType = MatchSubStatementType.Anything;

            count = $.OPTION(() => $.SUBRULE(CountSubStatement) );
            invert = $.OPTION2(() => { 
                $.CONSUME(T.Not); 
                return true;
            });
            $.AT_LEAST_ONE_SEP({
                SEP: T.Or,
                DEF: () => {
                    $.OPTION3(() => $.CONSUME(T.A));
                    values.push($.OR(mss_rules || (mss_rules = [
                        { ALT: () => {
                            $.OPTION4(() => $.CONSUME(T.From));
                            from = $.CONSUME2(T.StringLiteral).image; 
                            $.CONSUME(T.To);
                            to = $.CONSUME3(T.StringLiteral).image;
                            type = MatchSubStatementType.Between;

                            return new MatchSubStatementValue(type, from, to);
                        }},
                        { ALT: () => {
                            $.CONSUME(T.Between);
                            from = $.CONSUME4(T.StringLiteral).image;
                            $.CONSUME(T.And);
                            to = $.CONSUME5(T.StringLiteral).image;
                            type = MatchSubStatementType.Between;

                            return new MatchSubStatementValue(type, from, to);
                        }},
                        { ALT: () => {
                            from = $.CONSUME(T.StringLiteral).image;
                            type = MatchSubStatementType.SingleString;

                            return new MatchSubStatementValue(type, from);
                        }},
                        { ALT: () => { 
                            $.CONSUME(T.Anything); 
                            type = MatchSubStatementType.Anything;

                            return new MatchSubStatementValue(type);
                        }},
                        { ALT: () => { 
                            $.CONSUME(T.Word); 
                            type = MatchSubStatementType.Word;

                            return new MatchSubStatementValue(type);
                        }},
                        { ALT: () => { 
                            $.CONSUME(T.Digit); 
                            type = MatchSubStatementType.Digit;

                            return new MatchSubStatementValue(type);
                        }},
                        { ALT: () => { 
                            $.CONSUME(T.Character); 
                            type = MatchSubStatementType.Character;

                            return new MatchSubStatementValue(type);
                        }},
                        { ALT: () => { 
                            $.CONSUME(T.Whitespace); 
                            type = MatchSubStatementType.Whitespace;

                            return new MatchSubStatementValue(type);
                        }},
                        { ALT: () => { 
                            $.CONSUME(T.Number); 
                            type = MatchSubStatementType.Number;

                            return new MatchSubStatementValue(type);
                        }},
                        { ALT: () => { 
                            $.CONSUME(T.Tab); 
                            type = MatchSubStatementType.Tab;

                            return new MatchSubStatementValue(type);
                        }},
                        { ALT: () => { 
                            $.CONSUME(T.Linefeed); 
                            type = MatchSubStatementType.Linefeed;

                            return new MatchSubStatementValue(type);
                        }},
                        { ALT: () => { 
                            $.CONSUME(T.Newline); 
                            type = MatchSubStatementType.Newline;

                            return new MatchSubStatementValue(type);
                        }},
                        { ALT: () => { 
                            $.CONSUME(T.CarriageReturn); 
                            type = MatchSubStatementType.CarriageReturn;

                            return new MatchSubStatementValue(type);
                        }},
                    ])));
                }
            });

            return new MatchSubStatementCST(count, invert, values);
        });

        // optionally match "+" then 1+ words
        const MatchStatement = $.RULE("MatchStatement", () => {
            let optional = false;
            const msv: MatchStatementValue[] = [];

            $.OPTION(() => {
                $.CONSUME(T.Optional);
                optional = true;
            });
            $.CONSUME(T.Match);
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
            $.CONSUME(T.EndOfLine);

            return new MatchStatementCST(msv);
        });

        // using global matching
        let us_rules : IOrAlt<UsingFlags>[] | null = null;
        const UsingStatement = $.RULE("UsingStatement", () => {
            const usings: UsingFlags[] = [];

            $.CONSUME(T.Using);
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
            $.CONSUME(T.EndOfLine);

            return usings;
        });

        const GroupStatement = $.RULE("GroupStatement", () => {
            let optional = false;
            let name: string | null = null;
            const statement: StatementCST[] = [];

            $.OR([
                { ALT: () => {
                    optional = true;
                    $.CONSUME(T.Optional);
                    $.CONSUME(T.Create);
                    $.CONSUME(T.A);
                }},
                { ALT: () => {
                    $.CONSUME2(T.Create);
                    $.CONSUME2(T.A);
                    $.OPTION2(() => {
                        $.CONSUME2(T.Optional);
                        optional = true;
                    });
                }}
            ]);

            $.CONSUME(T.Group);
            $.OPTION(() => {
                $.CONSUME(T.Called);
                name = $.CONSUME(T.Identifier).image;
            });
            $.CONSUME2(T.EndOfLine);
            $.CONSUME(T.Indent);
            $.AT_LEAST_ONE(() => {
                statement.push($.SUBRULE(Statement));
            });
            $.CONSUME(T.Outdent);

            return new GroupStatementCST(optional, name, statement);
        });

        const RepeatStatement = $.RULE("RepeatStatement", () => {
            let optional = false;
            let count : CountSubStatementCST | null = null;
            const statements: StatementCST[] = [];

            $.OPTION3(() => {
                $.CONSUME(T.Optional);
                optional = true;
            });
            $.CONSUME(T.Repeat);
            $.OPTION(() => count = $.SUBRULE(CountSubStatement));
            $.CONSUME3(T.EndOfLine);
            $.CONSUME(T.Indent);
            $.AT_LEAST_ONE(() => {
                statements.push($.SUBRULE(Statement));
            });
            $.CONSUME(T.Outdent);

            return new RepeatStatementCST(optional, count, statements);
        });

        const Statement = $.RULE("Statement", () => {
            return $.OR([
                { ALT: () => $.SUBRULE(MatchStatement) },
                { ALT: () => $.SUBRULE(GroupStatement) },
                { ALT: () => $.SUBRULE(RepeatStatement) }
            ]);
        });

        const Regex = $.RULE("Regex", () => {
            let usings: UsingFlags[] = [];
            const statements: StatementCST[] = [];

            $.MANY(() => usings = usings.concat($.SUBRULE(UsingStatement)));
            $.MANY2(() => statements.push($.SUBRULE(Statement)) );

            return new RegularExpressionCST(new UsingStatementCST(usings), statements);
        });

        this.performSelfAnalysis();

        this.parse = Regex;
    }

    //public set_options(options: Human2RegexParserOptions) : void {
    //    // empty so far
    //}
}