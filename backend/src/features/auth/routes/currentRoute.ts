import { CurrentUser } from '../controllers/currentUser'
import express, { Router } from 'express'

class CurrentUserRoutes {
    private router: Router

    constructor() {
        this.router = express.Router()
    }

    public routes(): Router {
        this.router.get('/currentuser', CurrentUser.prototype.read)
        return this.router
    }
}

export const currentUserRoute: CurrentUserRoutes = new CurrentUserRoutes()