import { Request, Response } from 'express'
import { config } from '@root/config'
import HTTP_STATUS from 'http-status-codes'
import { authService } from '@services/db/auth.service'
import { BadRequestError } from '@global/helpers/errorHandler'
import { IAuthDocument } from '../interfaces/auth.interface'
import { emailSchema, passwordSchema } from '../schemas/password'
import { joiValidation } from '@global/decorators/joiValidationDecorator'
import crypto from 'crypto'
import { forgotPasswordTemplate } from '@services/emails/templates/forgotPassword/forgotPasswordTem'
import { emailQueue } from '@services/queues/email.queue'
import { IResetPasswordParams } from '@user/userInterfaces/user.interface'
import moment from 'moment'
import publicIP from 'ip'
import { resetPasswordTemplate } from '@services/emails/templates/resetPassword/resetPasswordTem'

export class Password {
    @joiValidation(emailSchema)
    public async create(req: Request, res: Response): Promise<void> {
        const { email } = req.body
        const existingUser: IAuthDocument = await authService.getAuthUserByEmail(email)
        if (!existingUser) {
            throw new BadRequestError('找不到该邮件对应的用户')
        }

        const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20))
        const randomCharacters: string = randomBytes.toString('hex')

        await authService.updatePasswordToken(`${existingUser._id}`, randomCharacters, Date.now() * 60 * 60 * 1000)

        const resetLink = `${config.CLIENT_URL}/resetpassword?token=${randomCharacters}`
        const template: string = forgotPasswordTemplate.passwordResetTemplate(existingUser.username!, resetLink)

        emailQueue.addEmailJob('forgotpasswordEmail', { template, receiverEmail: email, subject: '忘记密码' })

        res.status(HTTP_STATUS.OK).json({ message: '重置密码邮件已经发送' })
    }


    @joiValidation(passwordSchema)
    public async update(req: Request, res: Response): Promise<void> {
        const { password, confirmPassword } = req.body
        const { token } = req.params
        if (password !== confirmPassword) {
            throw new BadRequestError('密码不匹配')
        }

        const existingUser: IAuthDocument = await authService.getAuthUserByPasswordToken(token)
        if (!existingUser) {
            throw new BadRequestError('重置密码token已过期')
        }

        existingUser.password = password
        existingUser.passwordResetExpires = undefined
        existingUser.passwordResetToken = undefined
        await existingUser.save()

        const templateParams: IResetPasswordParams = {
            username: existingUser.username,
            email: existingUser.email,
            ipaddress: publicIP.address(),
            date: moment().format('DD//MM//YYYY HH:mm')
        }


        const template: string = resetPasswordTemplate.passwordResetConfirmTemplate(templateParams)

        emailQueue.addEmailJob('forgotpasswordEmail', { template, receiverEmail: existingUser.email, subject: '密码重置' })

        res.status(HTTP_STATUS.OK).json({ message: '密码已成功重置' })
    }
}
