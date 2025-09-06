"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderValidation = void 0;
const zod_1 = require("zod");
const order_interface_1 = require("./order.interface");
const orderItemZodSchema = zod_1.z.object({
    productId: zod_1.z.string({ required_error: 'Product ID is required' }),
    quantity: zod_1.z
        .number({ required_error: 'Quantity is required' })
        .int()
        .positive({ message: 'Quantity must be a positive integer' }),
});
const createOrderZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        items: zod_1.z
            .array(orderItemZodSchema)
            .nonempty({ message: 'Order must contain at least one item' }),
        shippingAddress: zod_1.z.string({ required_error: 'Shipping address is required' }),
    }),
});
const updateOrderZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(Object.values(order_interface_1.OrderStatus)),
    }),
});
exports.OrderValidation = {
    createOrderZodSchema,
    updateOrderZodSchema,
};
