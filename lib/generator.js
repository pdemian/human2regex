"use strict";
/*! Copyright (c) 2021 Patrick Demian; Licensed under MIT */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegularExpressionCST = exports.IfIdentStatementCST = exports.IfPatternStatementCST = exports.BackrefStatementCST = exports.GroupStatementCST = exports.RepeatStatementCST = exports.MatchStatementCST = exports.CountSubStatementCST = exports.UsingStatementCST = exports.MatchSubStatementCST = exports.StatementCST = exports.MatchStatementValue = exports.MatchSubStatementValue = exports.MatchSubStatementType = exports.UsingFlags = exports.H2RCST = exports.GeneratorContext = exports.RegexDialect = void 0;
/**
 * Includes all Concrete Syntax Trees for Human2Regex
 * @packageDocumentation
 */
const utilities_1 = require("./utilities");
const generator_helper_1 = require("./generator_helper");
/**
 * List of regular expression dialects we support
 */
var RegexDialect;
(function (RegexDialect) {
    RegexDialect[RegexDialect["JS"] = 0] = "JS";
    RegexDialect[RegexDialect["PCRE"] = 1] = "PCRE";
    RegexDialect[RegexDialect["DotNet"] = 2] = "DotNet";
    RegexDialect[RegexDialect["Java"] = 3] = "Java";
    RegexDialect[RegexDialect["Python"] = 4] = "Python";
    RegexDialect[RegexDialect["Boost"] = 5] = "Boost";
})(RegexDialect = exports.RegexDialect || (exports.RegexDialect = {}));
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
class GeneratorContext {
    constructor() {
        this.groups = {};
    }
    /**
     * Checks to see if we already have a group defined
     *
     * @param identifier the group name
     * @returns true if the group name already exists
     */
    hasGroup(identifier) {
        return Object.prototype.hasOwnProperty.call(this.groups, identifier);
    }
    /**
     * Adds the identifier to the group list
     *
     * @param identifier the group name
     */
    addGroup(identifier, tokens) {
        var _a, _b, _c;
        const f = utilities_1.first(tokens);
        const l = utilities_1.last(tokens);
        this.groups[identifier] = {
            startLine: (_a = f.startLine) !== null && _a !== void 0 ? _a : NaN,
            startColumn: (_b = f.startColumn) !== null && _b !== void 0 ? _b : NaN,
            length: ((_c = l.endOffset) !== null && _c !== void 0 ? _c : l.startOffset) - f.startOffset,
        };
    }
}
exports.GeneratorContext = GeneratorContext;
/**
 * The base concrete syntax tree class
 *
 * @internal
 */
class H2RCST {
    /**
     * Constructor for H2RCST
     *
     * @param tokens Tokens used to calculate where an error occured
     * @internal
     */
    constructor(tokens) {
        this.tokens = tokens;
        /* empty */
    }
    /**
     * Creates an ISemanticError with a given message and the tokens provided from the constructor
     *
     * @param message the message
     * @internal
     */
    error(message) {
        var _a, _b, _c;
        const f = utilities_1.first(this.tokens);
        const l = utilities_1.last(this.tokens);
        return {
            startLine: (_a = f.startLine) !== null && _a !== void 0 ? _a : NaN,
            startColumn: (_b = f.startColumn) !== null && _b !== void 0 ? _b : NaN,
            length: ((_c = l.endOffset) !== null && _c !== void 0 ? _c : l.startOffset) - f.startOffset,
            message: message
        };
    }
}
exports.H2RCST = H2RCST;
/**
 * Flags for the using statement
 *
 * @internal
 */
var UsingFlags;
(function (UsingFlags) {
    UsingFlags[UsingFlags["Multiline"] = utilities_1.makeFlag(0)] = "Multiline";
    UsingFlags[UsingFlags["Global"] = utilities_1.makeFlag(1)] = "Global";
    UsingFlags[UsingFlags["Sensitive"] = utilities_1.makeFlag(2)] = "Sensitive";
    UsingFlags[UsingFlags["Insensitive"] = utilities_1.makeFlag(3)] = "Insensitive";
    UsingFlags[UsingFlags["Exact"] = utilities_1.makeFlag(4)] = "Exact";
})(UsingFlags = exports.UsingFlags || (exports.UsingFlags = {}));
/**
 * Type of match arguments
 *
 * @remarks SingleString means an escaped string
 * @remarks Between means a range (ex. a-z)
 * @remarks Anything means .
 * @remarks Word, Digit, Character, Whitespace, Number, Tab, Linefeed, Newline, and Carriage return are \w+, \d, \w, \s, \d+, \t, \n, \n, \r respectively
 * @internal
 */
