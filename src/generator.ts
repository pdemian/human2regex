/* eslint-disable @typescript-eslint/no-unused-vars */
/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

import { regexEscape, removeQuotes, hasFlag, combineFlags } from "./utilities";

export enum RobotLanguage {
    JS,
    Perl,
    DotNet,
    Java
}

export abstract class H2RCST {
    public abstract validate(language: RobotLanguage): Error[];
    public abstract toRegex(language: RobotLanguage): string;
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
    constructor(public type: MatchSubStatementType, public from: string | null, public to: string | null) {
        /* empty */
    }
}

export class MatchStatementValue {
    constructor(public optional: boolean, public statement: MatchSubStatementCST) {
        /* empty */
    }
}

export abstract class StatementCST implements H2RCST {
    public abstract validate(language: RobotLanguage): Error[];
    public abstract toRegex(language: RobotLanguage): string;
}

export class MatchSubStatementCST implements H2RCST {
    constructor(public count: CountSubStatementCST | null, public invert: boolean = false, public values: MatchSubStatementValue[]) {
        /* empty */
    }
    
    public validate(language: RobotLanguage): Error[] {
        throw new Error("Method not implemented.");
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
                    str.push(this.invert ? "\\W" : "\\w");
                    break;
                case MatchSubStatementType.Digit:
                    str.push(this.invert ? "\\D" : "\\d");
                    break;
                case MatchSubStatementType.Character:
                    str.push(this.invert ? "[^a-zA-Z]" : "[a-zA-Z]");
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

        return str.join("|");
    }

}

export class UsingStatementCST implements H2RCST {
    constructor(public flags: UsingFlags[]) {
        /* empty */
    }
    public validate(language: RobotLanguage): Error[] {
        const errors: Error[] = [];
        let flag = this.flags[0];

        for (let i = 1; i < this.flags.length; i++) {
            if (hasFlag(flag, this.flags[i])) {
                errors.push(new Error("Duplicate modifier: " + MatchSubStatementType[this.flags[i]] ));
            }
            flag = combineFlags(flag, this.flags[i]);
        }

        if (hasFlag(flag, UsingFlags.Sensitive) && hasFlag(flag, UsingFlags.Insensitive)) {
            errors.push(new Error("Cannot be both case sensitive and insensitive"));
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

export class CountSubStatementCST implements H2RCST {
    constructor(public from: number, public to: number | null, public opt: "inclusive" | "exclusive" | "+" | null) {
        /* empty */
    }

    public validate(language: RobotLanguage): Error[] {
        const errors: Error[] = [];

        if (this.from < 0) {
            errors.push(new Error("Value cannot be negative"));
        }
        else if (this.to !== null && ((this.opt === "exclusive" && (this.to-1) <= this.from) || this.to <= this.from)) {
            errors.push(new Error("Values must be in range of eachother"));
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

export class MatchStatementCST implements StatementCST {
    constructor(public matches: MatchStatementValue[]) {
        /* empty */
    }

    public validate(language: RobotLanguage): Error[] {
        throw new Error("Method not implemented.");
    }
    public toRegex(language: RobotLanguage): string {
        throw new Error("Method not implemented.");
    }
    
}

export class RepeatStatementCST implements StatementCST {
    constructor(public optional: boolean, public count: CountSubStatementCST | null, public statements: StatementCST[]) {
        /* empty */
    }

    public validate(language: RobotLanguage): Error[] {
        throw new Error("Method not implemented.");
    }

    public toRegex(language: RobotLanguage): string {
        throw new Error("Method not implemented.");
    }
}

export class GroupStatementCST implements StatementCST {
    constructor(public optional: boolean, public name: string | null, public statements: StatementCST[]) {
        /* empty */
    }

    public validate(language: RobotLanguage): Error[] {
        throw new Error("Method not implemented.");
    }

    public toRegex(language: RobotLanguage): string {
        throw new Error("Method not implemented.");
    }
}

export class RegularExpressionCST implements H2RCST {
    constructor(public usings: UsingStatementCST, public statements: StatementCST[]) {
        /* empty */
    }

    public validate(language: RobotLanguage): Error[] {
        throw new Error("Method not implemented.");
    }
    public toRegex(language: RobotLanguage): string {
        throw new Error("Method not implemented.");
    }
    
}