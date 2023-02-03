import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from 'http-status-codes'
import { joiValidation } from '@global/decorators/joiValidationDecorator'
import { addReactionSchema } from '../schemes/reactions'
import { IReactionDocument, IReactionJob } from '../interfaces/reaction.interface'
import { ReactionCache } from '@services/redis/reaction.cache'
import { reactionQueue } from '@services/queues/reaction.queue'

const reactCache: ReactionCache = new ReactionCache()

export class Add {
    @joiValidation(addReactionSchema)
    public async reaction(req: Request, res: Response): Promise<void> {
        const { userTo, postId, type, previousReaction, postReaction, profilePicture } = req.body
        const reactionObject: IReactionDocument = {
            _id: new ObjectId(),
            postId,
            type,
            avataColor: req.currentUser!.avatarColor,
            username: req.currentUser!.username,
            profilePicture
        } as IReactionDocument

        await reactCache.savePostReactionsToCache(postId, reactionObject, postReaction, type, previousReaction)

        const databaseReactionData: IReactionJob = {
            postId,
            userTo,
            userFrom: req.currentUser!.userId,
            username: req.currentUser!.username,
            type,
            previousReaction,
            reactionObject
        }
        //worker中直接 {data} = job 所以这里可以传整个对象
        //如果是从job.data中解构具体的值 这里要传{key:...,xx:...,xx:...}
        reactionQueue.addReactionJob('addReactionToDB', databaseReactionData)

        res.status(HTTP_STATUS.OK).json({ message: '心情添加成功' })
    }
}