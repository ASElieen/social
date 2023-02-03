import Logger from 'bunyan'
import { config } from '@root/config'
import { ServerError } from '@global/helpers/errorHandler'
import { BaseCache } from './base.cache'
import { Helpers } from '@global/helpers/helpers'
import { IReactionDocument, IReactions } from '@reaction/interfaces/reaction.interface'
import { find } from 'lodash'


const log: Logger = config.createLogger('reactionsCache')

export class ReactionCache extends BaseCache {
    constructor() {
        super('reactionsCache')
    }

    public async savePostReactionsToCache(key: string, reactions: IReactionDocument, postReactions: IReactions, type: string, previousReaction: string): Promise<void> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect()
            }

            if (previousReaction) {
                this.removePostReactionFromCache(key, reactions.username, postReactions)
            }

            if (type) {
                //LPush插入列表头部 (列表名,data)
                await this.client.LPUSH(`reactions:${key}`, JSON.stringify(reactions))
                const dataToSave: string[] = ['reactions', JSON.stringify(postReactions)]
                await this.client.HSET(`posts:${key}`, dataToSave)
            }
        } catch (error) {
            log.error(error)
            throw new ServerError('往redis中存入心情时发生错误')
        }
    }

    public async removePostReactionFromCache(key: string, username: string, postReactions: IReactions): Promise<void> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect()
            }
            // 0 -1返回list所有数据
            const response: string[] = await this.client.LRANGE(`reactions:${key}`, 0, -1)
            const multi: ReturnType<typeof this.client.multi> = this.client.multi()
            const userPreviousReaction: IReactionDocument | undefined = this.getPreviousReaction
                (response, username)
            if (userPreviousReaction) {
                //LREM根据中间参数的值来移除列表中的元素
                multi.LREM(`reactions:${key}`, 1, JSON.stringify(userPreviousReaction))
                await multi.exec()
                const dataToSave: string[] = ['reactions', JSON.stringify(postReactions)]
                await this.client.HSET(`posts:${key}`, dataToSave)
            }
        } catch (error) {
            log.error(error)
            throw new ServerError('往redis中存入心情时发生错误')
        }
    }

    public async getReactionsFromCache(postId: string): Promise<[IReactionDocument[], number]> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect()
            }
            //LLEN返回列表的长度
            const reactionsCount: number = await this.client.LLEN(`reactions:${postId}`)
            const response: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1)
            const list: IReactionDocument[] = []
            for (const item of response) {
                list.push(Helpers.parseJSON(item))
            }
            return response.length ? [list, reactionsCount] : [[], 0]
        } catch (error) {
            log.error(error)
            throw new ServerError('从redis中获取reaction失败(get)')
        }
    }

    public async getSingleReactionByUsernameFromCache(postId: string, username: string): Promise<[IReactionDocument, number] | []> {
        try {
            if (!this.client.isOpen) {
                await this.client.connect()
            }
            const response: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1)
            const list: IReactionDocument[] = []
            for (const item of response) {
                list.push(Helpers.parseJSON(item))
            }
            const result: IReactionDocument = find(list, (listItem: IReactionDocument) => {
                return listItem.postId === postId && listItem.username === username
            }) as IReactionDocument
            return result ? [result, 1] : []
        } catch (error) {
            log.error(error)
            throw new ServerError('从redis中通过username获取reaction失败(get)')
        }
    }

    private getPreviousReaction(res: string[], username: string): IReactionDocument | undefined {
        const list: IReactionDocument[] = []
        for (const item of res) {
            list.push(Helpers.parseJSON(item) as IReactionDocument)
        }
        return find(list, (listItem: IReactionDocument) => {
            return listItem.username === username
        })
    }
}