var MatchSubStatementType;
(function (MatchSubStatementType) {
    MatchSubStatementType[MatchSubStatementType["SingleString"] = 0] = "SingleString";
    MatchSubStatementType[MatchSubStatementType["Between"] = 1] = "Between";
    MatchSubStatementType[MatchSubStatementType["Anything"] = 2] = "Anything";
    MatchSubStatementType[MatchSubStatementType["Word"] = 3] = "Word";
    MatchSubStatementType[MatchSubStatementType["Digit"] = 4] = "Digit";
    MatchSubStatementType[MatchSubStatementType["Character"] = 5] = "Character";
    MatchSubStatementType[MatchSubStatementType["Whitespace"] = 6] = "Whitespace";
    MatchSubStatementType[MatchSubStatementType["Number"] = 7] = "Number";
    MatchSubStatementType[MatchSubStatementType["Tab"] = 8] = "Tab";
    MatchSubStatementType[MatchSubStatementType["Linefeed"] = 9] = "Linefeed";
    MatchSubStatementType[MatchSubStatementType["Newline"] = 10] = "Newline";
    MatchSubStatementType[MatchSubStatementType["CarriageReturn"] = 11] = "CarriageReturn";
    MatchSubStatementType[MatchSubStatementType["Boundary"] = 12] = "Boundary";
    MatchSubStatementType[MatchSubStatementType["Unicode"] = 13] = "Unicode";
    MatchSubStatementType[MatchSubStatementType["Letter"] = 14] = "Letter";
    MatchSubStatementType[MatchSubStatementType["Decimal"] = 15] = "Decimal";
    MatchSubStatementType[MatchSubStatementType["Integer"] = 16] = "Integer";
})(MatchSubStatementType = exports.MatchSubStatementType || (exports.MatchSubStatementType = {}));
/**
 * Container for match statements
 *
 * @internal
 */
class MatchSubStatementValue {
    /**
     * Constructor for MatchSubStatementValue
     *
     * @param type the type of this match
     * @param from optional value or range string
     * @param to  optional range string
     * @internal
     */
    constructor(type, from = null, to = null) {
        this.type = type;
        this.from = from;
        this.to = to;
        /* empty */
    }
}
exports.MatchSubStatementValue = MatchSubStatementValue;
/**
 * Container for MatchStatementValue
 *
 * @internal
 */
class MatchStatementValue {
    /**
     * Constructor for MatchStatementValue
     *
     * @param optional is this match optional
     * @param statement the substatement to generate
     * @internal
     */
    constructor(optional, statement) {
        this.optional = optional;
        this.statement = statement;
        /* empty */
    }
    validate(language, context) {
        return this.statement.validate(language, context);
    }
    toRegex(language) {
        let match_stmt = this.statement.toRegex(language);
        // need to group if optional and ungrouped
        if (this.optional) {
            match_stmt = generator_helper_1.groupIfRequired(match_stmt) + "?";
        }
        return match_stmt;
    }
}
exports.MatchStatementValue = MatchStatementValue;
/**
 * The base class for all statement concrete syntax trees
 *
 * @internal
 */
class StatementCST extends H2RCST {
}
exports.StatementCST = StatementCST;
/**
 * Concrete Syntax Tree for Match Sub statements
 *
 * @internal
 */
