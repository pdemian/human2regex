/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

import { Token } from "./tokens";

export class SyntaxError extends Error {
    constructor(message: string, public tokens: Token[]) {
        super(message);
    }

    public to_string(): string {
        return `Syntax Error: ${this.message}`;
    }
}

/* TODO: line number/position? */
export interface AbstractSyntaxTree {
    to_string(): string;
}

export class Qualifier implements AbstractSyntaxTree {
    constructor(public type: string) {
        /* empty */
    }
    public to_string(): string {

        if(this.type === "g") {
            return "g";
        }
        else if(this.type === "m") {
            return "m";
        }
        else {
            return "i";
        }
    }
}

export class Regex implements AbstractSyntaxTree {
    constructor(public inner_trees: AbstractSyntaxTree[], public qualifiers: Qualifier[]) {
        /* empty */
    }

    public to_string(): string {
        let str = "/";

        for(const tree of this.inner_trees) {
            str += tree.to_string();
        }

        str += "/";

        for(const tree of this.qualifiers) {
            str += tree.to_string();
        }

        return str;
    }
}

export class Group implements AbstractSyntaxTree {
    constructor(public inner_tree: AbstractSyntaxTree, public name?: string) {
        /* empty */
    }

    public to_string(): string {
        return "(" + (name ? `?<${this.name}>` : "") + `${this.inner_tree.to_string()})`;
    }
}

export class Any implements AbstractSyntaxTree {
    constructor() {
        /* empty */
    }

    public to_string(): string {
        return ".";
    }
}

export class AnyOf implements AbstractSyntaxTree {
    constructor(public inner_trees: AbstractSyntaxTree[], public negated: boolean) {
        /* empty */
    }

    public to_string(): string {
        let str = "[";

        if(this.negated) {
            str += "^";
        }

        for(const tree of this.inner_trees) {
            str += tree.to_string();
        }

        str += "]";
        return str;
    }
}

export class Repeat implements AbstractSyntaxTree {
    constructor(public inner_tree: AbstractSyntaxTree, public first_required: boolean) {
        /* empty */
    }

    public to_string(): string {
        return this.inner_tree.to_string() + (this.first_required ? "+" : "*");
    }
}

export class Optional implements AbstractSyntaxTree {
    constructor(public inner_tree: AbstractSyntaxTree) {
        /* empty */
    }

    public to_string(): string {
        return `${this.inner_tree.to_string()}?`;
    }
}

export class Anchor implements AbstractSyntaxTree {
    constructor(public inner_tree: AbstractSyntaxTree) {
        /* empty */
    }

    public to_string(): string {
        return `^${this.inner_tree.to_string()}$`;
    }
}

export class Range implements AbstractSyntaxTree {
    constructor(public from: string, public to: string) {
        /* empty */
    }
    public to_string(): string {
        return `${this.from}-${this.to}`;
    }
}

export class QuantifierExactly implements AbstractSyntaxTree {
    constructor(public inner_tree: AbstractSyntaxTree, public count: number) {
        /* empty */
    }
    public to_string(): string {
        return `${this.inner_tree.to_string()}{${this.count}}`;
    }
}

export class QuantifierBetween implements AbstractSyntaxTree {
    constructor(public inner_tree: AbstractSyntaxTree, public from: number, public to?: number, public inclusive?: boolean) {
        /* empty */
    }
    public to_string(): string {
        let str = `${this.inner_tree.to_string()}{${this.from},`;

        if(this.to) {
            str += (this.to-(this.inclusive?0:1));
        }

        str += "}";
        return str;
    }
}

export class Or implements AbstractSyntaxTree {
    constructor(public left_tree: AbstractSyntaxTree, public right_tree: AbstractSyntaxTree) {
        /* empty */
    }
    public to_string(): string {
        return `${this.left_tree.to_string()}|${this.right_tree.to_string()}`;
    }
}

export class And implements AbstractSyntaxTree {
    constructor(public left_tree: AbstractSyntaxTree, public right_tree: AbstractSyntaxTree) {
        /* empty */
    }
    public to_string(): string {
        return `${this.left_tree.to_string()}${this.right_tree.to_string()}`;
    }
}

export class Specifier implements AbstractSyntaxTree {
    constructor(public type: string, public negated: boolean) {
        /* empty */
    }
    public to_string(): string {
        let str = "\\";

        if(this.type === "w") {
            str += (this.negated ? "W" : "w");
        }
        else if(this.type === "d") {
            str += (this.negated ? "D" : "d");
        }
        else {
            str += (this.negated ? "S" : "s");
        }

        return str;
    }

    // \w \d \s : word, digit, whitespace
}

export class Match implements AbstractSyntaxTree {
    // remember: transform unicode, escape stuff

    constructor(public match: string) {
        /* empty */
    }
    public to_string(): string {
        /* TODO: ESCAPE/TRANSFORM CHARACTERS! */

        return this.match;
    }
}

export class SpecialCharacter implements AbstractSyntaxTree {
    //type: \t\r\n

    constructor(public type: string) {
        /* empty */
    }
    public to_string(): string {
        if(this.type === "t") {
            return "\\t";
        }
        else if(this.type === "r") {
            return "\\r";
        }
        else {
            return "\\n";
        }
    }
}