export enum TokenType {
    END_OF_STATEMENT,
    INDENT,
    BETWEEN,
    QUOTE,
    NUMBER,
    PARTIAL_KEYWORD,
    KEYWORD_BETWEEN,
    KEYWORD_OPTIONAL,
    KEYWORD_MATCH,
    KEYWORD_THEN,
    KEYWORD_AND,
    KEYWORD_OR,
    KEYWORD_ANY,
    KEYWORD_OF,
    KEYWORD_NONE,
    KEYWORD_NEITHER,
    KEYWODE_WORD_SPECIFIER,
    KEYWORD_DIGIT_SPECIFIER,
    KEYWORD_CHAR_SPECIFIER,
    KEYWORD_WHITESPACE_SPECIFIER,
    KEYWORD_NUMBER_SPECIFIER,
    KEYWORD_MULTIPLE,
    KEYWORD_AS,
    KEYWORD_IF,
    KEYWORD_STARTS,
    KEYWORD_WITH,
    KEYWORD_ENDS,
    KEYWORD_ELSE,
    KEYWORD_UNLESS,
    KEYWORD_WHILE,
    KEYWORD_MORE,
    KEYWORD_USING,
    KEYWORD_GLOBAL,
    KEYWORD_MULTILINE,
    KEYWORD_EXACT,
    KEYWORD_MATCHING,
    KEYWORD_NOT,
    KEYWORD_TAB,
    KEYWORD_LINEFEED,
    KEYWORD_CARRIAGE_RETURN,
    KEYWORD_GROUP,
    KEYWORD_BY,
    KEYWORD_ARTICLE,
    KEYWORD_EXACTLY,
    KEYWORD_INCLUSIVE,
    KEYWORD_EXCLUSIVE,
    KEYWORD_FROM,
    KEYWORD_TO,
    KEYWORD_CREATE,
    KEYWORD_CALLED,
    KEYWORD_REPEAT,
    KEYWORD_NEWLINE,
    KEYWORD_CASE_SENSITIVE,
    KEYWORD_CASE_INSENSITIVE
}

export class TokenError extends Error {
    constructor(message: string, public line: number, public position: number) {
        super(message);
    }

    public to_string(): string {
        return `Token Error: ${this.line}:${this.position} ${this.message}`;
    }
}

export class Token {
    constructor(public type: TokenType, public line: number, public position: number, public length: number, public token_string?: string) { 
        /* nothing required */
    }

    public to_string(): string {
        let str = `${this.line}:${this.position} ${TokenType[this.type]}`;

        if (this.token_string) {
            str += ` "${this.token_string}"`;
        }

        str += ` (size: ${this.length})`;

        return str;
    }
}