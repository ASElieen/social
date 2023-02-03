import Logger from 'bunyan'
import { config } from '@root/config'
import { ServerError } from '@global/helpers/errorHandler'
import { BaseCache } from './base.cache'
import { IReactionDocument, IReactions } from '@reaction/interfaces/reaction.interface'


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
                //remove reactions
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
}