import mongoose, { Mongoose } from 'mongoose'

import { DbConfigModel } from '../server/models'

export class MongooseDb {
    static db: Mongoose | undefined
    static database = (username: string, password: string) => {
        return `mongodb+srv://${username}:${password}@stitchdev-bwcmt.mongodb.net/exps?retryWrites=true`
    }

    static async connectDB(options: DbConfigModel) {
        const { username, password, ...remOptions } = options
        try {
            MongooseDb.db = await mongoose.connect(this.database(username, password), remOptions)
            console.log({ message: "Connected to Database (MongoDB) " });
        } catch (e) {
            console.error(`error while connecting to Database (MongoDB)- ${JSON.stringify(e)}`);
            throw e
        }
        return MongooseDb.db
    }
    // Disconnect connection with MongoDB Database
    async disconnectDB() {
        try {
            if (MongooseDb.db) {
                await MongooseDb.db.disconnect()
            }
            console.log("Mongoose default connection disconnected");
        } catch (e) {
            console.error("error while disconnecting to database(MongoDB)")
        }
    }
}