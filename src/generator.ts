/*! Copyright (c) 2021 Patrick Demian; Licensed under MIT */

/**
 * Includes all Concrete Syntax Trees for Human2Regex
 * @packageDocumentation
 */

import { regexEscape, removeQuotes, hasFlag, combineFlags, isSingleRegexCharacter, first, last, unusedParameter, makeFlag, append } from "./utilities";
import { IToken } from "chevrotain";
import { minimizeMatchString, groupIfRequired, dontClobberRepetition } from "./generator_helper";

/** 
 * List of regular expression dialects we support
 */
export enum RegexDialect {
    JS,
    PCRE,
    DotNet,
    Java,
    Python,
    Boost
}

/**
 * Interface for all semantic errors
 */
export interface ISemanticError {
    startLine: number,
    startColumn: number,
    length: number,
    message: string
}

const unicode_property_codes = [
    "C", "Cc", "Cf", "Cn", "Co", "Cs", 
    "L", "Ll", "Lm", "Lo", "Lt", "Lu", 
    "M", "Mc", "Me", "Mn", "N", "Nd", 
    "Nl", "No", "P", "Pc", "Pd", "Pe", 
    "Pf", "Pi", "Po", "Ps", "S", "Sc", 
    "Sk", "Sm", "So", "Z", "Zl", "Zp", 
    "Zs"
];

const unicode_script_codes = [
    "Arabic", "Armenian", "Avestan", "Balinese", "Bamum",
    "Batak", "Bengali", "Bopomofo", "Brahmi", "Braille",
    "Buginese", "Buhid", "Canadian_Aboriginal", "Carian", "Chakma",
    "Cham", "Cherokee", "Common", "Coptic", "Cuneiform",
    "Cypriot", "Cyrillic", "Deseret", "Devanagari", "Egyptian_Hieroglyphs",
    "Ethiopic", "Georgian", "Glagolitic", "Gothic", "Greek",
    "Gujarati", "Gurmukhi", "Han", "Hangul", "Hanunoo", "Hebrew",
    "Hiragana", "Imperial_Aramaic", "Inherited", "Inscriptional_Pahlavi",
    "Inscriptional_Parthian", "Javanese", "Kaithi", "Kannada", "Katakana", 
    "Kayah_Li", "Kharoshthi", "Khmer", "Lao", "Latin", "Lepcha", "Limbu",
    "Linear_B", "Lisu", "Lycian", "Lydian", "Malayalam", "Mandaic", 
    "Meetei_Mayek", "Meroitic_Cursive", "Meroitic_Hieroglyphs", "Miao",
    "Mongolian", "Myanmar", "New_Tai_Lue", "Nko", "Ogham", "Old_Italic",
    "Old_Persian", "Old_South_Arabian", "Old_Turkic", "Ol_Chiki", "Oriya",
    "Osmanya", "Phags_Pa", "Phoenician", "Rejang", "Runic", "Samaritan", 
    "Saurashtra", "Sharada", "Shavian", "Sinhala", "Sora_Sompeng", 
    "Sundanese", "Syloti_Nagri", "Syriac", "Tagalog", "Tagbanwa", "Tai_Le",
    "Tai_Tham", "Tai_Viet", "Takri", "Tamil", "Telugu", "Thaana", "Thai",
    "Tibetan", "Tifinagh", "Ugaritic", "Vai", "Yi"
];

/**
 * Context for validation
 * 
 * @remarks Currently only used to validate groups
 * @internal
 */
export class GeneratorContext {
    public groups: { [ key: string ]: { startLine: number, startColumn: number, length: number } } = {};

    /**
     * Checks to see if we already have a group defined
     * 
     * @param identifier the group name 
     * @returns true if the group name already exists
     */
    public hasGroup(identifier: string): boolean {
        return Object.prototype.hasOwnProperty.call(this.groups, identifier);
    }

    /**
     * Adds the identifier to the group list
     * 
     * @param identifier the group name
     */
    public addGroup(identifier: string, tokens: IToken[]): void {
        const f = first(tokens);
        const l = last(tokens);

        this.groups[identifier] = {
            startLine: f.startLine ?? NaN,
            startColumn: f.startColumn ?? NaN,
            length: (l.endOffset ?? l.startOffset) - f.startOffset,
        };

    }
}

/**
 * Argument type: Just a plain object
 */
type GeneratorArguments = { [key: string]: string | boolean | number };

