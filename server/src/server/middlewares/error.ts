import { ErrorRequestHandler, Express } from 'express'
import { statSync } from 'fs'
import { pick } from 'lodash'

import { isProd } from '../../env'
import { SetUtils } from '../../utils/utils'
import { ServerConfigModel } from '../models'
import { CustomError, CustomErrorCode } from './../../error'

const clientErrorCodes = new Set<CustomErrorCode>(["INVALID_PARAMS", "MISSING_DATA", "INVALID_DATA", "MISSING_PARAMS", "UNSUPPORTED_ARGUMENTS", "INVALID_ARGUMENTS"])

const is400 = (gErr: CustomError) => SetUtils.intersection(clientErrorCodes, new Set(gErr.errorCodes)).size > 0
const is401 = (gErr: CustomError) => gErr.errorCodes.indexOf("UNAUTHORIZED") != -1
const is403 = (gErr: CustomError) => gErr.errorCodes.indexOf("FORBIDDEN") != -1

const getHttpStatus = (gErr: CustomError) => {
    if (is401(gErr)) { return 401 }
    else if (is403(gErr)) { return 403 }
    else if (gErr.httpStatus) { return gErr.httpStatus }
    else if (is400(gErr)) { return 400 }
    else { return 500 }
}

export const errorMiddleware = (app: Express, config: ServerConfigModel) => {
    const errorReqHandler: ErrorRequestHandler = (err, req, res, next) => {
        let genErr: CustomError
        if (err instanceof CustomError) {
            genErr = err
        } else {
            genErr = new CustomError(JSON.stringify(err), "UNKNOWN_ERROR")
        }
        const fieldsToPick = ["message", "errorCodes"]
        if (!isProd) { fieldsToPick.push("stack") }
        const sendObj = pick(genErr, fieldsToPick)
        const status = getHttpStatus(genErr)
        res.status(status).send(sendObj)
    }

    app.use(errorReqHandler)
}

export const notFound404 = (app: Express, html404Path: string | undefined) => {
    app.use((req, res, next) => {
        res.status(404)
        const message = "Not Found"
        const sendText404 = () => res.send(message)
        const sendHtml404 = () => {
            if (!html404Path) {
                return sendText404()
            }
            try {
                statSync(html404Path)
            } catch (e) { html404Path = undefined }

            return html404Path ? res.sendFile(html404Path) : sendText404()
        }
        const sendJson404 = () => res.send({ message: message })
        res.format({
            'text/plain': sendText404,
            'text/html': sendHtml404,
            'html': sendHtml404,
            'application/json': sendJson404,
            'json': sendJson404,
            'default': () => res.status(406).send('Not Acceptable') // log the request and respond with 406
        })
    })
}