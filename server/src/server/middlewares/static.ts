import * as express from 'express'
import { Request, Response } from 'express'
import { resolve } from 'path'

import { Config } from '../../../config/config'

export const staticServe = (app: express.Express) => {
    let staticPath = Config.server.staticPath
    if (!staticPath)
        throw new Error("Missing staticPath in Config.server for customized static routes")


    const pathsWithImmutableContent = [
        '/common/js',
        '/common/fonts',
        '/common/video',
        '/common/img/home',
        '/assets'
    ]

    for (let path of pathsWithImmutableContent) {
        const pathParts = path.split("/").filter(p => p)
        const filePath = resolve(staticPath, ...pathParts)
        //log.debug("path: " + path + ", Filepath: " + filePath)
        app.use(path, express.static(filePath, { maxAge: '1y' }))
    }

    app.use(express.static(staticPath))

    app.use('/', staticFileRoutes(staticPath))
}

const isHtmlRequest = (req: Request): boolean => {
    let accept = req.header("accept")
    return !!accept && accept.includes("text/html")
}

const spaRoute = (appPath: string) => {
    return function (req: Request, res: Response, next: express.NextFunction) {
        if (!isHtmlRequest(req)) {
            //Do nothing and see if some other route matches            
            return next()
        }
        let accept = req.header("accept")
        if (accept && accept.includes("text/html")) {
            res.sendFile("index.html", { root: appPath })
        } else {
            next()
        }
    }
}

export function staticFileRoutes(staticPath: string): express.Router {
    const router = express.Router()

    router.get('/sample/*', spaRoute(staticPath + "/sample"))

    return router
}