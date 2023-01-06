import { Request, Response, NextFunction } from 'express'
import JWT from 'jsonwebtoken'
import { config } from '@root/config'
import { NotAuthorizedError } from './errorHandler'
import { AuthPayload } from '@auth/interfaces/auth.interface'

export class AuthMiddleware {
    public verifyUser(req: Request, res: Response, next: NextFunction): void {
        if (!req.session?.jwt) {
            throw new NotAuthorizedError('无效的token 请重新登录')
        }

        try {
            const payload: AuthPayload = JWT.verify(req.session?.jwt, config.JWT_TOKEN!) as AuthPayload
            req.currentUser = payload
        } catch (error) {
            throw new NotAuthorizedError('无效的token 请重新登录')
        }
        next()
    }

    public checkAuthentication(req: Request, res: Response, next: NextFunction): void {
        if (!req.currentUser) {
            throw new NotAuthorizedError('该访问需要登录')
        }
        next()
    }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware()