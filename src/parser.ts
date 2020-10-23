/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

import { CstParser } from "chevrotain";
import * as T from "./tokenizer";

export class Human2RegexParser extends CstParser {
    constructor() {
        super(T.AllTokens, { recoveryEnabled: true, maxLookahead: 2});

        const $ = this;

        const Count = $.RULE("Count", () => {
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
            ]);
        });

        const MatchStatement = $.RULE("MatchStatement", () => {
            $.OPTION(() => {
                $.CONSUME(T.Optional);
            });
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

        const UsingStatement = $.RULE("UsingStatement", () => {
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
            $.OPTION(() => $.CONSUME(T.EndOfLine));
        });


        this.performSelfAnalysis();

    }
}