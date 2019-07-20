import { Config } from '../config/config'
import { Routes } from './routes/routes'
import { baseMiddleware } from './server/middlewares/base'
import { staticServe } from './server/middlewares/static'
import { BootConfigModel, MiddlewareType } from './server/models'
import { Server } from './server/server'

const middlewares: MiddlewareType[] = [baseMiddleware]
middlewares.push(staticServe)

const bootConfig: BootConfigModel = {
    middleware: middlewares,
    routes: [Routes.api],
    serverConfig: Config.server
}

Object.freeze(bootConfig)
let server = new Server(bootConfig)
server.boot()