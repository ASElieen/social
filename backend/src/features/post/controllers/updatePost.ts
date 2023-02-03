import { Request, Response } from 'express'
import { PostCache } from '@services/redis/post.cache'
import HTTP_STATUS from 'http-status-codes'
import { postQueue } from '@services/queues/post.queue'
import { socketIOPostObject } from '../../../share/sockets/post'
import { joiValidation } from '@global/decorators/joiValidationDecorator'
import { postSchema, postWithImageSchema } from '../schemes/post.scheme'
import { IPostDocument } from '../interfaces/post.interface'
import { UploadApiResponse } from 'cloudinary'
import { uploads } from '@global/helpers/cloudinaryUpload'
import { BadRequestError } from '@global/helpers/errorHandler'


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

    @joiValidation(postWithImageSchema)
    public async postWithImage(req: Request, res: Response): Promise<void> {
        const { imgId, imgVersion } = req.body
        if (imgId && imgVersion) {
            this.updatePostWithImage(req)
        } else {
            const result: UploadApiResponse = await this.addImageToExistingPost(req)
            if (!result.public_id) {
                throw new BadRequestError(result.message)
            }
        }

        res.status(HTTP_STATUS.OK).json({ message: 'post:更新图片数据成功' })
    }

    private async updatePostWithImage(req: Request): Promise<void> {
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
    }

    private async addImageToExistingPost(req: Request): Promise<UploadApiResponse> {
        const { post, bgColor, feelings, privacy, gifUrl, profilePicture, image } = req.body
        const { postId } = req.params
        const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse

        //cloudinary uploadApi类型中是resolve(error) 所以直接return
        if (!result?.public_id) return result

        const updatePost: IPostDocument = {
            post,
            bgColor,
            privacy,
            feelings,
            gifUrl,
            profilePicture,
            imgId: result.public_id,
            imgVersion: result.version.toString()
        } as IPostDocument

        const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatePost)
        socketIOPostObject.emit('update post', postUpdated, 'posts')
        postQueue.addPostJob('updatePostInDB', { key: postId, value: postUpdated })

        return result
    }
}