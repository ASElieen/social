import express, { Router } from 'express'
import { authMiddleware } from '@global/helpers/authMiddleware'
import { Create } from '../controllers/createPost'
import { Get } from '../controllers/getPosts'

class PostRoutes {
    private router: Router

    constructor() {
        this.router = express.Router()
    }

    public routes(): Router {
        this.router.post('/post', authMiddleware.checkAuthentication, Create.prototype.post)
        this.router.post('/post/image', authMiddleware.checkAuthentication, Create.prototype.postWithImage)

        //看到所有post或者图片合集
        this.router.get('/post/all/:page', authMiddleware.checkAuthentication, Get.prototype.posts)
        this.router.get('/post/images/post', authMiddleware.checkAuthentication, Get.prototype.postsWithImages)
        return this.router
    }
}

export const postRoutes: PostRoutes = new PostRoutes()