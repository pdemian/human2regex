/*! Copyright (c) 2021 Patrick Demian; Licensed under MIT */

/**
 * Includes helper functions for the Generator
 * @packageDocumentation
 */

import { first, isSingleRegexCharacter } from "./utilities";

/**
 * Minimizes the match string by finding duplicates or substrings in the array
 * 
 * @param arr the array of matches
 * @internal
 */
export function minimizeMatchString(arr: string[], has_neighbours: boolean = false): string {
    // don't process an array of length 1, otherwise you'll get the wrong result
    if (arr.length === 1) {
        return first(arr);
    }

    return minMatchString(arr, has_neighbours ? 1 : 0);
}

/**
 * Minimizes the match string by finding duplicates or substrings in the array
 * 
 * @param arr the array
 * @param depth must be 0 for initial call
 * @returns an optimized string
 * @internal
 */
function minMatchString(arr: string[], depth: number = 0): string {
    // base case: arr is empty
    if (arr.length === 0) {
        return "";
    }

    // base case: arr has 1 element (must have at least 2, so this means this value is optional)
    if (arr.length === 1) {
        return first(arr) + "?";
    }

    // remove duplicates
    arr = [ ...new Set(arr) ];

    // base case: arr has 1 element (after duplicate removal means this is required)
    if (arr.length === 1) {
        return first(arr);
    }

    // base case: arr is all single letters
    if (arr.every(isSingleRegexCharacter)) {
        return "[" + arr.join("") + "]";
    }

    // now the real magic begins
    // You are not expected to understand this

    let longest_begin_substring = first(arr);
    let longest_end_substring = first(arr);

    for (let i = 1; i < arr.length; i++) {
        // reduce longest_substring to match everything 
        for (let j = 0; j < longest_begin_substring.length; j++) {
            if (arr[i].length < j || longest_begin_substring[j] !== arr[i][j]) {
                longest_begin_substring = longest_begin_substring.substr(0, j);
                break;
            }
        }
        for (let j = 0; j < longest_end_substring.length; j++) {
            if (arr[i].length-j < 0 || longest_end_substring[longest_end_substring.length-j-1] !== arr[i][arr[i].length-j-1]) {
                longest_end_substring = longest_end_substring.substr(longest_end_substring.length-j, longest_end_substring.length);
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

        const similar_matches: string[] = [];
        for (const ele of arr) {
            const match = ele.substring(begin_pos, ele.length-end_pos);
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
export function groupIfRequired(fragment: string): string {
    if (isSingleRegexCharacter(fragment)) {
        return fragment;
    }
    else if ((fragment[fragment.length-1] === "*" || fragment[fragment.length-1] === "+") &&
        isSingleRegexCharacter(fragment.substring(0, fragment.length-1))) {
        return fragment;
    }

    if (fragment[0] === "(" && fragment[fragment.length-1] === ")") {
        let bracket_count = 0;

        for (let i = 1; i < fragment.length-2; i++) {
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
    else if (fragment[0] === "[" && fragment[fragment.length-1] === "]") {
        let bracket_count = 0;

        for (let i = 1; i < fragment.length-2; i++) {
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

/**
 * Checks to see if fragment has a + or * at the end and has a repetition statement
 * 
 * @param fragment fragment of regular expression
 * @param repetition repetition that may clobber the fragment
 */
export function dontClobberRepetition(fragment: string, repetition: string): string {
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
