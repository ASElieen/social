import { BaseCache } from './base.cache'
import Logger from 'bunyan'
import { config } from '@root/config'
import { ServerError } from '@global/helpers/errorHandler'
import { ISavePostToCache } from '@post/interfaces/post.interface'

const log: Logger = config.createLogger('postCache')

export class PostCache extends BaseCache {
    constructor() {
        super('postCache')
    }

    public async savePostToCache(data: ISavePostToCache): Promise<void> {
        const { key, currentUserId, uId, createdPost } = data
        const {
            _id,
            userId,
            username,
            email,
            avatarColor,
            profilePicture,
            post,
            bgColor,
            feelings,
            privacy,
            gifUrl,
            commentsCount,
            imgVersion,
            imgId,
            reactions,
            createdAt
        } = createdPost

        const firstList: string[] = [
            '_id', `${_id}`,
            'userId', `${userId}`,
            'username', `${username}`,
            'email', `${email}`,
            'avatarColor', `${avatarColor}`,
            'profilePicture', `${profilePicture}`,
            'post', `${post}`,
            'bgColor', `${bgColor}`,
            'feelings', `${feelings}`,
            'privacy', `${privacy}`,
            'gifUrl', `${gifUrl}`
        ]

        const secondList: string[] = [
            'commentsCount', `${commentsCount}`,
            'reactions', JSON.stringify(reactions),
            'imgVersion', `${imgVersion}`,
            'imgId', `${imgId}`,
            'createdAt', `${createdAt}`
        ]
        const dataToSave: string[] = [...firstList, ...secondList]

        try {
            if (!this.client.isOpen) {
                await this.client.connect()
            }

            //拿到表中对应字段的值
            const postCount: string[] = await this.client.HMGET(`users:${currentUserId}`, 'postsCount')
            //multi标记事务块的开始 命令会按顺序放入队列中
            const multi: ReturnType<typeof this.client.multi> = this.client.multi()
            multi.ZADD('post', { score: parseInt(uId, 10), value: `${key}` })
            multi.HSET(`posts:${key}`, dataToSave)
            const count: number = parseInt(postCount[0], 10) + 1
            multi.HSET(`users:${currentUserId}`, ['postsCount', count])
            //multi中命令排队等待 exec()后才会执行
            multi.exec()
        } catch (error) {
            log.error(error)
            throw new ServerError('存入redis时发生错误')
        }
    }
}