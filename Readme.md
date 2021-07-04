# Human2Regex

<div align="center">

  ![H2R logo](./src/docs/assets/favicon-small.png)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fpdemian%2Fhuman2regex.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fpdemian%2Fhuman2regex?ref=badge_shield)

  [![Build Status](https://travis-ci.com/pdemian/human2regex.svg?branch=master)](https://travis-ci.com/pdemian/human2regex)
  [![Codecov](https://codecov.io/gh/pdemian/human2regex/branch/master/graphs/badge.svg?branch=master)](https://codecov.io/gh/pdemian/human2regex)
  [![LGTM Grade](https://img.shields.io/lgtm/grade/javascript/github/pdemian/human2regex)](https://lgtm.com/projects/g/pdemian/human2regex/)
  ![GitHub](https://img.shields.io/github/license/pdemian/human2regex)
  [![npm](https://img.shields.io/npm/v/human2regex?color=green)](https://www.npmjs.com/package/human2regex)

  [![Website](https://img.shields.io/badge/website-human2regex.com-blue)](https://human2regex.com)
  [![Docs](https://img.shields.io/badge/docs-API-blue)](API.md)
  [![Docs](https://img.shields.io/badge/docs-language-blue)](https://human2regex.com/tutorial.html)
  

</div>



[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fpdemian%2Fhuman2regex.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fpdemian%2Fhuman2regex?ref=badge_large)

## Purpose

Generate regular expressions from natural language.

Instead of a convoluted mess of symbols like `/([\w\.=\-]*\w+)/g` why not

    using global matching
    create a group
        match 0+ characters or "." or "=" or "-"
        match 1+ words

Which would you rather modify or debug?

You can then use your regex in your language of choice, with Human2Regex validating your regex for you.

## Why use Human2Regex?

- Human readable
- Easier to prototype and modify when compared to regex
- Easier to debug than raw text or even color coded regex
- "Human Speak" may contain comments
- Multiple platforms' dialects/quirks supported
- Human2Regex will minimize your final regex 
- "Human Speak" can be used by non-technical QA to verify your program's output


## Webpage
Human2Regex is hosted on github pages at [https://human2regex.com](https://human2regex.com)

## Tutorial
The language tutorial can be found at [https://human2regex.com/tutorial.html](https://human2regex.com/tutorial.html)

## API
Human2Regex is available as an embeddable API.

The API reference is available [here](API.md)

## Usage (API)
1) Install

        npm i human2regex

2) [Read the API docs](API.md)

## Usage (This repo)
1) Prebuild

        npm install

2) Build

        npm run build

3) Run
    
        point web browser to: docs/index.html

4) Test

        npm t


## Todo
- Add more regex options such as subroutines, ~~conditions, and lookahead/behind~~
- Fix error messages (They sometimes point to the wrong location, off by 1 errors, etc)
- Add more useful lex/parse errors (What even is an EarlyExitException?)
- ~~Use a different/better static site generation method~~