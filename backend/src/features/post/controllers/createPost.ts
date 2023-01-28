import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'
import { joiValidation } from '@global/decorators/joiValidationDecorator'
import { postSchema } from '../schemes/post.scheme'
import { ObjectId } from 'mongodb'
import { IPostDocument } from '../interfaces/post.interface'
import { PostCache } from '@services/redis/post.cache'

const postCache: PostCache = new PostCache()

export class Create {
    @joiValidation(postSchema)
    public async post(req: Request, res: Response): Promise<void> {
        const { post, bgColor, privacy, gifUrl, profilePicture, feelings } = req.body
        const postObjectId = new ObjectId()
        const createdPost: IPostDocument = {
            _id: postObjectId,
            userId: req.currentUser!.userId,//只有登录用户才能使用post
            username: req.currentUser!.username,
            email: req.currentUser!.email,
            avatarColor: req.currentUser!.avatarColor,
            profilePicture,
            post,
            bgColor,
            feelings,
            privacy,
            gifUrl,
            commentsCount: 0,
            imgVersion: '',
            imgId: '',
            createdAt: new Date(),
            reactions: {
                like: 0,
                love: 0,
                happy: 0,
                sad: 0,
                wow: 0,
                angry: 0
            }
        } as IPostDocument

        await postCache.savePostToCache({
            key: postObjectId,
            currentUserId: `${req.currentUser!.userId}`,
            uId: `${req.currentUser!.uId}`,
            createdPost
        })

        res.status(HTTP_STATUS.CREATED).json({ message: '已成功创建post请求,数据发布成功' })
    }
}