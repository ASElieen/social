import { DoneCallback, Job } from 'bull'
import Logger from 'bunyan'
import { config } from '@root/config'
import { mailTransport } from '@services/emails/mail.trans'

const log: Logger = config.createLogger('emailWorker')

class EmailWorker {
    async addNotificationEmail(job: Job, done: DoneCallback): Promise<void> {
        try {
            const { template, receiverEmail, subject } = job.data
            console.log('1111')
            await mailTransport.sendEmail(receiverEmail, subject, template)
            //向外部提供进度信息
            job.progress(100)
            //null or error
            done(null, job.data)
        } catch (error) {
            log.error(error)
            done(error as Error)
        }
    }
}

export const emailWorker: EmailWorker = new EmailWorker()