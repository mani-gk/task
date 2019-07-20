import bodyParser = require('body-parser')
import cookieParser = require('cookie-parser')
import { Express } from 'express'
import logger from 'morgan'

export const baseMiddleware = (app: Express) => {
    app.use(logger("dev"));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
}