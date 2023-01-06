import { BaseCache } from './base.cache'
import { IUserDocument } from '@user/userInterfaces/user.interface'
import Logger from 'bunyan'
import { config } from '@root/config'
import { ServerError } from '@helpers/errorHandler'

const log: Logger = config.createLogger('redisConnection')

export class UserCache extends BaseCache {
    constructor() {
        super('userCache')
    }

    public async saveUserToCache(key: string, userUId: string, createUser: IUserDocument): Promise<void> {
        const createdAt: Date = new Date()
        const {
            _id,
            uId,
            username,
            email,
            avatarColor,
            blocked,
            blockedBy,
            postsCount,
            profilePicture,
            followersCount,
            followingCount,
            notifications,
            work,
            location,
            school,
            quote,
            bgImageId,
            bgImageVersion,
            social
        } = createUser

        const firstLists: string[] = [
            '_id', `${_id}`,
            'uId', `${uId}`,
            'username', `${username}`,
            'email', `${email}`,
            'avatarColor', `${avatarColor}`,
            'postsCount', `${postsCount}`,
            'createdAt', `${createdAt}`
        ]

        const secondList: string[] = [
            'blocked', JSON.stringify(blocked),
            'blockedBy', JSON.stringify(blockedBy),
            'profilePicture', `${profilePicture}`,
            'followersCount', `${followersCount}`,
            'followingCount', `${followingCount}`,
            'notifications', JSON.stringify(notifications),
            'social', JSON.stringify(social)
        ]

        const thirdList: string[] = [
            'work', `${work}`,
            'location', `${location}`,
            'school', `${school}`,
            'quote', `${quote}`,
            'bgImageId', `${bgImageId}`,
            'bgImageVersion', `${bgImageVersion}`,
        ]

        const dataToSave: string[] = [...firstLists, ...secondList, ...thirdList]

        try {
            if (!this.client.isOpen) {
                await this.client.connect()
            }
            await this.client.ZADD('user', { score: parseInt(userUId, 10), value: `${key}` })
            await this.client.HSET(`users:${key}`, dataToSave)

        } catch (error) {
            log.error(error)
            throw new ServerError('服务器错误 再试一次')
        }
    }
}