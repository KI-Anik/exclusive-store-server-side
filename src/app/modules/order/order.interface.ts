import { Types } from 'mongoose';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

export interface IOrderItem {
  productId: Types.ObjectId;
  quantity: number;
  price: number; // Price at the time of order
}

export interface IOrder {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  shippingAddress: string;
  status: OrderStatus;
}
