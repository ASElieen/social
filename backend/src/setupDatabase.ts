import mongoose from "mongoose";
import { config } from './config'

export default () => {
    const connect = () => {
        mongoose.connect(config.DATABASE_URL!)
            .then(() => {
                console.log('链接到数据库')
            })
            .catch((error) => {
                console.log('Error connecting database');
                return process.exit(1)
            })
    }
    connect()

    mongoose.connection.on('disconnected', connect)
}