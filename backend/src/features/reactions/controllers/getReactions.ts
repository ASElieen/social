import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'
import { IReactionDocument } from '../interfaces/reaction.interface'
import { ReactionCache } from '@services/redis/reaction.cache'
import { reactionService } from '@services/db/reaction.service'
import mongoose from 'mongoose'

const reactionCache: ReactionCache = new ReactionCache()

export class GetReaction {
    public async getReactions(req: Request, res: Response): Promise<void> {
        const { postId } = req.params

        const cacheReactions: [IReactionDocument[], number] = await reactionCache.getReactionsFromCache(postId)

        const reactions: [IReactionDocument[], number] = cacheReactions[0].length ? cacheReactions : await reactionService.getPostReactions({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 })

        res.status(HTTP_STATUS.OK).json({ message: '获取心情成功', reactions: reactions[0], count: reactions[1] })
    }

    public async singleReactionByUsername(req: Request, res: Response): Promise<void> {
        const { postId, username } = req.params

        const cacheReaction: [IReactionDocument, number] | [] = await reactionCache.getSingleReactionByUsernameFromCache(postId, username)

        const reactions: [IReactionDocument, number] | [] = cacheReaction.length ? cacheReaction : await reactionService.getSinglePostReactionsByUsername(postId, username)

        res.status(HTTP_STATUS.OK).json({ message: '获取心情成功', reactions: reactions.length ? reactions[0] : [], count: reactions.length ? reactions[1] : [] })
    }
}