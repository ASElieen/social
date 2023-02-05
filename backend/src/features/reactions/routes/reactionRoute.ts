import express, { Router } from 'express'
import { authMiddleware } from '@global/helpers/authMiddleware'
import { Add } from '../controllers/addReactions'
import { Remove } from '../controllers/removeReaction'
import { GetReaction } from '../controllers/getReactions'

class ReactionRoutes {
    private router: Router
    constructor() {
        this.router = express.Router()
    }
    public routes(): Router {
        this.router.post('/post/reaction', authMiddleware.checkAuthentication, Add.prototype.reaction)

        this.router.delete('/post/reaction/:postId/:previousReaction:postReaction', authMiddleware.checkAuthentication, Remove.prototype.removeReaction)

        this.router.get('/post/reactions/:postId', authMiddleware.checkAuthentication, GetReaction.prototype.getReactions)
        this.router.get('/post/single/reaction/username/:username/:postId', authMiddleware.checkAuthentication, GetReaction.prototype.getSingleReactionByUsername)
        this.router.get('/post/reactions/username/:username', authMiddleware.checkAuthentication, GetReaction.prototype.getAllReactionsByUsername)

        return this.router
    }
}

export const reactionRoutes: ReactionRoutes = new ReactionRoutes()