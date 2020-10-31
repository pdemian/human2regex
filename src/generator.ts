/* eslint-disable @typescript-eslint/no-unused-vars */
/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

import { regexEscape, removeQuotes, hasFlag, combineFlags, isSingleRegexCharacter, first, last } from "./utilities";
import { IToken } from "chevrotain";

export enum RobotLanguage {
    JS,
    Perl,
    DotNet,
    Java
}

export interface ISemanticError {
    startLine: number,
    startColumn: number,
    length: number,
    message: string
}

export abstract class H2RCST {
    public tokens: IToken[];

    constructor(tokens: IToken[]) {
        this.tokens = tokens;
    }

    public abstract validate(language: RobotLanguage): ISemanticError[];
    public abstract toRegex(language: RobotLanguage): string;

    protected error(message: string): ISemanticError {
        const f = first(this.tokens);
        const l = last(this.tokens);

        return { 
            startLine: f.startLine ?? NaN,
            startColumn: f.startColumn ?? NaN,
            length: (l.endOffset ?? l.startOffset) - f.startOffset,
            message: message
        };
    }
}

/* eslint-disable no-bitwise */
export enum UsingFlags {
    Multiline = 1 << 0,
    Global = 1 << 1,
    Sensitive = 1 << 2,
    Insensitive = 1 << 3,
    Exact = 1 << 4
}
/* eslint-enable no-bitwise */

export enum MatchSubStatementType {
    SingleString,
    Between,
    Anything,
    Word,
    Digit,
    Character,
    Whitespace,
    Number,
    Tab,
    Linefeed,
    Newline,
    CarriageReturn
}

export class MatchSubStatementValue {
    constructor(public type: MatchSubStatementType, public from: string | null = null, public to: string | null = null) {
        /* empty */
    }
}

export class MatchStatementValue {
    constructor(public optional: boolean, public statement: MatchSubStatementCST) {
        /* empty */
    }
}

export abstract class StatementCST extends H2RCST {
}

export class MatchSubStatementCST extends H2RCST {
    constructor(public tokens: IToken[], public count: CountSubStatementCST | null, public invert: boolean = false, public values: MatchSubStatementValue[]) {
        super(tokens);
    }
    
    public validate(language: RobotLanguage): ISemanticError[] {
        let errors: ISemanticError[] = [];

        if (this.count) {
            errors = errors.concat(this.count.validate(language));
        }

        for (const value of this.values) {
            if (value.type === MatchSubStatementType.Between) {
                let from = value.from as string;
                let to = value.to as string;

                if (!isSingleRegexCharacter(from)) {
                        errors.push(this.error("Between statement must begin with a single character"));
                }
                else if (from.startsWith("\\u") || from.startsWith("\\U") || from.startsWith("\\")) {
                    from = JSON.parse(`"${regexEscape(from)}"`);
                }

                if (!isSingleRegexCharacter(to)) {
                        errors.push(this.error("Between statement must end with a single character"));
                }
                else if (to.startsWith("\\u") || to.startsWith("\\U") || to.startsWith("\\")) {
                    to = JSON.parse(`"${regexEscape(to)}"`);
                }

                if (from.charCodeAt(0) >= to.charCodeAt(0)) {
                    errors.push(this.error("Between statement range invalid"));
                }
            }
        }

        return errors;
    }

    public toRegex(language: RobotLanguage): string {
        const str: string[] = [];

        for (const value of this.values) {
            switch (value.type) {
                case MatchSubStatementType.SingleString: {
                    const reg = regexEscape(removeQuotes(value.from as string));
                    str.push(this.invert ? `(?:(?!${reg}))` : reg);
                    break;
                }
                case MatchSubStatementType.Between:
                    str.push(this.invert ? `[^${value.from}-${value.to}]` : `[${value.from}-${value.to}]`);
                    break;
                case MatchSubStatementType.Word:
                    str.push(this.invert ? "\\W+" : "\\w+");
                    break;
                case MatchSubStatementType.Digit:
                    str.push(this.invert ? "\\D" : "\\d");
                    break;
                case MatchSubStatementType.Character:
                    str.push(this.invert ? "\\W" : "\\w");
                    break;
                case MatchSubStatementType.Whitespace:
                    str.push(this.invert ? "\\S" : "\\s");
                    break;
                case MatchSubStatementType.Number:
                    str.push(this.invert ? "\\D+" : "\\d+");
                    break;
                case MatchSubStatementType.Tab:
                    str.push(this.invert ? "[^\\t]" : "\\t");
                    break;
                case MatchSubStatementType.Newline:
                case MatchSubStatementType.Linefeed:
                    str.push(this.invert ? "[^\\n]" : "\\n");
                    break;
                case MatchSubStatementType.CarriageReturn:
                    str.push(this.invert ? "[^\\r]" : "\\r");
                    break;
                default:
                    // default: anything
                    str.push(this.invert ? "[^.]" : ".");
                    break;
            }
        }

        let ret = "";

        if (str.length === 1) {
            ret = str[0];
        }
        // we can use regex's [] for single chars, otherwise we need a group
        else if (str.every(isSingleRegexCharacter)) {
            ret = "[" + str.join("") + "]";
        }
        else {
            //use a no-capture group
            ret = "(?:" + str.join("|") + ")";
        }

        if (this.count) {
            if (this.count.from === 1 && this.count.to === null) {
                if (this.count.opt === "+") {
                    ret += "+";
                }
                // if we only have a count of 1, we can ignore adding any extra text
            }
            else if (this.count.from === 0 && this.count.to === null) {
                if (this.count.opt === "+") {
                    ret += "*";
                }
                else {
                    // match 0 of anything? ok...
                    ret = "";
                }
            }
            else {
                ret += this.count.toRegex(language);
            }
        }

        return ret;
    }

}

