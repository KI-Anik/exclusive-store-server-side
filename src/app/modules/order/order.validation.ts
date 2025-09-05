import { z } from 'zod';
import { OrderStatus } from './order.interface';

const orderItemZodSchema = z.object({
  productId: z.string({ required_error: 'Product ID is required' }),
  quantity: z
    .number({ required_error: 'Quantity is required' })
    .int()
    .positive({ message: 'Quantity must be a positive integer' }),
});

const createOrderZodSchema = z.object({
  body: z.object({
    items: z
      .array(orderItemZodSchema)
      .nonempty({ message: 'Order must contain at least one item' }),
    shippingAddress: z.string({ required_error: 'Shipping address is required' }),
  }),
});

const updateOrderZodSchema = z.object({
  body: z.object({
    status: z.enum(Object.values(OrderStatus) as [string, ...string[]]),
  }),
});

export const OrderValidation = {
  createOrderZodSchema,
  updateOrderZodSchema,
};
