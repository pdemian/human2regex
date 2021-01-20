"use strict";
/*! Copyright (c) 2021 Patrick Demian; Licensed under MIT */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dontClobberRepetition = exports.groupIfRequired = exports.minimizeMatchString = void 0;
/**
 * Includes helper functions for the Generator
 * @packageDocumentation
 */
const utilities_1 = require("./utilities");
/**
 * Minimizes the match string by finding duplicates or substrings in the array
 *
 * @param arr the array of matches
 * @internal
 */
function minimizeMatchString(arr, has_neighbours = false) {
    // don't process an array of length 1, otherwise you'll get the wrong result
    if (arr.length === 1) {
        return utilities_1.first(arr);
    }
    return minMatchString(arr, has_neighbours ? 1 : 0);
}
exports.minimizeMatchString = minimizeMatchString;
/**
 * Minimizes the match string by finding duplicates or substrings in the array
 *
 * @param arr the array
 * @param depth must be 0 for initial call
 * @returns an optimized string
 * @internal
 */
function minMatchString(arr, depth = 0) {
    // base case: arr is empty
    if (arr.length === 0) {
        return "";
    }
    // base case: arr has 1 element (must have at least 2, so this means this value is optional)
    if (arr.length === 1) {
        return utilities_1.first(arr) + "?";
    }
    // remove duplicates
    arr = [...new Set(arr)];
    // base case: arr has 1 element (after duplicate removal means this is required)
    if (arr.length === 1) {
        return utilities_1.first(arr);
    }
    // base case: arr is all single letters or ranges
    if (arr.every((value) => utilities_1.isSingleRegexCharacter(value) || utilities_1.isRangeRegex(value))) {
        // if range, don't forget to remove '[' and ']'
        return "[" + arr.map((x) => utilities_1.isSingleRegexCharacter(x) ? x : x.substring(1, x.length - 1)).join("") + "]";
    }
    // now the real magic begins
    // You are not expected to understand this
    let longest_begin_substring = utilities_1.first(arr);
    let longest_end_substring = utilities_1.first(arr);
    for (let i = 1; i < arr.length; i++) {
        // reduce longest_substring to match everything 
        for (let j = 0; j < longest_begin_substring.length; j++) {
            if (arr[i].length < j || longest_begin_substring[j] !== arr[i][j]) {
                longest_begin_substring = longest_begin_substring.substr(0, j);
                break;
            }
        }
        for (let j = 0; j < longest_end_substring.length; j++) {
            if (arr[i].length - j < 0 || longest_end_substring[longest_end_substring.length - j - 1] !== arr[i][arr[i].length - j - 1]) {
                longest_end_substring = longest_end_substring.substr(longest_end_substring.length - j, longest_end_substring.length);
                break;
            }
        }
        if (longest_begin_substring.length === 0 && longest_end_substring.length === 0) {
            break;
        }
    }
    // No matches whatsoever
    // *technically* we can optimize further, but that is a VERY non-trivial problem
    // For example optimizing: [ "a1x1z", "a2y2z", "a3z3z" ] to: "a[123][xyz][123]z"
    if (longest_begin_substring.length === 0 && longest_end_substring.length === 0) {
        if (depth > 0) {
            return "(?:" + arr.join("|") + ")";
        }
        else {
            return arr.join("|");
        }
    }
    // we have some matches
    else {
        // remove begin (if exists) and end (if exists) from each element and remove empty strings
        const begin_pos = longest_begin_substring.length;
        const end_pos = longest_end_substring.length;
        const similar_matches = [];
        for (const ele of arr) {
            const match = ele.substring(begin_pos, ele.length - end_pos);
            if (match.length !== 0) {
                similar_matches.push(match);
            }
        }
        return longest_begin_substring + minMatchString(similar_matches, depth + 1) + longest_end_substring;
    }
}
/**
 * Groups a regex fragment if it needs to be grouped
 *
 * @param fragment fragment of regular expression to potentially group
 * @returns a non-capturing group if there needs to be one
 * @internal
 */
function groupIfRequired(fragment) {
    if (utilities_1.isSingleRegexCharacter(fragment)) {
        return fragment;
    }
    else if ((fragment[fragment.length - 1] === "*" || fragment[fragment.length - 1] === "+") &&
        utilities_1.isSingleRegexCharacter(fragment.substring(0, fragment.length - 1))) {
        return fragment;
    }
    if (fragment[0] === "(" && fragment[fragment.length - 1] === ")") {
        let bracket_count = 0;
        for (let i = 1; i < fragment.length - 2; i++) {
            if (fragment[i] === "\\") {
                i++;
            }
            else if (fragment[i] === "(") {
                bracket_count++;
            }
            else if (fragment[i] === ")") {
                bracket_count--;
                if (bracket_count === -1) {
                    break;
                }
            }
        }
        return bracket_count === 0 ? fragment : "(?:" + fragment + ")";
    }
    else if (fragment[0] === "[" && fragment[fragment.length - 1] === "]") {
        let bracket_count = 0;
        for (let i = 1; i < fragment.length - 2; i++) {
            if (fragment[i] === "\\") {
                i++;
            }
            //you'll never have a raw [ inside a []
            //else if (fragment[i] === "[") {
            //    bracket_count++;
            //}
            else if (fragment[i] === "]") {
                bracket_count--;
                if (bracket_count === -1) {
                    break;
                }
            }
        }
        return bracket_count === 0 ? fragment : "(?:" + fragment + ")";
    }
    else {
        return "(?:" + fragment + ")";
    }
}
exports.groupIfRequired = groupIfRequired;
/**
 * Checks to see if fragment has a + or * at the end and has a repetition statement
 *
 * @param fragment fragment of regular expression
 * @param repetition repetition that may clobber the fragment
 */
function dontClobberRepetition(fragment, repetition) {
    // + can be ignored as well as a count as long as that count is > 0
    if (fragment.endsWith("+")) {
        switch (repetition) {
            case "*":
                // ignore: + is greater than *
                break;
            case "?":
                // non-greedy qualifier
                fragment += repetition;
                break;
            case "+":
                // ignore: already +
                break;
            default:
                if (repetition.startsWith("{0")) {
                    fragment = "(?:" + fragment + ")" + repetition;
                }
                else {
                    // remove + and replace with count
                    fragment = fragment.substring(0, fragment.length - 1) + repetition;
                }
                break;
        }
    }
    else if (fragment.endsWith("*")) {
        switch (repetition) {
            case "*":
                // ignore: already +
                break;
            case "?":
                // non-greedy qualifier
                fragment += repetition;
                break;
            default:
                // remove * and replace with count
                fragment = fragment.substring(0, fragment.length - 1) + repetition;
                break;
        }
    }
    else {
        fragment += repetition;
    }
    return fragment;
}
exports.dontClobberRepetition = dontClobberRepetition;