interface Generates {
    /**
     * Validate that this is both valid and can be generated in the specified language
     * 
     * @remarks There is no guarantee toRegex will work unless validate returns no errors
     * 
     * @param language the regex dialect we're validating
     * @param context the generator context
     * @returns A list of errors
     * @public
     */
    validate(language: RegexDialect, context: GeneratorContext): ISemanticError[];

    /**
     * Generate a regular expression fragment based on this syntax tree
     * 
     * @remarks There is no guarantee toRegex will work unless validate returns no errors
     * 
     * @param language the regex dialect we're generating
     * @param args any additional arguments we may have
     * @returns a regular expression fragment
     * @public
     */
    toRegex(language: RegexDialect, args: GeneratorArguments | null): string;
}

/**
 * The base concrete syntax tree class
 * 
 * @internal
 */
export abstract class H2RCST implements Generates {
    /**
     * Constructor for H2RCST
     * 
     * @param tokens Tokens used to calculate where an error occured
     * @internal
     */
    constructor(public tokens: IToken[]) {
        /* empty */
    }

    public abstract validate(language: RegexDialect, context: GeneratorContext): ISemanticError[];
    public abstract toRegex(language: RegexDialect, args: GeneratorArguments | null): string;

    /**
     * Creates an ISemanticError with a given message and the tokens provided from the constructor
     * 
     * @param message the message
     * @internal
     */
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

/**
 * Flags for the using statement
 * 
 * @internal
 */
export enum UsingFlags {
    Multiline = makeFlag(0),
    Global = makeFlag(1),
    Sensitive = makeFlag(2),
    Insensitive = makeFlag(3),
    Exact = makeFlag(4)
}

/**
 * Type of match arguments
 *
 * @remarks SingleString means an escaped string
 * @remarks Between means a range (ex. a-z)
 * @remarks Anything means .
 * @remarks Word, Digit, Character, Whitespace, Number, Tab, Linefeed, Newline, and Carriage return are \w+, \d, \w, \s, \d+, \t, \n, \n, \r respectively
 * @internal
 */
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
    CarriageReturn,
    Boundary,
    Unicode,
    Letter,
    Decimal,
    Integer
}

/**
 * Container for match statements
 * 
 * @internal
 */
export class MatchSubStatementValue {

    /**
     * Constructor for MatchSubStatementValue
     * 
     * @param type the type of this match
     * @param from optional value or range string
     * @param to  optional range string
     * @internal
     */
    constructor(public type: MatchSubStatementType, public from: string | null = null, public to: string | null = null) {
        /* empty */
    }
}

/**
 * Container for MatchStatementValue
 * 
 * @internal
 */
export class MatchStatementValue implements Generates {

    /**
     * Constructor for MatchStatementValue
     * 
     * @param optional is this match optional 
     * @param statement the substatement to generate
     * @internal 
     */
    constructor(public optional: boolean, public statement: MatchSubStatementCST) {
        /* empty */
    }

    public validate(language: RegexDialect, context: GeneratorContext): ISemanticError[] {
        return this.statement.validate(language, context);
    }

    public toRegex(language: RegexDialect, args: GeneratorArguments | null): string {
        let match_stmt = this.statement.toRegex(language, args);

        // need to group if optional and ungrouped
        if (this.optional) {
            match_stmt = groupIfRequired(match_stmt) + "?";
        }

        return match_stmt;
    }
}

/**
 * The base class for all statement concrete syntax trees
 * 
 * @internal
 */
export abstract class StatementCST extends H2RCST {
}

/**
 * Concrete Syntax Tree for Match Sub statements
 * 
 * @internal
 */
export class MatchSubStatementCST extends H2RCST {

    /**
     * Constructor for MatchSubStatementCST
     * 
     * @param tokens Tokens used to calculate where an error occured
     * @param count optional count statement
     * @param invert is this match inverted (ex, [^a-z] or [a-z])
     * @param values sub statements to match
     */
    constructor(tokens: IToken[], private count: CountSubStatementCST | null, private invert: boolean = false, private values: MatchSubStatementValue[]) {
        super(tokens);
    }
    
