import mongoose from "mongoose";
import Logger from 'bunyan'
import { config } from './config'

const log: Logger = config.createLogger('setupDatabase')

export default () => {
    const connect = () => {
        mongoose.connect(config.DATABASE_URL!)
            .then(() => {
                log.info('链接到数据库')
            })
            .catch((error) => {
                log.error('Error connecting database');
                return process.exit(1)
            })
    }
    connect()

    mongoose.connection.on('disconnected', connect)
}