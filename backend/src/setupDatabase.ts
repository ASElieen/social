import mongoose from 'mongoose'
import Logger from 'bunyan'
import { config } from './config'
import { redisConnection } from '@redis/redis.connection'

const log: Logger = config.createLogger('setupDatabase')

export default () => {
    const connect = () => {
        mongoose.connect(config.DATABASE_URL!)
            .then(() => {
                log.info('链接到数据库')
                redisConnection.connect()
            })
            .catch((error) => {
                log.error(`链接到数据库时发生错误:${error}`)
                return process.exit(1)
            })
    }
    connect()

    mongoose.connection.on('disconnected', connect)
}