class MatchSubStatementCST extends H2RCST {
    /**
     * Constructor for MatchSubStatementCST
     *
     * @param tokens Tokens used to calculate where an error occured
     * @param count optional count statement
     * @param invert is this match inverted (ex, [^a-z] or [a-z])
     * @param values sub statements to match
     */
    constructor(tokens, count, invert = false, values) {
        super(tokens);
        this.count = count;
        this.invert = invert;
        this.values = values;
    }
    validate(language, context) {
        const errors = [];
        if (this.count) {
            utilities_1.append(errors, this.count.validate(language, context));
        }
        for (const value of this.values) {
            if (value.type === MatchSubStatementType.Between) {
                let from = utilities_1.removeQuotes(value.from);
                let to = utilities_1.removeQuotes(value.to);
                if (!utilities_1.isSingleRegexCharacter(from)) {
                    errors.push(this.error("Between statement must begin with a single character"));
                }
                else if (from.startsWith("\\u") || from.startsWith("\\U") || from.startsWith("\\")) {
                    from = JSON.parse(`"${from}"`);
                }
                if (!utilities_1.isSingleRegexCharacter(to)) {
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
                let unicode_class = utilities_1.removeQuotes(value.from);
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
    toRegex(language) {
        const matches = [];
        for (const value of this.values) {
            switch (value.type) {
                case MatchSubStatementType.SingleString: {
                    const reg = utilities_1.regexEscape(utilities_1.removeQuotes(value.from));
                    matches.push(this.invert ? `(?!${reg})` : reg);
                    break;
                }
                case MatchSubStatementType.Between: {
                    const from = utilities_1.removeQuotes(value.from);
                    const to = utilities_1.removeQuotes(value.to);
                    matches.push(this.invert ? `[^${from}-${to}]` : `[${from}-${to}]`);
                    break;
                }
                case MatchSubStatementType.Unicode: {
                    const unicode = utilities_1.removeQuotes(value.from);
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
        let ret = generator_helper_1.minimizeMatchString(matches);
        if (this.count) {
            if (matches.length === 1) {
                // we don't group if there's only 1 element
                // but we need to make sure we don't add an additional + or * 
                ret = generator_helper_1.dontClobberRepetition(ret, this.count.toRegex(language));
            }
            else {
                ret = generator_helper_1.groupIfRequired(ret) + this.count.toRegex(language);
            }
        }
        return ret;
    }
}
exports.MatchSubStatementCST = MatchSubStatementCST;
/**
 * Concrete Syntax Tree for Using statements
 *
 * @internal
 */
class UsingStatementCST extends H2RCST {
    /**
     * Constructor for UsingStatementCST
     *
     * @param tokens Tokens used to calculate where an error occured
     * @param flags using flags
     */
    constructor(tokens, flags) {
        super(tokens);
        this.flags = flags;
    }
    validate(language, context) {
        utilities_1.unusedParameter(language, "Count does not need checking");
        utilities_1.unusedParameter(context, "Context is not needed");
        const errors = [];
        let flag = this.flags[0];
        for (let i = 1; i < this.flags.length; i++) {
            if (utilities_1.hasFlag(flag, this.flags[i])) {
                errors.push(this.error("Duplicate modifier: " + UsingFlags[this.flags[i]]));
            }
            flag = utilities_1.combineFlags(flag, this.flags[i]);
        }
        if (utilities_1.hasFlag(flag, UsingFlags.Sensitive) && utilities_1.hasFlag(flag, UsingFlags.Insensitive)) {
            errors.push(this.error("Cannot be both case sensitive and insensitive"));
        }
        return errors;
    }
    toRegex(language) {
        utilities_1.unusedParameter(language, "Using Statement does not change based on language");
        let str = "";
        let exact = false;
        for (const flag of this.flags) {
            if (utilities_1.hasFlag(flag, UsingFlags.Multiline)) {
                str += "m";
            }
            else if (utilities_1.hasFlag(flag, UsingFlags.Global)) {
                str += "g";
            }
            else if (utilities_1.hasFlag(flag, UsingFlags.Insensitive)) {
                str += "i";
            }
            else if (utilities_1.hasFlag(flag, UsingFlags.Exact)) {
                exact = true;
            }
        }
        return exact ? "/^{regex}$/" + str : "/{regex}/" + str;
    }
}
exports.UsingStatementCST = UsingStatementCST;
/**
 * Concrete Syntax Tree for Count sub statements
 *
 * @internal
 */
class CountSubStatementCST extends H2RCST {
    /**
     * Constructor for CountSubStatementCST
     *
     * @param tokens Tokens used to calculate where an error occured
     * @param from number to count from
     * @param to optional number to count to
     * @param opt option modifier
     */
    constructor(tokens, from, to = null, opt = null) {
        super(tokens);
        this.from = from;
        this.to = to;
        this.opt = opt;
    }
    validate(language, context) {
        utilities_1.unusedParameter(language, "Count does not need checking");
        utilities_1.unusedParameter(context, "Context is not needed");
        const errors = [];
        if (this.to !== null && ((this.opt === "exclusive" && (this.to - 1) <= this.from) || this.to <= this.from)) {
            errors.push(this.error("Values must be in range of eachother"));
        }
        return errors;
    }
    toRegex(language) {
        utilities_1.unusedParameter(language, "Count does not change from language");
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
exports.CountSubStatementCST = CountSubStatementCST;
/**
 * Concrete Syntax Tree for a Match statement
 *
 * @internal
 */
class MatchStatementCST extends StatementCST {
    /**
     * Constructor for MatchStatementCST
     *
     * @param tokens Tokens used to calculate where an error occured
     * @param matches the list of matches
     */
    constructor(tokens, completely_optional, matches) {
        super(tokens);
        this.completely_optional = completely_optional;
        this.matches = matches;
    }
    validate(language, context) {
        const errors = [];
        for (const match of this.matches) {
            utilities_1.append(errors, match.statement.validate(language, context));
        }
        return errors;
    }
    toRegex(language) {
        let final_matches = this.matches.map((x) => x.toRegex(language)).join("");
        if (this.completely_optional) {
            final_matches = generator_helper_1.groupIfRequired(final_matches) + "?";
        }
        return final_matches;
    }
}
exports.MatchStatementCST = MatchStatementCST;
/**
 * Concrete Syntax Tree for a Repeat statement
 *
 * @internal
 */
class RepeatStatementCST extends StatementCST {
    /**
     * Constructor for RepeatStatementCST
     *
     * @param tokens Tokens used to calculate where an error occured
     * @param optional is this repetition optional
     * @param count optional number of times to repeat
     * @param statements the statements to repeat
     */
    constructor(tokens, optional, count, statements) {
        super(tokens);
        this.optional = optional;
        this.count = count;
        this.statements = statements;
    }
    validate(language, context) {
        const errors = [];
        if (this.count !== null) {
            utilities_1.append(errors, this.count.validate(language, context));
        }
        for (const statement of this.statements) {
            utilities_1.append(errors, statement.validate(language, context));
        }
        return errors;
    }
    toRegex(language) {
        let str = generator_helper_1.groupIfRequired(this.statements.map((x) => x.toRegex(language)).join(""));
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
exports.RepeatStatementCST = RepeatStatementCST;
/**
 * Conrete Syntax Tree for a group Statement
 *
 * @internal
 */
class GroupStatementCST extends StatementCST {
    /**
     * Constructor for GroupStatementCST
     *
     * @param tokens Tokens used to calculate where an error occured
     * @param optional is this group optional
     * @param name optional name for named group
     * @param statements other statements
     * @internal
     */
    constructor(tokens, optional, name, statements) {
        super(tokens);
        this.optional = optional;
        this.name = name;
        this.statements = statements;
    }
    validate(language, context) {
        const errors = [];
        if (this.name !== null) {
            if (context.hasGroup(this.name)) {
                const past_group = context.groups[this.name];
                errors.push(this.error(`Group with name "${this.name}" was already defined here: ${past_group.startLine}:${past_group.startLine}-${past_group.startLine}:${past_group.startLine + past_group.length}`));
            }
            else {
                context.addGroup(this.name, this.tokens);
            }
        }
        for (const statement of this.statements) {
            utilities_1.append(errors, statement.validate(language, context));
        }
        return errors;
    }
    toRegex(language) {
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
        str += this.statements.map((x) => x.toRegex(language)).join("");
        str += (this.optional ? ")?" : ")");
        return str;
    }
}
exports.GroupStatementCST = GroupStatementCST;
/**
 * Concrete Syntax Tree for a Backreference statement
 *
 * @internal
 */
class BackrefStatementCST extends StatementCST {
    /**
     * Constructor for BackrefStatementCST
     *
     * @param tokens Tokens used to calculate where an error occured
     * @param optional is this backref optional
     * @param count optional number of times to repeat
     * @param name the group name to call
     */
    constructor(tokens, optional, count, name) {
        super(tokens);
        this.optional = optional;
        this.count = count;
        this.name = name;
    }
    validate(language, context) {
        const errors = [];
        if (!context.hasGroup(this.name)) {
            errors.push(this.error(`Cannot call group with name "${this.name}" as it was never previously defined`));
        }
        if (this.count !== null) {
            utilities_1.append(errors, this.count.validate(language, context));
        }
        return errors;
    }
    toRegex(language) {
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
exports.BackrefStatementCST = BackrefStatementCST;
/**
 * Concrete Syntax Tree for an If Pattern statement
 *
 * @internal
 */
class IfPatternStatementCST extends StatementCST {
    /**
     * Constructor for IfPatternStatementCST
     *
     * @param tokens Tokens used to calculate where an error occured
     * @param matches list of matches to test against
     * @param true_statements true path
     * @param false_statements false path
     */
    constructor(tokens, matches, true_statements, false_statements) {
        super(tokens);
        this.matches = matches;
        this.true_statements = true_statements;
        this.false_statements = false_statements;
    }
    validate(language, context) {
        const errors = [];
        if (language === RegexDialect.Java || language === RegexDialect.JS) {
            errors.push(this.error("This language does not support conditionals"));
        }
        if (language === RegexDialect.Python) {
            errors.push(this.error("This language does not support pattern conditionals"));
        }
        for (const match of this.matches) {
            utilities_1.append(errors, match.validate(language, context));
        }
        for (const statement of this.true_statements) {
            utilities_1.append(errors, statement.validate(language, context));
        }
        for (const statement of this.false_statements) {
            utilities_1.append(errors, statement.validate(language, context));
        }
        return errors;
    }
    toRegex(language) {
        const if_stmt = this.matches.map((x) => x.toRegex(language)).join("");
        const true_stmt = generator_helper_1.groupIfRequired(this.true_statements.map((x) => x.toRegex(language)).join(""));
        if (this.false_statements.length > 0) {
            const false_stmt = generator_helper_1.groupIfRequired(this.false_statements.map((x) => x.toRegex(language)).join(""));
            return `(?(${if_stmt})${true_stmt}|${false_stmt})`;
        }
        else {
            return `(?(${if_stmt})${true_stmt})`;
        }
    }
}
exports.IfPatternStatementCST = IfPatternStatementCST;
/**
 * Concrete Syntax Tree for an If group Ident statement
 *
 * @internal
 */
class IfIdentStatementCST extends StatementCST {
    /**
     * Constructor for IfIdentStatementCST
     *
     * @param tokens Tokens used to calculate where an error occured
     * @param identifier the group identifier to check
     * @param true_statements true path
     * @param false_statements false path
     */
    constructor(tokens, identifier, true_statements, false_statements) {
        super(tokens);
        this.identifier = identifier;
        this.true_statements = true_statements;
        this.false_statements = false_statements;
    }
    validate(language, context) {
        const errors = [];
        if (language === RegexDialect.Java || language === RegexDialect.JS) {
            errors.push(this.error("This language does not support conditionals"));
        }
        if (!context.hasGroup(this.identifier)) {
            errors.push(this.error(`Group with name "${this.identifier}" does not exist`));
        }
        for (const statement of this.true_statements) {
            utilities_1.append(errors, statement.validate(language, context));
        }
        for (const statement of this.false_statements) {
            utilities_1.append(errors, statement.validate(language, context));
        }
        return errors;
    }
    toRegex(language) {
        let if_stmt = this.identifier;
        // be more clear with languages that support it
        if (language === RegexDialect.Boost) {
            if_stmt = "<" + if_stmt + ">";
        }
        const true_stmt = generator_helper_1.groupIfRequired(this.true_statements.map((x) => x.toRegex(language)).join(""));
        if (this.false_statements.length > 0) {
            const false_stmt = generator_helper_1.groupIfRequired(this.false_statements.map((x) => x.toRegex(language)).join(""));
            return `(?(${if_stmt})${true_stmt}|${false_stmt})`;
        }
        else {
            return `(?(${if_stmt})${true_stmt})`;
        }
    }
}
exports.IfIdentStatementCST = IfIdentStatementCST;
/**
 * Concrete Syntax Tree for a regular expression
 *
 * @internal
 */
class RegularExpressionCST extends H2RCST {
    /**
     * Constructor for RegularExpressionCST
     *
     * @param tokens Tokens used to calculate where an error occured
     * @param usings using statements
     * @param statements other statements
     * @internal
     */
    constructor(tokens, usings, statements) {
        super(tokens);
        this.usings = usings;
        this.statements = statements;
    }
    validate(language, context) {
        const errors = this.usings.validate(language, context);
        for (const statement of this.statements) {
            utilities_1.append(errors, statement.validate(language, context));
        }
        return errors;
    }
    toRegex(language) {
        const modifiers = this.usings.toRegex(language);
        const regex = this.statements.map((x) => x.toRegex(language)).join("");
        return modifiers.replace("{regex}", regex);
    }
}
exports.RegularExpressionCST = RegularExpressionCST;
