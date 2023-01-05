import { DoneCallback, Job } from 'bull'
import Logger from 'bunyan'
import { config } from '@root/config'
import { authService } from '@services/db/auth.service'

const log: Logger = config.createLogger('authWorker')

class AuthWorker {
    async addAuthUserToDB(job: Job, done: DoneCallback): Promise<void> {
        try {
            //拿到value
            //authQueue.addAuthUserJob('addAuthUserToDB', { value: userDataForCache })
            const { value } = job.data
            await authService.createAuthUser(value)
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

export const authWorker: AuthWorker = new AuthWorker()