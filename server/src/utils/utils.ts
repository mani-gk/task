import { CustomError } from './../error'

//Utils for set operations
//See https://stackoverflow.com/questions/32000374/es6-babel-spread-error-with-set
//WARNING: spread operator doesn't transpile correct with sets
export class SetUtils {
    static union = <T>(...sets: Set<T>[]): Set<T> => {
        let arr = sets
            .map(s => Array.from(s))
            .reduce((accArr, arr) => accArr.concat(arr), [])
        return new Set(arr)
    }

    static intersection = <T>(...sets: Set<T>[]): Set<T> => {
        if (sets.length == 0) return new Set()
        let intersectArr = sets.slice(1).reduce((accArr, set) => accArr.filter(x => set.has(x)), Array.from(sets[0]))
        return new Set(intersectArr)
    }

    static difference = <T>(a: Set<T>, b: Set<T>): Set<T> => new Set(Array.from(a).filter(x => !b.has(x)))

    static areEqual = <T>(...sets: Set<T>[]): boolean => {
        if (sets.length < 1)
            throw new CustomError(`Need at least 2 sets to check if they are equal. Found ${sets.length}`, "INVALID_ARGUMENTS")
        return sets.slice(1).every(set => SetUtils.difference(set, sets[0]).size == 0 && SetUtils.difference(sets[0], set).size == 0)
    }
}