import { BaseCache } from './base.cache'
import Logger from 'bunyan'
import { config } from '@root/config'
import { ServerError } from '@global/helpers/errorHandler'
import { ISavePostToCache } from '@post/interfaces/post.interface'
import { IPostDocument, IReactions } from '@post/interfaces/post.interface'
import { Helpers } from '@global/helpers/helpers'
import { RedisCommandRawReply } from '@redis/client/dist/lib/commands'


const log: Logger = config.createLogger('postCache')

export type PostCacheMultiType = string | number | Buffer | RedisCommandRawReply[] | IPostDocument | IPostDocument[]

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

    public async getPostsFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect()
            }
            //返回下标区间内的有序集合成员
            const reply: string[] = await this.client.ZRANGE(key, start, end, { REV: true })
            //Hgetall返回一条完整hash 需要全部hash的话得用multi
            const multi: ReturnType<typeof this.client.multi> = this.client.multi()
            for (const value of reply) {
                multi.HGETALL(`posts:${value}`)
            }
            const replies: PostCacheMultiType = await multi.exec() as PostCacheMultiType
            const postReplies: IPostDocument[] = []
            for (const post of replies as IPostDocument[]) {
                post.commentsCount = Helpers.parseJSON(`${post.commentsCount}`) as number
                post.reactions = Helpers.parseJSON(`${post.reactions}`) as IReactions
                post.createdAt = new Date(Helpers.parseJSON(`${post.createdAt}`)) as Date
                postReplies.push(post)
            }

            return postReplies
        } catch (error) {
            log.error(error)
            throw new ServerError('从redis中取出post数据时发生错误')
        }

    }
}