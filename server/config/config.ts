import { ServerConfigModel } from '../src/server/models'
import { getJson } from './get-json'

export class Config {
    private static readonly config = (): ServerConfigModel => {
        const configFile = process.argv.filter(param =>
            param.trim().startsWith("config=") &&
            param.trim().endsWith(".json"))[0]

        if (configFile) {
            return getJson<ServerConfigModel>(configFile.replace("config=", "").trim())
        }
        switch (process.env.NODE_ENV) {
            case "development":
                return getJson<ServerConfigModel>("./server-dev-config.json")
            case "production":
                return getJson<ServerConfigModel>("./server-config.json")
            default:
                throw new Error("Unknown node environment. Must be test, development or production")
        }
    }

    static readonly server: ServerConfigModel = Config.config()
}