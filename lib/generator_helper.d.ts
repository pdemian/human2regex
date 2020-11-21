/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */
/**
 * Minimizes the match string by finding duplicates or substrings in the array
 *
 * @param arr the array of matches
 * @internal
 */
export declare function minimizeMatchString(arr: string[]): string;
/**
 * Groups a regex fragment if it needs to be grouped
 *
 * @param fragment fragment of regular expression to potentially group
 * @returns a non-capturing group if there needs to be one
 * @internal
 */
export declare function groupIfRequired(fragment: string): string;
