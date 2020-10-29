/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

import { CstParser, CstNode, IOrAlt } from "chevrotain";
import * as T from "./tokens";

export class Human2RegexParserOptions {
    constructor(public skip_validations: boolean = false) {
        /* empty */
    }
}

export class Human2RegexParser extends CstParser {
    private static already_init = false;

    public parse : (idxInCallingRule?: number, ...args: unknown[]) => CstNode;

    constructor(private options: Human2RegexParserOptions = new Human2RegexParserOptions()) {
        super(T.AllTokens, { recoveryEnabled: false, maxLookahead: 2, skipValidations: options.skip_validations });

        if (Human2RegexParser.already_init) {
            throw new Error("Only 1 instance of Human2RegexParser allowed");
        }

        Human2RegexParser.already_init = true;
        
        const $ = this;

        let nss_rules : IOrAlt<unknown>[] | null = null;
        const NumberSubStatement = $.RULE("NumberSubStatement", () => {
            $.OR(nss_rules || (nss_rules = [
                { ALT: () => $.CONSUME(T.One) },
                { ALT: () => $.CONSUME(T.Two) },
                { ALT: () => $.CONSUME(T.Three) },
                { ALT: () => $.CONSUME(T.Four) },
                { ALT: () => $.CONSUME(T.Five) },
                { ALT: () => $.CONSUME(T.Six) },
                { ALT: () => $.CONSUME(T.Seven) },
                { ALT: () => $.CONSUME(T.Eight) },
                { ALT: () => $.CONSUME(T.Nine) },
                { ALT: () => $.CONSUME(T.Ten) },
                { ALT: () => $.CONSUME(T.Zero) },
                { ALT: () => $.CONSUME(T.NumberLiteral) },
            ]));
        });

        // 1, 1..2, between 1 and/to 2 inclusively/exclusively
        const CountSubStatement = $.RULE("CountSubStatement", () => {
            $.OR([
                { ALT: () => {
                    $.CONSUME(T.Between);
                    $.SUBRULE4(NumberSubStatement);
                    $.OR3([
                        { ALT: () => $.CONSUME2(T.To) },
                        { ALT: () => $.CONSUME(T.And) }
                    ]);
                    $.SUBRULE5(NumberSubStatement);
                    $.OPTION4(() => $.CONSUME3(T.Times));
                    $.OPTION5(() => {
                        $.OR4([
                            { ALT: () => $.CONSUME(T.Inclusive) },
                            { ALT: () => $.CONSUME(T.Exclusive) }
                        ]);
                    });
                }},
                
                { ALT: () => { 
                    $.OPTION2(() => $.CONSUME(T.From));
                    $.SUBRULE2(NumberSubStatement);
                    $.OR2([
                        { ALT: () => $.CONSUME(T.OrMore) },
                        { ALT: () => { 
                            $.CONSUME(T.To); 
                            $.SUBRULE3(NumberSubStatement); 
                        }}
                    ]);
                    $.OPTION3(() => $.CONSUME2(T.Times));
                }},

                { ALT: () => { 
                    $.OPTION(() => $.CONSUME(T.Exactly));
                    $.SUBRULE(NumberSubStatement);
                    $.OPTION6(() => $.CONSUME(T.Times));
                }} 
            ]);
        });

        let mss_rules : IOrAlt<unknown>[] | null = null;
        const MatchSubStatement = $.RULE("MatchSubStatement", () => {
            $.OPTION(() => $.SUBRULE(CountSubStatement) );
            $.OPTION2(() => $.CONSUME(T.Not));
            $.AT_LEAST_ONE_SEP({
                SEP: T.Or,
                DEF: () => {
                    $.OPTION3(() => $.CONSUME(T.A));
                    $.OR(mss_rules || (mss_rules = [
                        { ALT: () => {
                            $.OPTION4(() => $.CONSUME(T.From));
                            $.CONSUME2(T.StringLiteral); 
                            $.CONSUME(T.To);
                            $.CONSUME3(T.StringLiteral);
                        }},
                        { ALT: () => {
                            $.CONSUME(T.Between);
                            $.CONSUME4(T.StringLiteral);
                            $.CONSUME(T.And);
                            $.CONSUME5(T.StringLiteral);
                        }},
                        { ALT: () => $.CONSUME(T.StringLiteral) },
                        { ALT: () => $.CONSUME(T.Anything) },
                        { ALT: () => $.CONSUME(T.Word) },
                        { ALT: () => $.CONSUME(T.Digit) },
                        { ALT: () => $.CONSUME(T.Character) },
                        { ALT: () => $.CONSUME(T.Whitespace) },
                        { ALT: () => $.CONSUME(T.Number) },
                        { ALT: () => $.CONSUME(T.Tab) },
                        { ALT: () => $.CONSUME(T.Linefeed) },
                        { ALT: () => $.CONSUME(T.Newline) },
                        { ALT: () => $.CONSUME(T.CarriageReturn) },
                    ]));
                }
            });
        });

        // optionally match "+" then 1+ words
        const MatchStatement = $.RULE("MatchStatement", () => {
            $.OPTION(() => $.CONSUME(T.Optional));
            $.CONSUME(T.Match);
            $.SUBRULE(MatchSubStatement);
            $.MANY(() => {
                $.OR([
                    { ALT: () => { 
                        $.OPTION2(() => $.CONSUME2(T.And)); 
                        $.CONSUME(T.Then); 
                    }},
                    { ALT: () => $.CONSUME(T.And) },
                ]);
                $.OPTION3(() => $.CONSUME2(T.Optional));
                $.SUBRULE2(MatchSubStatement);
            });
            $.CONSUME(T.EndOfLine);
        });

        // using global matching
        let us_rules : IOrAlt<unknown>[] | null = null;
        const UsingStatement = $.RULE("UsingStatement", () => {
            $.CONSUME(T.Using);
            $.AT_LEAST_ONE_SEP({
                SEP: T.And,
                DEF: () => {
                    $.OR(us_rules || (us_rules = [
                        { ALT: () => $.CONSUME(T.Multiline) },
                        { ALT: () => $.CONSUME(T.Global) },
                        { ALT: () => $.CONSUME(T.CaseInsensitive) },
                        { ALT: () => $.CONSUME(T.CaseSensitive) },
                        { ALT: () => $.CONSUME(T.Exact) }
                    ]));
                    $.OPTION(() => $.CONSUME(T.Matching));
                }
            });
            $.CONSUME(T.EndOfLine);
        });

        const GroupStatement = $.RULE("GroupStatement", () => {
            $.OPTION2(() => $.CONSUME(T.Optional));
            $.CONSUME(T.Create);
            $.CONSUME(T.A);
            $.OPTION3(() => $.CONSUME2(T.Optional));
            $.CONSUME(T.Group);
            $.OPTION(() => {
                $.CONSUME(T.Called);
                $.CONSUME(T.StringLiteral);
            });
            $.CONSUME2(T.EndOfLine);
            $.CONSUME(T.Indent);
            $.AT_LEAST_ONE(Statement);
            $.CONSUME(T.Outdent);
        });

        const RepeatStatement = $.RULE("RepeatStatement", () => {
            $.OPTION3(() => $.CONSUME(T.Optional));
            $.CONSUME(T.Repeat);
            $.OPTION(() => $.SUBRULE(CountSubStatement));
            $.CONSUME3(T.EndOfLine);
            $.CONSUME(T.Indent);
            $.AT_LEAST_ONE(Statement);
            $.CONSUME(T.Outdent);
        });

        const Statement = $.RULE("Statement", () => {
            $.OR([
                { ALT: () => $.SUBRULE(MatchStatement) },
                { ALT: () => $.SUBRULE(GroupStatement) },
                { ALT: () => $.SUBRULE(RepeatStatement) }
            ]);
        });

        const Regex = $.RULE("Regex", () => {
            $.MANY(() => $.SUBRULE(UsingStatement));
            $.MANY2(() => $.SUBRULE(Statement) );
        });

        this.performSelfAnalysis();

        this.parse = Regex;
    }

    //public set_options(options: Human2RegexParserOptions) : void {
    //    // empty so far
    //}
}