import { Application } from 'express'
import { authRoutes } from './features/auth/routes/authRoutes'
import { serverAdapter } from '@services/queues/base.queue'
import { currentUserRoute } from './features/auth/routes/currentRoute'
import { authMiddleware } from '@global/helpers/authMiddleware'
import { postRoutes } from './features/post/routes/postRoutes'

const BASE_PATH = '/api/v1'

export default (app: Application): void => {
    const routes = (): void => {
        app.use('/queues', serverAdapter.getRouter())
        app.use(BASE_PATH, authRoutes.routes())
        app.use(BASE_PATH, authRoutes.signOutRoute())

        app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoute.routes())
        app.use(BASE_PATH, authMiddleware.verifyUser, postRoutes.routes())
    }
    routes()
}