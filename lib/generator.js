"use strict";
/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegularExpressionCST = exports.GroupStatementCST = exports.RepeatStatementCST = exports.MatchStatementCST = exports.CountSubStatementCST = exports.UsingStatementCST = exports.MatchSubStatementCST = exports.StatementCST = exports.MatchStatementValue = exports.MatchSubStatementValue = exports.MatchSubStatementType = exports.UsingFlags = exports.H2RCST = exports.RegexDialect = void 0;
/**
 * Includes all Concrete Syntax Trees for Human2Regex
 * @packageDocumentation
 */
const utilities_1 = require("./utilities");
/**
 * List of regular expression dialects we support
 */
var RegexDialect;
(function (RegexDialect) {
    RegexDialect[RegexDialect["JS"] = 0] = "JS";
    RegexDialect[RegexDialect["PCRE"] = 1] = "PCRE";
    RegexDialect[RegexDialect["DotNet"] = 2] = "DotNet";
    RegexDialect[RegexDialect["Java"] = 3] = "Java";
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
        this.tokens = tokens;
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
    validate(language) {
        let errors = [];
        if (this.count) {
            errors = errors.concat(this.count.validate(language));
        }
        for (const value of this.values) {
            if (value.type === MatchSubStatementType.Between) {
                let from = value.from;
                let to = value.to;
                if (!utilities_1.isSingleRegexCharacter(from)) {
                    errors.push(this.error("Between statement must begin with a single character"));
                }
                else if (from.startsWith("\\u") || from.startsWith("\\U") || from.startsWith("\\")) {
                    from = JSON.parse(`"${utilities_1.regexEscape(from)}"`);
                }
                if (!utilities_1.isSingleRegexCharacter(to)) {
                    errors.push(this.error("Between statement must end with a single character"));
                }
                else if (to.startsWith("\\u") || to.startsWith("\\U") || to.startsWith("\\")) {
                    to = JSON.parse(`"${utilities_1.regexEscape(to)}"`);
                }
                if (from.charCodeAt(0) >= to.charCodeAt(0)) {
                    errors.push(this.error("Between statement range invalid"));
                }
            }
            else if (value.type === MatchSubStatementType.Unicode) {
                let unicode_class = value.from;
                // check to see if the given code is supported
                if (!unicode_property_codes.includes(unicode_class)) {
                    // check to see if the given script is supported
                    // Java and C# requires "Is*"
                    if (language === RegexDialect.DotNet || language === RegexDialect.Java) {
                        if (!unicode_class.startsWith("Is")) {
                            errors.push(this.error("This dialect requires script names to begin with Is, such as IsCyrillic rather than Cyrillic"));
                            continue;
                        }
                        unicode_class = unicode_class.substr(0, 2);
                    }
                    // attempt with and without "_" characters
                    if (!unicode_script_codes.includes(unicode_class) && !unicode_script_codes.includes(unicode_class.replace("_", ""))) {
                        errors.push(this.error(`Unknown unicode specifier ${value.from}`));
                    }
                }
            }
        }
        return errors;
    }
    toRegex(language) {
        const str = [];
        for (const value of this.values) {
            switch (value.type) {
                case MatchSubStatementType.SingleString: {
                    const reg = utilities_1.regexEscape(utilities_1.removeQuotes(value.from));
                    str.push(this.invert ? `(?:(?!${reg}))` : reg);
                    break;
                }
                case MatchSubStatementType.Between:
                    str.push(this.invert ? `[^${value.from}-${value.to}]` : `[${value.from}-${value.to}]`);
                    break;
                case MatchSubStatementType.Unicode:
                    str.push(this.invert ? `\\P{${value.from}}` : `\\p{${value.from}}`);
                    break;
                case MatchSubStatementType.Boundary:
                    str.push(this.invert ? "\\B" : "\\b");
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
        let require_grouping = false;
        let dont_clobber_plus = false;
        if (str.length === 1) {
            ret = str[0];
            if (ret.endsWith("+")) {
                dont_clobber_plus = true;
            }
        }
        // we can use regex's [] for single chars, otherwise we need a group
        else if (str.every(utilities_1.isSingleRegexCharacter)) {
            ret = "[" + str.join("") + "]";
        }
        else {
            //use a no-capture group
            ret = str.join("|");
            require_grouping = true;
        }
        if (this.count) {
            if (dont_clobber_plus) {
                const clobber = this.count.toRegex(language);
                // + can be ignored as well as a count as long as that count is > 0
                switch (clobber) {
                    case "*":
                    case "?":
                        ret = "(?:" + ret + ")" + clobber;
                        break;
                    case "+":
                        // ignore
                        break;
                    default:
                        if (clobber.startsWith("{0")) {
                            ret = "(?:" + ret + ")" + clobber;
                        }
                        else {
                            // remove + and replace with count
                            ret.substring(0, ret.length - 1) + clobber;
                        }
                        break;
                }
            }
            else {
                if (require_grouping) {
                    ret = "(?:" + ret + ")";
                }
                ret += this.count.toRegex(language);
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
    validate(language) {
        utilities_1.unusedParameter(language, "Using Statement does not change based on language");
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
    validate(language) {
        utilities_1.unusedParameter(language, "Count does not need checking");
        const errors = [];
        if (this.from < 0) {
            errors.push(this.error("Value cannot be negative"));
        }
        else if (this.to !== null && ((this.opt === "exclusive" && (this.to - 1) <= this.from) || this.to <= this.from)) {
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
     * @param matches
     */
    constructor(tokens, matches) {
        super(tokens);
        this.matches = matches;
    }
    validate(language) {
        let errors = [];
        for (const match of this.matches) {
            errors = errors.concat(match.statement.validate(language));
        }
        return errors;
    }
    toRegex(language) {
        return this.matches.map((x) => {
            let match_stmt = x.statement.toRegex(language);
            // need to group if optional and ungrouped
            if (x.optional) {
                if (!utilities_1.isSingleRegexCharacter(match_stmt)) {
                    // don't re-group a group
                    if (match_stmt[0] !== "(" && match_stmt[match_stmt.length - 1] !== ")") {
                        match_stmt = "(?:" + match_stmt + ")";
                    }
                }
                match_stmt += "?";
            }
            return match_stmt;
        }).join("");
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
    validate(language) {
        let errors = [];
        if (this.count !== null) {
            errors = errors.concat(this.count.validate(language));
        }
        for (const statement of this.statements) {
            errors = errors.concat(statement.validate(language));
        }
        return errors;
    }
    toRegex(language) {
        let str = "(" + this.statements.map((x) => x.toRegex(language)).join("") + ")";
        if (this.count) {
            str += this.count.toRegex(language);
        }
        else {
            str += "*";
        }
        if (this.optional) {
            str += "?";
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
    validate(language) {
        let errors = [];
        // All languages currently support named groups
        //if (false) {
        //    errors.push(this.error("This language does not support named groups"));
        //}
        for (const statement of this.statements) {
            errors = errors.concat(statement.validate(language));
        }
        return errors;
    }
    toRegex(language) {
        let str = "(";
        // named group
        if (this.name !== null) {
            str += `?<${this.name}>`;
        }
        str += this.statements.map((x) => x.toRegex(language)).join("");
        str += (this.optional ? ")?" : ")");
        return str;
    }
}
exports.GroupStatementCST = GroupStatementCST;
/**
 * Concrete Syntax Tree for a regular expression
 *
 * @public
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
    validate(language) {
        let errors = this.usings.validate(language);
        for (const statement of this.statements) {
            errors = errors.concat(statement.validate(language));
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