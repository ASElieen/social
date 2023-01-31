import { Request, Response } from 'express'
import { PostCache } from '@services/redis/post.cache'
import HTTP_STATUS from 'http-status-codes'
import { postQueue } from '@services/queues/post.queue'
import { socketIOPostObject } from '../../../share/sockets/post'
import { joiValidation } from '@global/decorators/joiValidationDecorator'
import { postSchema } from '../schemes/post.scheme'
import { IPostDocument } from '../interfaces/post.interface'

const postCache: PostCache = new PostCache()

export class Update {
    @joiValidation(postSchema)
    public async post(req: Request, res: Response): Promise<void> {
        const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, profilePicture } = req.body
        const { postId } = req.params
        const updatePost: IPostDocument = {
            post,
            bgColor,
            privacy,
            feelings,
            gifUrl,
            profilePicture,
            imgId,
            imgVersion
        } as IPostDocument

        const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatePost)
        socketIOPostObject.emit('update post', postUpdated, 'posts')
        postQueue.addPostJob('updatePostInDB', { key: postId, value: postUpdated })
        res.status(HTTP_STATUS.OK).json({ message: '更新post数据成功' })
    }
}