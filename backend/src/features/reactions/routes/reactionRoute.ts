import express, { Router } from 'express'
import { authMiddleware } from '@global/helpers/authMiddleware'
import { Add } from '../controllers/addReactions'
import { Remove } from '../controllers/removeReaction'

class ReactionRoutes {
    private router: Router
    constructor() {
        this.router = express.Router()
    }
    public routes(): Router {
        this.router.post('/post/reaction', authMiddleware.checkAuthentication, Add.prototype.reaction)

        this.router.delete('/post/reaction/:postId/:previousReaction:postReaction', authMiddleware.checkAuthentication, Remove.prototype.removeReaction)

        return this.router
    }
}

export const reactionRoutes: ReactionRoutes = new ReactionRoutes()