export class UsingStatementCST extends H2RCST {
    constructor(public tokens: IToken[], public flags: UsingFlags[]) {
        super(tokens);
    }

    public validate(language: RobotLanguage): ISemanticError[] {
        const errors: ISemanticError[] = [];
        let flag = this.flags[0];

        for (let i = 1; i < this.flags.length; i++) {
            if (hasFlag(flag, this.flags[i])) {
                errors.push(this.error("Duplicate modifier: " + MatchSubStatementType[this.flags[i]] ));
            }
            flag = combineFlags(flag, this.flags[i]);
        }

        if (hasFlag(flag, UsingFlags.Sensitive) && hasFlag(flag, UsingFlags.Insensitive)) {
            errors.push(this.error("Cannot be both case sensitive and insensitive"));
        }

        return errors;
    }

    public toRegex(language: RobotLanguage): string {
        let str = "";
        let exact = false;

        for (const flag of this.flags) {
            if (hasFlag(flag, UsingFlags.Multiline)) {
                str += "m";
            }
            else if (hasFlag(flag, UsingFlags.Global)) {
                str += "g";
            }
            else if (hasFlag(flag, UsingFlags.Insensitive)) {
                str += "i";
            }
            else if (hasFlag(flag, UsingFlags.Exact)) {
                exact = true;
            }
        }

        return exact ? "/^{regex}$/" + str : "/{regex}/" + str;
    }
}

export class CountSubStatementCST extends H2RCST {
    constructor(public tokens: IToken[], public from: number, public to: number | null = null, public opt: "inclusive" | "exclusive" | "+" | null = null) {
        super(tokens);
    }

    public validate(language: RobotLanguage): ISemanticError[] {
        const errors: ISemanticError[] = [];

        if (this.from < 0) {
            errors.push(this.error("Value cannot be negative"));
        }
        else if (this.to !== null && ((this.opt === "exclusive" && (this.to-1) <= this.from) || this.to <= this.from)) {
            errors.push(this.error("Values must be in range of eachother"));
        }

        return errors;
    }

    public toRegex(language: RobotLanguage): string {
        const from = this.from;
        let to = this.to;
        if (to !== null && this.opt === "exclusive") {
            to--;
        }

        if (to !== null) {
            return `{${from},${to}}`;
        }
        else if (this.opt === "+") {
            return `{${from},}`;
        }
        else {
            return `{${this.from}}`;
        }
    }
}

export class MatchStatementCST extends StatementCST {
    constructor(public tokens: IToken[], public matches: MatchStatementValue[]) {
        super(tokens);
    }

    public validate(language: RobotLanguage): ISemanticError[] {
        let errors: ISemanticError[] = [];

        for (const match of this.matches) {
            errors = errors.concat(match.statement.validate(language));
        }

        return errors;
    }

    public toRegex(language: RobotLanguage): string {
        return this.matches.map((x) => {
            return x.statement.toRegex(language) + (x.optional ? "?" : "");
        }).join("");
    }
}

export class RepeatStatementCST extends StatementCST {
    constructor(public tokens: IToken[], public optional: boolean, public count: CountSubStatementCST | null, public statements: StatementCST[]) {
        super(tokens);
    }

    public validate(language: RobotLanguage): ISemanticError[] {
        let errors: ISemanticError[] = [];

        if (this.count !== null) {
            errors = errors.concat(this.count.validate(language));
        }

        for (const statement of this.statements) {
            errors = errors.concat(statement.validate(language));
        }

        return errors;
    }

    public toRegex(language: RobotLanguage): string {
        let str = "(" + this.statements.map((x) => x.toRegex(language)).join("") + ")";

        if (this.count !== null) {
            if (this.count.from === 1 && this.count.to === null) {
                if (this.count.opt === "+") {
                    str += "+";
                }
                // if we only have a count of 1, we can ignore adding any extra text
            }
            else if (this.count.from === 0 && this.count.to === null) {
                if (this.count.opt === "+") {
                    str += "*";
                }
                else {
                    // match 0 of anything? ok...
                    str = "";
                }
            }
            else {
                str += this.count.toRegex(language);
            }
        }
        else {
            str += "*";
        }

        return str;
    }
}

export class GroupStatementCST extends StatementCST {
    constructor(public tokens: IToken[], public optional: boolean, public name: string | null, public statements: StatementCST[]) {
        super(tokens);
    }

    public validate(language: RobotLanguage): ISemanticError[] {
        let errors : ISemanticError[] = [];
        
        if (language !== RobotLanguage.DotNet && language !== RobotLanguage.JS) {
            errors.push(this.error("This language does not support named groups"));
        }

        for (const statement of this.statements) {
            errors = errors.concat(statement.validate(language));
        }

        return errors;
    }

    public toRegex(language: RobotLanguage): string {
        let str = "(";

        if (this.name !== null) {
            str += `?<${this.name}>`;
        }

        str += this.statements.map((x) => x.toRegex(language)).join("");

        str += ")";

        if (this.optional) {
            str += "?";
        }

        return str;
    }
}

export class RegularExpressionCST extends H2RCST {
    constructor(public tokens: IToken[], public usings: UsingStatementCST, public statements: StatementCST[]) {
        super(tokens);
    }

    public validate(language: RobotLanguage): ISemanticError[] {
        let errors: ISemanticError[] = this.usings.validate(language);

        for (const statement of this.statements) {
            errors = errors.concat(statement.validate(language));
        }

        return errors;
    }
    public toRegex(language: RobotLanguage): string {
        const modifiers = this.usings.toRegex(language);
        const regex = this.statements.map((x) => x.toRegex(language)).join("");

        return modifiers.replace("{regex}", regex);
    }
    
}