    public validate(language: RegexDialect, context: GeneratorContext): ISemanticError[] {
        const errors: ISemanticError[] = [];

        if (this.count) {
            append(errors, this.count.validate(language, context));
        }

        for (const value of this.values) {
            if (value.type === MatchSubStatementType.Between) {
                let from = removeQuotes(value.from as string);
                let to = removeQuotes(value.to as string);

                if (!isSingleRegexCharacter(from)) {
                    errors.push(this.error("Between statement must begin with a single character"));
                }
                else if (from.startsWith("\\u") || from.startsWith("\\U") || from.startsWith("\\")) {
                    from = JSON.parse(`"${from}"`);
                }

                if (!isSingleRegexCharacter(to)) {
                    errors.push(this.error("Between statement must end with a single character"));
                }
                else if (to.startsWith("\\u") || to.startsWith("\\U") || to.startsWith("\\")) {
                    to = JSON.parse(`"${to}"`);
                }

                if (from.charCodeAt(0) >= to.charCodeAt(0)) {
                    errors.push(this.error("Between statement range invalid"));
                }
            }
            else if (value.type === MatchSubStatementType.Unicode) {
                let unicode_class = removeQuotes(value.from as string);
                // check to see if the given code is supported
                if (!unicode_property_codes.includes(unicode_class)) {
                    // check to see if the given script is supported

                    // Java and C# requires "Is*"
                    if (language === RegexDialect.DotNet || language === RegexDialect.Java) {
                        if (!unicode_class.startsWith("Is")) {
                            errors.push(this.error("This dialect requires script names to begin with Is, such as IsCyrillic rather than Cyrillic"));
                            continue;
                        }
                        unicode_class = unicode_class.substr(2);
                    }

                    if (!unicode_script_codes.includes(unicode_class)) {
                        errors.push(this.error(`Unknown unicode specifier ${value.from}`));
                    }
                }
            }
        }

        return errors;
    }

    public toRegex(language: RegexDialect, args: GeneratorArguments | null): string {
        const matches: string[] = [];

        for (const value of this.values) {
            switch (value.type) {
                case MatchSubStatementType.SingleString: {
                    const reg = regexEscape(removeQuotes(value.from as string));

                    if (isSingleRegexCharacter(reg)) {
                        matches.push(this.invert ? `[^${reg}]` : reg);
                    }
                    else {
                        matches.push(this.invert ? `(?!${reg})` : reg);
                    }
                    break;
                }
                case MatchSubStatementType.Between: {
                    const from = removeQuotes(value.from as string);
                    const to = removeQuotes(value.to as string);
                    matches.push(this.invert ? `[^${from}-${to}]` : `[${from}-${to}]`);
                    break;
                }
                case MatchSubStatementType.Unicode: {
                    const unicode = removeQuotes(value.from as string);
                    matches.push(this.invert ? `\\P{${unicode}}` : `\\p{${unicode}}`);
                    break;
                }
                case MatchSubStatementType.Boundary:
                    matches.push(this.invert ? "\\B" : "\\b");
                    break;
                case MatchSubStatementType.Word:
                    matches.push(this.invert ? "\\W+" : "\\w+");
                    break;
                case MatchSubStatementType.Letter: {
                    if (language === RegexDialect.PCRE) {
                        matches.push(this.invert ? "[^[:alpha:]]" : "[[:alpha:]]");
                    }
                    else {
                        matches.push(this.invert ? "[^a-zA-Z]" : "[a-zA-Z]");
                    }
                    break;
                }
                case MatchSubStatementType.Integer:
                    matches.push(this.invert ? "(?![+-]?\\d+)" : "[+-]?\\d+");
                    break;
                case MatchSubStatementType.Decimal:
                    matches.push(this.invert ? "(?![+-]?(?:(?:\\d+[,.]?\\d*)|(?:[,.]\\d+)))" : "[+-]?(?:(?:\\d+[,.]?\\d*)|(?:[,.]\\d+))");
                    break;
                case MatchSubStatementType.Digit:
                    matches.push(this.invert ? "\\D" : "\\d");
                    break;
                case MatchSubStatementType.Character:
                    matches.push(this.invert ? "\\W" : "\\w");
                    break;
                case MatchSubStatementType.Whitespace:
                    matches.push(this.invert ? "\\S" : "\\s");
                    break;
                case MatchSubStatementType.Number:
                    matches.push(this.invert ? "\\D+" : "\\d+");
                    break;
                case MatchSubStatementType.Tab:
                    matches.push(this.invert ? "[^\\t]" : "\\t");
                    break;
                case MatchSubStatementType.Newline:
                case MatchSubStatementType.Linefeed:
                    matches.push(this.invert ? "[^\\n]" : "\\n");
                    break;
                case MatchSubStatementType.CarriageReturn:
                    matches.push(this.invert ? "[^\\r]" : "\\r");
                    break;
                default:
                    // default: anything
                    matches.push(this.invert ? "[^.]" : ".");
                    break;
            }
        }

        let ret = "";
        if (args !== null && args.has_neighbours === true) {
            ret = minimizeMatchString(matches, true);
        }
        else {
            ret = minimizeMatchString(matches);
        }

        if (this.count) {
            if (matches.length === 1) {
                // we don't group if there's only 1 element
                // but we need to make sure we don't add an additional + or * 
                ret = dontClobberRepetition(ret, this.count.toRegex(language));
            }
            else {
                ret = groupIfRequired(ret) + this.count.toRegex(language);
            }
        }

        return ret;
    }
}

