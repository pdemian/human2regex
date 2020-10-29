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

    public parse : (idxInCallingRule?: number, ...args: unknown[]) => CstNode;

    constructor(private options: Human2RegexParserOptions = new Human2RegexParserOptions()) {
        super(T.AllTokens, { recoveryEnabled: false, maxLookahead: 2});

        if (Human2RegexParser.already_init) {
            throw new Error("Only 1 instance of Human2RegexParser allowed");
        }

        Human2RegexParser.already_init = true;
        
        const $ = this;

        this.nodes.NumberSubStatement = $.RULE("NumberSubStatement", () => {
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
        this.nodes.CountSubStatement = $.RULE("CountSubStatement", () => {
            $.OR([
                { ALT: () => {
                    $.CONSUME(T.Between);
                    $.SUBRULE4(this.nodes.NumberSubStatement);
                    $.OR3([
                        { ALT: () => $.CONSUME2(T.To) },
                        { ALT: () => $.CONSUME(T.And) }
                    ]);
                    $.SUBRULE5(this.nodes.NumberSubStatement);
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
                    $.SUBRULE2(this.nodes.NumberSubStatement);
                    $.OR2([
                        { ALT: () => $.CONSUME(T.OrMore) },
                        { ALT: () => { 
                            $.CONSUME(T.To); 
                            $.SUBRULE3(this.nodes.NumberSubStatement); 
                        }}
                    ]);
                    $.OPTION3(() => $.CONSUME2(T.Times));
                }},

                { ALT: () => { 
                    $.OPTION(() => $.CONSUME(T.Exactly));
                    $.SUBRULE(this.nodes.NumberSubStatement);
                    $.OPTION6(() => $.CONSUME(T.Times));
                }} 
            ]);
        });

        this.nodes.MatchSubStatement = $.RULE("MatchSubStatement", () => {
            $.OPTION(() => $.SUBRULE(this.nodes.CountSubStatement) );
            $.OPTION2(() => $.CONSUME(T.Not));
            $.AT_LEAST_ONE_SEP({
                SEP: T.Or,
                DEF: () => {
                    $.OPTION3(() => $.CONSUME(T.A));
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
        this.nodes.MatchStatement = $.RULE("MatchStatement", () => {
            $.OPTION(() => $.CONSUME(T.Optional));
            $.CONSUME(T.Match);
            $.SUBRULE(this.nodes.MatchSubStatement);
            $.MANY(() => {
                $.OR([
                    { ALT: () => { 
                        $.OPTION2(() => $.CONSUME2(T.And)); 
                        $.CONSUME(T.Then); 
                    }},
                    { ALT: () => $.CONSUME(T.And) },
                ]);
                $.OPTION3(() => $.CONSUME2(T.Optional));
                $.SUBRULE2(this.nodes.MatchSubStatement);
            });
            $.CONSUME(T.EndOfLine);
        });

        // using global matching
        this.nodes.UsingStatement = $.RULE("UsingStatement", () => {
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
            $.CONSUME(T.EndOfLine);
        });

        this.nodes.GroupStatement = $.RULE("GroupStatement", () => {
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
            $.AT_LEAST_ONE(this.nodes.Statement);
            $.CONSUME(T.Outdent);
        });

        this.nodes.RepeatStatement = $.RULE("RepeatStatement", () => {
            $.OPTION3(() => $.CONSUME(T.Optional));
            $.CONSUME(T.Repeat);
            $.OPTION(() => $.SUBRULE(this.nodes.CountSubStatement));
            $.CONSUME3(T.EndOfLine);
            $.CONSUME(T.Indent);
            $.AT_LEAST_ONE(this.nodes.Statement);
            $.CONSUME(T.Outdent);
        });

        this.nodes.Statement = $.RULE("Statement", () => {
            $.OR([
                { ALT: () => $.SUBRULE(this.nodes.MatchStatement) },
                { ALT: () => $.SUBRULE(this.nodes.GroupStatement) },
                { ALT: () => $.SUBRULE(this.nodes.RepeatStatement) }
            ]);
        });

        this.nodes.Regex = $.RULE("Regex", () => {
            $.MANY(() => $.SUBRULE(this.nodes.UsingStatement));
            $.MANY2(() => $.SUBRULE(this.nodes.Statement) );
        });

        this.performSelfAnalysis();

        this.parse = this.nodes.Regex;
    }

    //public set_options(options: Human2RegexParserOptions) : void {
    //    // empty so far
    //}
}