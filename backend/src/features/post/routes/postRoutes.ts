import express, { Router } from 'express'
import { authMiddleware } from '@global/helpers/authMiddleware'
import { Create } from '../controllers/createPost'
import { Get } from '../controllers/getPosts'
import { Delete } from '../controllers/deletePost'
import { Update } from '../controllers/updatePost'

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

        //删
        this.router.delete('/post/:postId', authMiddleware.checkAuthentication, Delete.prototype.post)

        //更
        //put相比于post 必须存在一个明确的对象
        this.router.put('/post/:postId', authMiddleware.checkAuthentication, Update.prototype.post)
        this.router.put('/post/image/:postId', authMiddleware.checkAuthentication, Update.prototype.postWithImage)
        return this.router
    }
}

export const postRoutes: PostRoutes = new PostRoutes()