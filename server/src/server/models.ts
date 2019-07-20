import express = require('express')

export type MiddlewareType = (app: express.Express, config: ServerConfigModel) => void
export type RouteType = (app: express.Application, config: ServerConfigModel) => void
export interface BootConfigModel {
    serverConfig: ServerConfigModel
    middleware: MiddlewareType[]
    routes: RouteType[]
}
export interface DbConfigModel {
    username: string
    password: string
    useNewUrlParser: boolean
    reconnectTries?: number
    reconnectInterval: number
    poolSize: number,
    bufferMaxEntries: number
    connectTimeoutMS: number
    socketTimeoutMS: number
}
export interface ServerConfigModel {
    httpPort: number
    staticPath?: string
    dbConfig: DbConfigModel
}