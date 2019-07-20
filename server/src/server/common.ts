import { resolve } from 'path'

export class SystemUrlPath {
    static health = '/api/1/health'
    static version = '/api/1/version'
}

export const serverVersion = require(resolve(process.env.NODE_PATH || "", '../package.json')).version