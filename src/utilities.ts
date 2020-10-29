/*! Copyright (c) 2020 Patrick Demian; Licensed under MIT */

/* eslint-disable no-bitwise */
export function hasFlag(a: number, b: number) : boolean {
    return (a & b) !== 0;
}

export function combineFlags(a: number, b: number): number {
    return (a | b);
}
/* eslint-enable no-bitwise */

export function last<T>(array: T[]) : T {
    return array[array.length-1];
}

export function findLastIndex<T>(array: T[], value: T) : number {
    for (let index = array.length-1; index >= 0; index--) {
        if (array[index] === value) {
            return index;
        }
    }
    return -1;
}

export function findLastIndexPredicate<T>(array: T[], predicate: (x: T) => boolean): number {
    for (let index = array.length-1; index >= 0; index--) {
        if (predicate(array[index])) {
            return index;
        }
    }
    return -1;
}

export function removeQuotes(input: string): string {
    return input.substring(1, input.length-2);
}

export function regexEscape(input: string) : string {
    return input.replace("\\", "\\\\").replace(/(\.\[\]\^\-\|\(\)\*\+\?\{\}\$)/, "\\$1");
}
