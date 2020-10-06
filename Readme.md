# Human2Regex

## Purpose

Generate regular expressions from natural language. Currently WIP, but should look something like this:

Instead of a convoluted mess of symbols why not

    using global matching
    create a group called "capture_me" 
        match 0+ words or "." or "=" or "-"
        match 1+ words

Running the program should result in the following output:

    Your regex = /\$([\w\.=\-]*[\w]+)/g
    "capture_me" is group id 1

Is the former not much easier to read and bug fix than the latter?

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

    Your regex = /^(https?:\/\/)?((\w\.)*)(:\d+)?([\w_\-]\.\w)((/[\w_\-]))?(\?([\w_\-]=[\w_\-]))?(#.*)$/g
    "protocol" is group id 1
    "subdomain" is group id 2
    "domain" is group id 4
    "path" is group id 5
    "query" is group id 5 or 6 if "path" exists

## Usage
Configure config.ts
Run

    npm run build

