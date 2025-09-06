"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const user_route_1 = require("../app/modules/user/user.route");
const auth_route_1 = require("../app/modules/auth/auth.route");
const product_route_1 = require("../app/modules/product/product.route");
const order_route_1 = require("../app/modules/order/order.route");
exports.router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: '/user',
        route: user_route_1.UserRouters
    },
    {
        path: '/auth',
        route: auth_route_1.authRouters
    },
    {
        path: '/products',
        route: product_route_1.ProductRouters,
    },
    {
        path: '/orders',
        route: order_route_1.OrderRouters,
    },
];
moduleRoutes.forEach((route) => {
    exports.router.use(route.path, route.route);
});
