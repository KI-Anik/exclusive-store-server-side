import { Router } from "express";
import { UserRouters } from "../app/modules/user/user.route";
import { authRouters } from "../app/modules/auth/auth.route";

export const router = Router()

const moduleRoutes = [
    {
        path: '/user',
        route: UserRouters
    },
    {
        path: '/auth',
        route: authRouters
    }
]

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route)
})