# Human2Regex

## Purpose

Generate regular expressions from natural language.

Instead of a convoluted mess of symbols like `/([\w\.=\-]*\w+)/g` why not

    using global matching
    create a group called capture_me
        match 0+ characters or "." or "=" or "-"
        match 1+ words

Is the former not much easier to read and bug fix than the latter?

Running the program should result in the following output:

    Your regex = /(?<capture_me>[\w\.\=\-]*\w++)/g

You can then use your regex in your language of choice, with Human2Regex validating your regex for you.

Another example

    // H2R supports // # and /**/ as comments
    // A group is only captured if given a name. 
    // You can use "and", "or", "not" to specify `[]` regex
    // You can use "then" to combine match statements, however I find using multiple "match" statements easier to read

    // exact matching means use a ^ and $ to signify the start and end of the string

    using global and exact matching
    create an optional group called "protocol"
        match "http"
        optionally match "s"
        match "://"
    create a group called "subdomain"
        repeat
            match 1+ words
            match "."
    create a group called "domain"
        match 1+ words or "_" or "-"
        match "."
        match a word
    # port, but we don't care about it, so ignore it
    optionally match ":" then 0+ digits
    create an optional group called "path"
        repeat
            match "/"
            match 0+ words or "_" or "-"
    create an optional group
        # we don't want to capture the '?', so don't name the group until afterwards
        match "?"
        create a group called "query"
            repeat
                match 1+ words or "_" or "-"
                match "="
                match 1+ words or "_" or "-"
    create an optional group
        # fragment, again, we don't care, so ignore everything afterwards
        match "#"
        match 0+ anything

Running the program should result in the following output:

    Your regex = /^(?<protocol>https?\:\/\/)?(?<subdomain>(\w+\.)*)?(?<domain>(?:\w+|_|\-)+\.\w+)\:?\d*(?<path>(\/(?:\w+|_|\-)*)*)?(\?(?<query>((?:\w+|_|\-)+\=(?:\w+|_|\-)+)*))?(#.*)?$/g

Which one would you rather debug?

## Usage
Build

    npm run build

Run
    
    point web browser to: docs/index.html

Test

    npm t


## Todo
- Seperate website and source code. Move to yarn/npm
- Add more regex options such as back references, subroutines, lookahead/behind, and more character classes (eg,  `[:alpha:]`)