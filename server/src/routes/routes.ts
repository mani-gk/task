import { Application, Router } from 'express'
import { Movies } from '../db/Schema/movie'
import { ServerConfigModel } from '../server/models'
import { MongooseDb } from './../db/connection'
import { CustomError } from './../error'

export const v1Url = (path: string) => `/api/v1/${path}`

export class Routes {
    static api(app: Application, config: ServerConfigModel) {
        Routes.classAnalyticsApp(app, config)
    }
    static classAnalyticsApp(app: Application, config: ServerConfigModel) {
        app.use(v1Url("movies"), moviesRouter(config))
    }
}

export const moviesRouter = (config: ServerConfigModel) => {
    const router = Router()
    const favorites = ["Sandra Bullock", "Tom Hanks", "Julia Roberts", "Kevin Spacey", "George Clooney"]
    router.get("/", async function (req, res, next) {
        if (MongooseDb.db) {
            Movies.aggregate([
                { $match: { countries: "USA", "tomatoes.viewer.rating": { $not: { $lt: 3 } } } },
                {
                    "$addFields": {
                        "favs_list": {
                            $filter: {
                                "input": "$cast", as: "c", "cond": { "$in": ["$$c", favorites] }
                            }
                        }
                    }
                },
                {
                    $project: {
                        title: 1, cast: 1, year: 1, countries: 1,
                        num_favs: {
                            $cond: {
                                if: { $isArray: "$favs_list" }, then: { $size: "$favs_list" }, else: 0
                            }
                        }
                    }
                }, {
                    $sort: { num_favs: -1 }
                }
            ]).exec((err, docs) => {
                if (err) {
                    return next(new CustomError(JSON.stringify(err), "UNCLASSIFIED"));
                }
                //TODO
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.send(docs);
            });

        }
    })
    return router
}