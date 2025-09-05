import { Router } from "express";
import { UserRouters } from "../app/modules/user/user.route";
import { authRouters } from "../app/modules/auth/auth.route";
import { ProductRouters } from "../app/modules/product/product.route";
import { OrderRouters } from "../app/modules/order/order.route";

export const router = Router()

const moduleRoutes = [
    {
        path: '/user',
        route: UserRouters
    },
    {
        path: '/auth',
        route: authRouters
    },
     {
    path: '/products',
    route: ProductRouters,
  },
  {
    path: '/orders',
    route: OrderRouters,
  },
]

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route)
})