import { ObjectId } from 'mongodb'
import { Request, Response } from 'express'
import { joiValidation } from '@global/decorators/joiValidationDecorator'
import { signupSchema } from '../schemas/signup'
import { IAuthDocument, ISignUpData } from '../interfaces/auth.interface'
import { authService } from '../../../share/services/db/auth.service'
import { BadRequestError } from '@helpers/errorHandler'
import { Helpers } from '@global/helpers/helpers'
import { UploadApiResponse } from 'cloudinary'
import { uploads } from '@helpers/cloudinaryUpload'
import HTTP_STATUS from 'http-status-codes'
import { IUserDocument } from '@user/userInterfaces/user.interface'
import { UserCache } from '@services/redis/user.cache'
import { config } from '@root/config'
import { omit } from 'lodash'
import { authQueue } from '@services/queues/auth.queue'

const userCache: UserCache = new UserCache()

export class SignUp {
    @joiValidation(signupSchema)
    public async create(req: Request, res: Response): Promise<void> {
        const { username, email, password, avatarColor, avatarImage } = req.body

        const checkUserIfExists: IAuthDocument = await authService.getUserByUsernameOrEmail(username, email)

        if (checkUserIfExists) {
            throw new BadRequestError('无效的请求')
        }

        const authObjectID: ObjectId = new ObjectId()
        const userObjectID: ObjectId = new ObjectId()
        const uId = `${Helpers.generateRandomIntegers(12)}`
        const authData: IAuthDocument = SignUp.prototype.signUpData({
            _id: authObjectID,
            uId,
            username,
            email,
            password,
            avatarColor
        })
        //始终保持publicId为userObjectID，并且不被覆盖
        const result: UploadApiResponse = await uploads(avatarImage, `${userObjectID}`, true, true) as UploadApiResponse
        if (!result?.public_id) {
            throw new BadRequestError('文件上传失败,发生了某些错误,请重试')
        }

        //redis cache
        const userDataForCache: IUserDocument = SignUp.prototype.userData(authData, userObjectID)
        userDataForCache.profilePicture = `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${result.version}/${userObjectID}`
        await userCache.saveUserToCache(`${userObjectID}`, uId, userDataForCache)

        //database
        //删掉数组里对应的数据
        omit(userDataForCache, ['uId', 'username', 'email', 'avatarColor', 'password'])
        authQueue.addAuthUserJob('addAuthUserToDB', { value: userDataForCache })

        res.status(HTTP_STATUS.CREATED).json({ message: 'User created successfully', authData })
    }

    private signUpData(data: ISignUpData): IAuthDocument {
        const { _id, username, uId, email, password, avatarColor } = data
        return {
            _id,
            uId,
            username: Helpers.firstLetterUppercase(username),
            email: Helpers.lowerCase(email),
            password,
            avatarColor,
            createdAt: new Date()
        } as IAuthDocument
    }

    private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
        const { _id, username, email, uId, password, avatarColor } = data
        return {
            _id: userObjectId,
            authId: _id,
            uId,
            username: Helpers.firstLetterUppercase(username),
            email,
            password,
            avatarColor,
            profilePicture: '',
            blocked: [],
            blockedBy: [],
            work: '',
            location: '',
            school: '',
            quote: '',
            bgImageVersion: '',
            bgImageId: '',
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,
            notifications: {
                messages: true,
                reactions: true,
                comments: true,
                follows: true
            },
            social: {
                facebook: '',
                instagram: '',
                twitter: '',
                youtube: ''
            }
        } as unknown as IUserDocument
    }
}