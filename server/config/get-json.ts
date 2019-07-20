import { readFileSync } from 'fs'
import { resolve } from 'path'
import stripComments from 'strip-json-comments'

export const getJson = <T>(filePath: string): T => {
    filePath = resolve(filePath)
    let str
    try {
        str = readFileSync(filePath).toString()
    } catch (e) {
        throw new Error(`Error reading JSON file from ${filePath}`)
    }

    let out: T
    try {
        out = JSON.parse(stripComments(str))
    } catch (e) {
        throw new Error(`Error parsing JSON ${str} from ${filePath} ${e.message}`)
    }
    return out
}

