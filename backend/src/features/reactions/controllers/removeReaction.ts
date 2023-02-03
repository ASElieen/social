import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'
import { IReactionJob } from '../interfaces/reaction.interface'
import { ReactionCache } from '@services/redis/reaction.cache'
import { reactionQueue } from '@services/queues/reaction.queue'

const reactCache: ReactionCache = new ReactionCache()

export class Remove {
    public async removeReaction(req: Request, res: Response): Promise<void> {
        const { postId, previousReaction, postReaction } = req.params
        await reactCache.removePostReactionFromCache(postId, `${req.currentUser!.username}`, JSON.parse(postReaction))

        const databaseReactionData: IReactionJob = {
            postId,
            userFrom: req.currentUser!.userId,
            username: req.currentUser!.username,
            previousReaction,
        }
        //worker中直接 {data} = job 所以这里可以传整个对象
        //如果是从job.data中解构具体的值 这里要传{key:...,xx:...,xx:...}
        reactionQueue.addReactionJob('removeReactionFromDB', databaseReactionData)

        res.status(HTTP_STATUS.OK).json({ message: '心情移除成功' })
    }
}