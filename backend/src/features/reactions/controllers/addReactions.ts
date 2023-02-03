import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from 'http-status-codes'
import { joiValidation } from '@global/decorators/joiValidationDecorator'
import { addReactionSchema } from '../schemes/reactions'
import { IReactionDocument } from '../interfaces/reaction.interface'
import { ReactionCache } from '@services/redis/reaction.cache'

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

        res.status(HTTP_STATUS.OK).json({ message: '心情添加成功' })
    }
}