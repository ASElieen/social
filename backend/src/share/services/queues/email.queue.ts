import { BaseQueue } from './base.queue'
import { IEmailJob } from '@user/userInterfaces/user.interface'
import { emailWorker } from '@workers/email.worker'

class EmailQueue extends BaseQueue {
    constructor() {
        super('emails')
        this.processJob('forgotpasswordEmail', 5, emailWorker.addNotificationEmail)
    }

    public addEmailJob(name: string, data: IEmailJob): void {
        this.addJob(name, data)
    }
}

export const emailQueue: EmailQueue = new EmailQueue()