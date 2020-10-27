/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

import { CstParser } from "chevrotain";
import * as T from "./tokens";

export class Human2RegexParser extends CstParser {
    constructor() {
        super(T.AllTokens, { recoveryEnabled: true, maxLookahead: 2});

        const $ = this;

        const Number = $.RULE("Number", () => {
            $.OR([
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
            ]);
        });

        // 1, 1..2, between 1 and/to 2 inclusively/exclusively
        const Count = $.RULE("Count", () => {
            $.OR([
                { ALT: () => { 
                    $.OPTION(() => $.CONSUME(T.Exactly));
                    $.SUBRULE(Number);
                }},
                { ALT: () => { 
                    $.OPTION(() => $.CONSUME(T.From));
                    $.SUBRULE(Number);
                    $.OR([
                        { ALT: () => $.CONSUME(T.OrMore) },
                        { ALT: () => { 
                            $.CONSUME(T.To); 
                            $.SUBRULE(Number); 
                        }}
                    ]);
                }},

                { ALT: () => {
                    $.CONSUME(T.Between);
                    $.SUBRULE(Number);
                    $.OR([
                        { ALT: () => $.CONSUME(T.To) },
                        { ALT: () => $.CONSUME(T.And) }
                    ]);
                    $.SUBRULE(Number);
                    $.OPTION(() => {
                        $.OR([
                            { ALT: () => $.CONSUME(T.Inclusive) },
                            { ALT: () => $.CONSUME(T.Exclusive) }
                        ]);
                    });
                }}
            ]);
        });

        const MatchStatement = $.RULE("Match Statement", () => {
            $.OPTION(() => $.CONSUME(T.Optional));
            $.CONSUME(T.Match);
            $.OPTION(() => {
                $.SUBRULE(Count);
            });
            $.AT_LEAST_ONE_SEP({
                SEP: T.Or,
                DEF: () => {
                    $.CONSUME(T.StringLiteral);
                }
            });
        });

        const UsingStatement = $.RULE("Using Statement", () => {
            $.CONSUME(T.Using);
            $.AT_LEAST_ONE_SEP({
                SEP: T.And,
                DEF: () => {
                    $.OR([
                        { ALT: () => $.CONSUME(T.Multiline) },
                        { ALT: () => $.CONSUME(T.Global) },
                        { ALT: () => $.CONSUME(T.CaseInsensitive) },
                        { ALT: () => $.CONSUME(T.CaseSensitive) },
                        { ALT: () => { 
                            $.CONSUME(T.Exact); $.CONSUME(T.Matching); 
                        }},
                    ]);
                }
            });
        });

        const Statement = $.RULE("Statement", () => {
            $.OR([
                { ALT: () => $.SUBRULE(MatchStatement) },
                { ALT: () => $.SUBRULE(UsingStatement) }
            ]);
            $.OPTION(() => $.CONSUME(T.EndOfLine));
        });


        this.performSelfAnalysis();

    }
}