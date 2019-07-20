import express = require('express')
import { Server as HttpServer } from 'http'
import * as request from 'request-promise'

import { MongooseDb } from '../db/connection'
import { SystemUrlPath } from './common'
import { errorMiddleware, notFound404 } from './middlewares/error'
import { BootConfigModel } from './models'

export class Server {
    config: BootConfigModel
    private server?: HttpServer
    private static readonly mongoExitCode = 27017
    constructor(config: BootConfigModel) {
        this.config = config
    }

    static async checkBoot(port: number): Promise<void> {
        await request.get(`http://127.0.0.1:${port}/api/1/health`)
    }

    private listen(app: express.Express, port: number): Promise<HttpServer> {
        return new Promise<HttpServer>((resolve, reject) => {
            const server = app.listen(port, () => {
                Server.checkBoot(port)
                    .then(() => {
                        const message = `Server started..`
                        console.log({ message })
                        return resolve(server)
                    })
                    .catch((err: Error) => {
                        err.message = "Health check failed. " + err.message
                        console.error({ message: err.message })
                        reject(err)
                    })
            })
            server.on('error', err => { reject(err) })
            server.on('listening', () => {
                //Do nothing
            })
        })
    }

    private expressApp = () => {
        const app = express()

        //These are always available and do not go through any middleware
        app.use(SystemUrlPath.health, (req, res) => { res.status(200).send() })
        //Add all the middlewares and routes
        this.config.middleware.forEach(m => m(app, this.config.serverConfig))
        this.config.routes.forEach(r => r(app, this.config.serverConfig))

        const html404Path = this.config.serverConfig.staticPath ? (this.config.serverConfig.staticPath + "/404.html") : undefined
        notFound404(app, html404Path)
        errorMiddleware(app, this.config.serverConfig)

        //Remove the header
        app.disable('x-powered-by')

        return app
    }

    async boot(): Promise<void> {
        const { dbConfig } = this.config.serverConfig
        //Env varibale has first preference
        let httpPort = process.env.PORT || this.config.serverConfig.httpPort
        const message = `Starting server on port ${httpPort}...`
        console.info({ message })
        try {
            await MongooseDb.connectDB(dbConfig)
        } catch (e) {
            const message = "Unable to connect to mongo db " + e.message
            console.error(message)
            //this code means it existed because of mongo issues
            process.exit(Server.mongoExitCode)
        }

        try {
            const app = this.expressApp()
            //TODO
            this.server = await this.listen(app, typeof httpPort == "string" ? parseInt(httpPort) : httpPort)
        } catch (err) {
            const message = `Unable to start server at port ${httpPort}. ${err.message}`
            console.error(message)
            // log.error({ message })
            process.exit(1)
        }
        this.setupSignals()
    }

    setupSignals() {
        process.on('SIGINT', this.sigintListener)
    }

    sigintListener = () => {
        if (MongooseDb.db) {
            MongooseDb.db.connection.close(function () {
                console.log("Database (MongoDB) disconnected through app termination");
                process.exit(0);
            });
        }
    }
}