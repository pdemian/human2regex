/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

import { CstParser, CstNode } from "chevrotain";
import * as T from "./tokens";

export class Human2RegexParserOptions {
    constructor() {
        /* empty */
    }
}

export class Human2RegexParser extends CstParser {
    private static already_init = false;

    public nodes: { [key: string]: (idxInCallingRule?: number, ...args: unknown[]) => CstNode } = {};

    constructor(private options: Human2RegexParserOptions = new Human2RegexParserOptions()) {
        super(T.AllTokens, { recoveryEnabled: true, maxLookahead: 4});

        if (Human2RegexParser.already_init) {
            throw new Error("Only 1 instance of Human2RegexParser allowed");
        }

        Human2RegexParser.already_init = true;
        
        const $ = this;

        this.nodes.NumberSubStatement = $.RULE("Number Sub-Statement", () => {
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
        this.nodes.CountSubStatement = $.RULE("Count Sub-Statement", () => {
            $.OR([
                { ALT: () => { 
                    $.OPTION(() => $.CONSUME(T.Exactly));
                    $.SUBRULE(this.nodes.NumberSubStatement);
                    $.OPTION(() => $.CONSUME(T.Times));
                }},
                { ALT: () => { 
                    $.OPTION(() => $.CONSUME(T.From));
                    $.SUBRULE(this.nodes.NumberSubStatement);
                    $.OR([
                        { ALT: () => $.CONSUME(T.OrMore) },
                        { ALT: () => { 
                            $.CONSUME(T.To); 
                            $.SUBRULE(this.nodes.NumberSubStatement); 
                        }}
                    ]);
                    $.OPTION(() => $.CONSUME(T.Times));
                }},

                { ALT: () => {
                    $.CONSUME(T.Between);
                    $.SUBRULE(this.nodes.NumberSubStatement);
                    $.OR([
                        { ALT: () => $.CONSUME(T.To) },
                        { ALT: () => $.CONSUME(T.And) }
                    ]);
                    $.SUBRULE(this.nodes.NumberSubStatement);
                    $.OPTION(() => $.CONSUME(T.Times));
                    $.OPTION(() => {
                        $.OR([
                            { ALT: () => $.CONSUME(T.Inclusive) },
                            { ALT: () => $.CONSUME(T.Exclusive) }
                        ]);
                    });
                }}
            ]);
        });

        this.nodes.MatchSubStatement = $.RULE("Match Sub-Statement", () => {
            $.OPTION(() => $.SUBRULE(this.nodes.CountSubStatement) );
            $.OPTION(() => $.CONSUME(T.Not));
            $.AT_LEAST_ONE_SEP({
                SEP: T.Or,
                DEF: () => {
                    $.OR([
                        { ALT: () => $.CONSUME(T.Anything) },
                        { ALT: () => $.CONSUME(T.StringLiteral) },
                        { ALT: () => $.CONSUME(T.Word) },
                        { ALT: () => $.CONSUME(T.Digit) },
                        { ALT: () => $.CONSUME(T.Character) },
                        { ALT: () => $.CONSUME(T.Whitespace) },
                        { ALT: () => $.CONSUME(T.Number) },
                        { ALT: () => $.CONSUME(T.Tab) },
                        { ALT: () => $.CONSUME(T.Linefeed) },
                        { ALT: () => $.CONSUME(T.Newline) },
                        { ALT: () => $.CONSUME(T.CarriageReturn) },
                    ]);
                    
                }
            });
        });

        // optionally match "+" then 1+ words
        this.nodes.MatchStatement = $.RULE("Match Statement", () => {
            $.OPTION(() => $.CONSUME(T.Optional));
            $.CONSUME(T.Match);
            $.SUBRULE(this.nodes.MatchSubStatement);
            $.MANY(() => {
                $.OR([
                    { ALT: () => $.CONSUME(T.And) },
                    { ALT: () => { 
                        $.OPTION(() => $.CONSUME(T.And)); 
                        $.CONSUME(T.Then); 
                    }}
                ]);
                $.OPTION(() => $.CONSUME(T.Optional));
                $.SUBRULE(this.nodes.MatchSubStatement);
            });
        });

        // using global matching
        this.nodes.UsingStatement = $.RULE("Using Statement", () => {
            $.CONSUME(T.Using);
            $.AT_LEAST_ONE_SEP({
                SEP: T.And,
                DEF: () => {
                    $.OR([
                        { ALT: () => $.CONSUME(T.Multiline) },
                        { ALT: () => $.CONSUME(T.Global) },
                        { ALT: () => $.CONSUME(T.CaseInsensitive) },
                        { ALT: () => $.CONSUME(T.CaseSensitive) },
                        { ALT: () => $.CONSUME(T.Exact) }
                    ]);
                    $.OPTION(() => $.CONSUME(T.Matching));
                }
            });
        });

        this.nodes.GroupStatement = $.RULE("Group Statement", () => {
            $.OPTION(() => $.CONSUME(T.Optional));
            $.CONSUME(T.Create);
            $.CONSUME(T.A);
            $.OPTION(() => $.CONSUME(T.Optional));
            $.CONSUME(T.Group);
            $.OPTION(() => {
                $.CONSUME(T.Called);
                $.CONSUME(T.StringLiteral);
            });
            $.CONSUME(T.Indent);
            $.AT_LEAST_ONE(() => this.nodes.Statement);
            $.CONSUME(T.Outdent);
        });

        this.nodes.RepeatStatement = $.RULE("Repeat Statement", () => {
            $.OPTION(() => $.CONSUME(T.Optional));
            $.CONSUME(T.Repeat);
            $.OPTION(() => $.SUBRULE(this.nodes.CountSubStatement));
            $.CONSUME(T.Indent);
            $.AT_LEAST_ONE(() => this.nodes.Statement);
            $.CONSUME(T.Outdent);
        });

        this.nodes.Statement = $.RULE("Statement", () => {
            $.OR([
                { ALT: () => $.SUBRULE(this.nodes.MatchStatement) },
                { ALT: () => $.SUBRULE(this.nodes.GroupStatement) },
                { ALT: () => $.SUBRULE(this.nodes.RepeatStatement) }
            ]);
            $.CONSUME(T.EndOfLine);
        });

        this.nodes.Regex = $.RULE("Regex", () => {
            $.OPTION(() => $.SUBRULE(this.nodes.UsingStatement));
            $.MANY(() => $.SUBRULE(this.nodes.Statement) );
        });

        this.performSelfAnalysis();
    }

    //public set_options(options: Human2RegexParserOptions) : void {
    //    // empty so far
    //}
}