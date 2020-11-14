# Tutorial

## Preface

Human2Regex (H2R) comes with a simple API allowing you to embed the H2R language inside your application.
The steps to generate a regular expression go as follows
- Lex the input text (detects lexing errors)
- Parse the input text (detects parsing errors)
- Generate/interpret the input text (detects semantic errors)

## Lexing your text

H2R's lexer comes with a few options for stricter parsing and some performance optimizations

```typescript
export declare class Human2RegexLexerOptions {
    // If true, the lexer will skip validations (~25% faster)
    skip_validations?: boolean = false;
    // The type of indents the lexer will allow
    type?: IndentType = IndentType.Both;
    // Number of spaces per tab
    spaces_per_tab?: number = 4;
}

export declare enum IndentType {
    Tabs = 0,
    Spaces = 1,
    Both = 2
}
```
Once your options are determined, you can instanciate a lexer like so:

```typescript
import { Human2RegexLexer, Human2RegexLexerOptions } from "human2regex";
const lexer = new Human2RegexLexer(new Human2RegexLexerOptions(true));
```

Due to a technical limitation as well as just for performance reasons, only 1 instance of `Human2RegexLexer` is allowed.

To use the lexer, call tokenize on your input text:

```typescript
const lex_result = lexer.tokenize("<your text here>");
```

This returns an TokenizeResult which is passed on to the parser.

```typescript
export declare class TokenizeResult {
    // tokens parsed
    tokens: IToken[];
    // errors found
    errors: CommonError[];
}
```

To determine if the lex occured successfully, check to see if `lex_result.errors` contains any elements. The `CommonError` class contains a `.toString()` function which returns a textual representation of the error.

You may also use the `CommonError` itself if you wish to incorporate it into a text editor.

```typescript
export declare class CommonError {
    // Type of error (Lexer, Parser, Semantic)
    type: string;
    
    // position of error
    start_line: number;
    start_column: number;
    length: number;

    //textual message
    message: string;
}
```

You can reuse the lexer by calling `tokenize()` again with new text.

## Parsing the tokens

H2R's parser comes only with a performance optimization
```typescript
export declare class Human2RegexParserOptions {
    // If true, the lexer will skip validations (~25% faster)
    skip_validations?: boolean = true;
}
```

Once your options are determined, you can instanciate a lexer like so:

```typescript
import { Human2RegexParser, Human2RegexParserOptions } from "human2regex";
const parser = new Human2RegexParser(new Human2RegexParserOptions(true));
```

Due to a technical limitation as well as just for performance reasons, only 1 instance of `Human2RegexParser` is allowed.

To use it, call the parser with your tokens from the lexer:

```typescript
const parse_result = parser.parse(lex_result.tokens);
```

This returns an TokenizeResult which is passed on to the parser.
```typescript
export declare class ParseResult {
    // errors found
    errors: CommonError[];
}
```

The parser's errors are found via `parse_result.errors` and again can be checked to see if the parse was successful by checking the length of this list.

## Generating your regex
Assuming no errors were found, now it's time to generate the regular expression

H2R supports a few languages so far:

```typescript
export enum RegexDialect {
    JS,
    PCRE,
    DotNet,
    Java
}
```

After choosing one, you must validate the regular expression. This may be skipped if and only if the input has already been validated before as the generator is not guaranteed to work unless there are no errors.

```typescript
const validation_errors = parse_result.validate();
```

The result is a list of errors which, again, is a `CommonError`. If there are no errors, you can call the `toRegex()` function to create a string representation of the regular expression. You can also call the `toRegExp()` function to create a `RegExp` expression used in Javascript

```typescript
const my_regex_string = parse_result.toRegex(); // type is string
const my_regex =  parse_result.toRegExp(); // type is RegExp
```

This will contain your regular expression.

## Full Example
```typescript
import { Human2RegexLexer, Human2RegexLexerOptions,
         Human2RegexParser, Human2RegexParserOptions,
         CommonError, RegexDialect } from "human2regex";

const lexer = new Human2RegexLexer(new Human2RegexLexerOptions(true));
const parser = new Human2RegexParser(new Human2RegexParserOptions(true));

// using JavaScript instead? Use this declaration instead
// function Human2Regex(input) {
function Human2Regex(input: string): { regex: string, errors: CommonError[] } {
    // tokenize
    const tokenize_result = lexer.tokenize(input);
    if(tokenize_result.errors.length > 0) {
        return { regex: "", errors: tokenize_result.errors };
    }

    // parse
    const parse_result = parser.parse(tokenize_result.tokens);
    if(parse_result.errors.length > 0) {
        return { regex: "", errors: parse_result.errors }
    }

    // validate
    const validation_errors = parse_result.validate(RegexDialect.JS);
    if(validation_errors.length > 0) {
        return { regex: "", errors: validation_errors }
    }

    // generate
    return { regex: parse_result.toRegex(RegexDialect.JS), errors: [] };
}

const result = Human2Regex('match "Hello World"');

// check for errors
if(result.errors.length > 0) {
    for(const error of result.errors) {
        console.log(error.toString());
    }
}
else {
    console.log("Your Regex is " + result.regex);
}
```