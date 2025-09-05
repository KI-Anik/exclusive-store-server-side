import { model, Schema } from 'mongoose';
import { IOrder, IOrderItem, OrderStatus } from './order.interface';

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Order = model<IOrder>('Order', orderSchema);

