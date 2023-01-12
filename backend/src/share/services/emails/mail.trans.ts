import nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import Logger from 'bunyan'
import sendGridMail from '@sendgrid/mail'
import { config } from '@root/config'
import { BadRequestError } from '@global/helpers/errorHandler'


interface IMailOptions {
    from: string;
    to: string;
    subject: string;
    html: string
}

const log: Logger = config.createLogger('mailOptions')
sendGridMail.setApiKey(config.SENDGRID_API_KEY!)

class MailTransport {
    public async sendEmail(receiverEmail: string, subject: string, body: string): Promise<void> {
        if (config.NODE_ENV === 'test' || config.NODE_ENV === 'development') {
            this.developmentEmailSender(receiverEmail, subject, body)
        } else {
            this.productionEmailSender(receiverEmail, subject, body)
        }
    }

    private async developmentEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
        // create reusable transporter object using the default SMTP transport
        const transporter: Mail = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: config.SENDER_EMAIL, // generated ethereal user
                pass: config.SENDER_EMAIL_PASSWORD, // generated ethereal password
            },
        })

        const mailOptions: IMailOptions = {
            from: `MyApp <${config.SENDER_EMAIL}>`,
            to: receiverEmail,
            subject,
            html: body
        }

        // send mail with defined transport object
        try {
            await transporter.sendMail(mailOptions)
            log.info('邮件发送成功(dev)')
        } catch (error) {
            log.error('邮件发送出现错误', error)
            throw new BadRequestError('邮件发送出现错误')
        }
    }

    private async productionEmailSender(receiveEmail: string, subject: string, body: string): Promise<void> {
        const mailOptions: IMailOptions = {
            from: `MyApp <${config.SENDER_EMAIL}>`,
            to: receiveEmail,
            subject,
            html: body
        }

        try {
            await sendGridMail.send(mailOptions)
            log.info('邮件发送成功(prod)')
        } catch (error) {
            log.error('邮件发送出现错误')
            throw new BadRequestError('邮件发送出现错误')
        }
    }
}

export const mailTransport: MailTransport = new MailTransport()
