import { Request, Response } from 'express'
import { config } from '@root/config'
import JWT from 'jsonwebtoken'
import HTTP_STATUS from 'http-status-codes'
import { joiValidation } from '@global/decorators/joiValidationDecorator'
import { authService } from '@services/db/auth.service'
import { BadRequestError } from '@global/helpers/errorHandler'
import { loginSchema } from '../schemas/signin'
import { IAuthDocument } from '../interfaces/auth.interface'

export class SignIn {
    @joiValidation(loginSchema)
    public async read(req: Request, res: Response): Promise<void> {
        const { username, password } = req.body
        const existingUser: IAuthDocument = await authService.getAuthUserByUsername(username)
        if (!existingUser) {
            throw new BadRequestError('无效的用户名')
        }

        const passwordsMatch: boolean = await existingUser.comparePassword(password)
        if (!passwordsMatch) {
            throw new BadRequestError('密码错误 请重试')
        }

        const userJWT: string = JWT.sign({
            userId: existingUser._id,
            uId: existingUser.uId,
            email: existingUser.email,
            username: existingUser.username,
            avatarColor: existingUser.avatarColor
        }, config.JWT_TOKEN!)

        req.session = ({ jwt: userJWT })
        res.status(HTTP_STATUS.OK).json({ message: '登录成功', user: existingUser, token: userJWT })
    }
}