/**
 * Concrete Syntax Tree for Using statements
 * 
 * @internal
 */
export class UsingStatementCST extends H2RCST {

    /**
     * Constructor for UsingStatementCST
     * 
     * @param tokens Tokens used to calculate where an error occured
     * @param flags using flags
     */
    constructor(tokens: IToken[], private flags: UsingFlags[]) {
        super(tokens);
    }

    public validate(language: RegexDialect, context: GeneratorContext): ISemanticError[] {
        unusedParameter(language, "Count does not need checking");
        unusedParameter(context, "Context is not needed");

        const errors: ISemanticError[] = [];
        let flag = this.flags[0];

        for (let i = 1; i < this.flags.length; i++) {
            if (hasFlag(flag, this.flags[i])) {
                errors.push(this.error("Duplicate modifier: " + UsingFlags[this.flags[i]] ));
            }
            flag = combineFlags(flag, this.flags[i]);
        }

        if (hasFlag(flag, UsingFlags.Sensitive) && hasFlag(flag, UsingFlags.Insensitive)) {
            errors.push(this.error("Cannot be both case sensitive and insensitive"));
        }

        return errors;
    }

    public toRegex(language: RegexDialect): string {
        unusedParameter(language, "Using Statement does not change based on language");

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

/**
 * Concrete Syntax Tree for Count sub statements
 * 
 * @internal
 */
export class CountSubStatementCST extends H2RCST {
    /**
     * Constructor for CountSubStatementCST
     * 
     * @param tokens Tokens used to calculate where an error occured
     * @param from number to count from
     * @param to optional number to count to
     * @param opt option modifier
     */
    constructor(tokens: IToken[], private from: number, private to: number | null = null, private opt: "inclusive" | "exclusive" | "+" | null = null) {
        super(tokens);
    }

    public validate(language: RegexDialect, context: GeneratorContext): ISemanticError[] {
        unusedParameter(language, "Count does not need checking");
        unusedParameter(context, "Context is not needed");

        const errors: ISemanticError[] = [];

        if (this.to !== null && ((this.opt === "exclusive" && (this.to-1) <= this.from) || this.to <= this.from)) {
            errors.push(this.error("Values must be in range of eachother"));
        }

        return errors;
    }

    public toRegex(language: RegexDialect): string {
        unusedParameter(language, "Count does not change from language");

        const from = this.from;
        let to = this.to;


        // if we only have a count of 1, we can ignore adding any extra text
        if (to === null) {
            if (from === 1) {
                return this.opt === "+" ? "+" : "*";
            }
            else if (from === 0) {
                return this.opt === "+" ? "*" : "{0}";
            }
        }

        if (to !== null) {
            if (this.opt === "exclusive") {
                to--;
            }
            return `{${from},${to}}`;
        }
        else if (this.opt === "+") {
            return `{${from},}`;
        }
        else {
            return `{${from}}`;
        }
    }
}

/**
 * Concrete Syntax Tree for a Match statement
 * 
 * @internal
 */
export class MatchStatementCST extends StatementCST {

    /**
     * Constructor for MatchStatementCST
     * 
     * @param tokens Tokens used to calculate where an error occured
     * @param matches the list of matches
     */
    constructor(tokens: IToken[], private completely_optional: boolean, private matches: MatchStatementValue[]) {
        super(tokens);
    }

    public validate(language: RegexDialect, context: GeneratorContext): ISemanticError[] {
        const errors: ISemanticError[] = [];

        for (const match of this.matches) {
            append(errors, match.statement.validate(language, context));
        }

        return errors;
    }

    public toRegex(language: RegexDialect): string {
        let final_matches = "";
        if (this.matches.length === 1) {
            final_matches = this.matches[0].toRegex(language, null);
        }
        else {
            final_matches = this.matches.map((x) => x.toRegex(language, { "has_neighbours": true })).join("");
        }
        
        if (this.completely_optional) {
            final_matches = groupIfRequired(final_matches) + "?";
        }

        return final_matches;
    }
}

/**
 * Concrete Syntax Tree for a Repeat statement
 * 
 * @internal
 */
export class RepeatStatementCST extends StatementCST {

    /**
     * Constructor for RepeatStatementCST
     * 
     * @param tokens Tokens used to calculate where an error occured
     * @param optional is this repetition optional
     * @param count optional number of times to repeat
     * @param statements the statements to repeat
     */
    constructor(tokens: IToken[], private optional: boolean, private count: CountSubStatementCST | null, private statements: StatementCST[]) {
        super(tokens);
    }

    public validate(language: RegexDialect, context: GeneratorContext): ISemanticError[] {
        const errors: ISemanticError[] = [];

        if (this.count !== null) {
            append(errors, this.count.validate(language, context));
        }

        for (const statement of this.statements) {
            append(errors, statement.validate(language, context));
        }

        return errors;
    }

    public toRegex(language: RegexDialect): string {
        let str = groupIfRequired(this.statements.map((x) => x.toRegex(language, null)).join(""));

        if (this.count) {
            str += this.count.toRegex(language);

            // group for optionality because count would be incorrect otherwise
            if (this.optional) {
                str = "(?:" + str + ")?";
            }
        }
        else {
            str += "*";

            if (this.optional) {
                str += "?";
            }
        }

        return str;
    }
}

/**
 * Conrete Syntax Tree for a group Statement
 * 
 * @internal
 */
export class GroupStatementCST extends StatementCST {

    /**
     * Constructor for GroupStatementCST
     * 
     * @param tokens Tokens used to calculate where an error occured
     * @param optional is this group optional
     * @param name optional name for named group
     * @param statements other statements
     * @internal
     */
    constructor(tokens: IToken[], private optional: boolean, private name: string | null, private statements: StatementCST[]) {
        super(tokens);
    }

    public validate(language: RegexDialect, context: GeneratorContext): ISemanticError[] {
        const errors : ISemanticError[] = [];
        
        if (this.name !== null) {
            if (context.hasGroup(this.name)) {
                const past_group = context.groups[this.name];
                errors.push(this.error(`Group with name "${this.name}" was already defined here: ${past_group.startLine}:${past_group.startLine}-${past_group.startLine}:${past_group.startLine+past_group.length}`));
            }
            else {
                context.addGroup(this.name, this.tokens);
            }
        }

        for (const statement of this.statements) {
            append(errors, statement.validate(language, context));
        }

        return errors;
    }

    public toRegex(language: RegexDialect): string {
        let str = "(";

        // named group
        if (this.name !== null) {
            str += "?";

            // python and PCRE use "?P" while everything else is just "?"
            if (language === RegexDialect.Python || language === RegexDialect.PCRE) {
                str += "P";
            }

            str += `<${this.name}>`;
        }

        str += this.statements.map((x) => x.toRegex(language, null)).join("");

        str += (this.optional ? ")?" : ")");

        return str;
    }
}

/**
 * Concrete Syntax Tree for a Backreference statement
 * 
 * @internal
 */
export class BackrefStatementCST extends StatementCST {

    /**
     * Constructor for BackrefStatementCST
     * 
     * @param tokens Tokens used to calculate where an error occured
     * @param optional is this backref optional
     * @param count optional number of times to repeat
     * @param name the group name to call
     */
    constructor(tokens: IToken[], private optional: boolean, private count: CountSubStatementCST | null, private name: string) {
        super(tokens);
    }

    public validate(language: RegexDialect, context: GeneratorContext): ISemanticError[] {
        const errors: ISemanticError[] = [];

        if (!context.hasGroup(this.name)) {
            errors.push(this.error(`Cannot call group with name "${this.name}" as it was never previously defined`));
        }

        if (this.count !== null) {
            append(errors, this.count.validate(language, context));
        }

        return errors;
    }

    public toRegex(language: RegexDialect): string {
        let str = "";

        switch (language) {
            case RegexDialect.Python:
                str = `(?P=${this.name})`;
                break;

            case RegexDialect.DotNet:
            case RegexDialect.Java:
                str = `\\k<${this.name}>`;
                break;

            default:
                str = `\\g<${this.name}>`;
                break;
        }

        if (this.count) {
            str += this.count.toRegex(language);

            // group for optionality because count would be incorrect otherwise
            if (this.optional) {
                str = "(?:" + str + ")?";
            }
        }
        else if (this.optional) {
            str = "?";
        }

        return str;
    }
}

/**
 * Concrete Syntax Tree for an If Pattern statement
 * 
 * @internal
 */
export class IfPatternStatementCST extends StatementCST {

    /**
     * Constructor for IfPatternStatementCST
     * 
     * @param tokens Tokens used to calculate where an error occured
     * @param matches list of matches to test against
     * @param true_statements true path
     * @param false_statements false path
     */
    constructor(tokens: IToken[], private matches: MatchStatementValue[], private true_statements: StatementCST[], private false_statements: StatementCST[]) {
        super(tokens);
    }

    public validate(language: RegexDialect, context: GeneratorContext): ISemanticError[] {
        const errors: ISemanticError[] = [];

        if (language === RegexDialect.Java || language === RegexDialect.JS) {
            errors.push(this.error("This language does not support conditionals"));
        }

        if (language === RegexDialect.Python) {
            errors.push(this.error("This language does not support pattern conditionals"));
        }

        for (const match of this.matches) {
            append(errors, match.validate(language, context));
        }

        for (const statement of this.true_statements) {
            append(errors, statement.validate(language, context));
        }

        for (const statement of this.false_statements) {
            append(errors, statement.validate(language, context));
        }

        return errors;
    }

    public toRegex(language: RegexDialect): string {
        const if_stmt = this.matches.map((x) => x.toRegex(language, null)).join("");
        const true_stmt = groupIfRequired(this.true_statements.map((x) => x.toRegex(language, null)).join(""));

        if (this.false_statements.length > 0) {
            const false_stmt = groupIfRequired(this.false_statements.map((x) => x.toRegex(language, null)).join(""));

            return `(?(${if_stmt})${true_stmt}|${false_stmt})`;
        }
        else {
            return `(?(${if_stmt})${true_stmt})`;
        }
    }
}

/**
 * Concrete Syntax Tree for an If group Ident statement
 * 
 * @internal
 */
export class IfIdentStatementCST extends StatementCST {

    /**
     * Constructor for IfIdentStatementCST
     * 
     * @param tokens Tokens used to calculate where an error occured
     * @param identifier the group identifier to check
     * @param true_statements true path
     * @param false_statements false path
     */
    constructor(tokens: IToken[], private identifier: string, private true_statements: StatementCST[], private false_statements: StatementCST[]) {
        super(tokens);
    }

    public validate(language: RegexDialect, context: GeneratorContext): ISemanticError[] {
        const errors: ISemanticError[] = [];

        if (language === RegexDialect.Java || language === RegexDialect.JS) {
            errors.push(this.error("This language does not support conditionals"));
        }

        if (!context.hasGroup(this.identifier)) {
            errors.push(this.error(`Group with name "${this.identifier}" does not exist`));
        }

        for (const statement of this.true_statements) {
            append(errors, statement.validate(language, context));
        }

        for (const statement of this.false_statements) {
            append(errors, statement.validate(language, context));
        }

        return errors;
    }

    public toRegex(language: RegexDialect): string {
        let if_stmt = this.identifier;

        // be more clear with languages that support it
        if (language === RegexDialect.Boost) {
            if_stmt = "<" + if_stmt + ">";
        }

        const true_stmt = groupIfRequired(this.true_statements.map((x) => x.toRegex(language, null)).join(""));

        if (this.false_statements.length > 0) {
            const false_stmt = groupIfRequired(this.false_statements.map((x) => x.toRegex(language, null)).join(""));

            return `(?(${if_stmt})${true_stmt}|${false_stmt})`;
        }
        else {
            return `(?(${if_stmt})${true_stmt})`;
        }
    }
}

/**
 * Concrete Syntax Tree for a regular expression
 * 
 * @internal
 */
export class RegularExpressionCST extends H2RCST {

    /**
     * Constructor for RegularExpressionCST
     * 
     * @param tokens Tokens used to calculate where an error occured
     * @param usings using statements
     * @param statements other statements
     * @internal
     */
    constructor(tokens: IToken[], private usings: UsingStatementCST, private statements: StatementCST[]) {
        super(tokens);
    }

    public validate(language: RegexDialect, context: GeneratorContext): ISemanticError[] {
        const errors: ISemanticError[] = this.usings.validate(language, context);

        for (const statement of this.statements) {
            append(errors, statement.validate(language, context));
        }

        return errors;
    }

    public toRegex(language: RegexDialect): string {
        const modifiers = this.usings.toRegex(language);
        const regex = this.statements.map((x) => x.toRegex(language, null)).join("");

        return modifiers.replace("{regex}", regex);
    }
}