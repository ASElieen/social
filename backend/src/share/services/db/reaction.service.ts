import { IReactionJob } from '@root/features/reactions/interfaces/reaction.interface'
import { UserCache } from '@services/redis/user.cache'
import { ReactionModel } from '@root/features/reactions/models/reaction.schema'
import { PostModel } from '@root/features/post/models/post.schema'

const userCache: UserCache = new UserCache()

class ReactionService {
    public async addReactionDataToDB(reactionData: IReactionJob): Promise<void> {
        const { postId, userTo, userFrom, username, type, previousReaction, reactionObject } = reactionData

        const updateReaction = await Promise.all([
            userCache.getUserFromCache(`${userTo}`),
            //upsert在匹配不到的时候会自动创建这个reactionObject
            ReactionModel.replaceOne({ postId, type: previousReaction, username }, reactionObject, { upsert: true }),
            //new true返回更新后的数据
            PostModel.findOneAndUpdate(
                { _id: postId },
                {
                    $inc: {
                        [`reactions.${previousReaction}`]: -1,
                        [`reactions.${type}`]: 1
                    }
                },
                { new: true }
            )
        ])
    }

    public async removeReactionDataFromDB(reactionData: IReactionJob): Promise<void> {
        const { postId, previousReaction, username } = reactionData
        await Promise.all([
            ReactionModel.deleteOne({ postId, type: previousReaction, username }),
            PostModel.updateOne(
                { _id: postId },
                {
                    $inc: {
                        [`reactions.${previousReaction}`]: -1
                    }
                },
                { new: true }
            )
        ])
    }
}

export const reactionService: ReactionService = new ReactionService()