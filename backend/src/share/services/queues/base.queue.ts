import Queue, { Job } from 'bull'
import Logger from 'bunyan'
import { createBullBoard, BullAdapter, ExpressAdapter } from '@bull-board/express'
import { config } from '@root/config'
import { IAuthJob } from '@auth/interfaces/auth.interface'

type IBaseJobData = IAuthJob

let bullAdapters: BullAdapter[] = []

export let serverAdapter: ExpressAdapter

export abstract class BaseQueue {
    queue: Queue.Queue
    log: Logger

    constructor(queueName: string) {
        this.queue = new Queue(queueName, `${config.REDIS_HOST}`)
        bullAdapters.push(new BullAdapter(this.queue))
        //去下重
        bullAdapters = [...new Set(bullAdapters)]
        serverAdapter = new ExpressAdapter()
        serverAdapter.setBasePath('/queues')

        createBullBoard({
            queues: bullAdapters,
            serverAdapter
        })

        this.log = config.createLogger(`${queueName}Queue`)

        this.queue.on('completed', (job: Job): void => {
            job.remove()
        })
        this.queue.on('global:completed', (jobId: string): void => {
            this.log.info(`Job ${jobId} completed`)
        })
        this.queue.on('global:stalled', (jobId: string): void => {
            this.log.info(`Job ${jobId} is stalled`)
        })
    }

    protected addJob(name: string, data: IBaseJobData): void {
        this.queue.add(name, data, { attempts: 3, backoff: { type: 'fixed', delay: 5000 } })
    }

    //concurrency 一次放入队列的数量 比如为5 20个任务 5555
    protected processJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<void>): void {
        this.queue.process(name, concurrency, callback)
    }
}