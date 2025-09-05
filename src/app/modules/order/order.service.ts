import httpStatus from 'http-status-codes';
import mongoose from 'mongoose';
import AppError from '../../errorHelpers/AppError';
import { Product } from '../product/product.model';
import { IOrder, IOrderItem } from './order.interface';
import { Order } from './order.model';

const createOrderIntoDB = async (
  userId: string,
  payload: {
    items: { productId: string; quantity: number }[];
    shippingAddress: string;
  },
): Promise<IOrder> => {
  const productIds = payload.items.map((item) => item.productId);

  // 1. Find all products in the order
  const products = await Product.find({ _id: { $in: productIds } });

  // 2. Check if all products exist and are available
  if (products.length !== productIds.length) {
    throw new AppError(httpStatus.NOT_FOUND, 'One or more products not found');
  }

  let totalAmount = 0;
  const orderItems: IOrderItem[] = [];

  for (const item of payload.items) {
    const product = products.find((p) => p._id.toString() === item.productId);

    if (!product) {
      // This case should ideally not be hit due to the check above, but it's good for safety
      throw new AppError(
        httpStatus.NOT_FOUND,
        `Product with ID ${item.productId} not found`,
      );
    }

    if (!product.availability) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Product "${product.product_title}" is currently unavailable`,
      );
    }

    const price = product.price;
    totalAmount += price * item.quantity;
    orderItems.push({
      productId: new mongoose.Types.ObjectId(item.productId),
      quantity: item.quantity,
      price: price,
    });
  }

  // 3. Create the order
  const newOrder = await Order.create({
    userId: new mongoose.Types.ObjectId(userId),
    items: orderItems,
    totalAmount,
    shippingAddress: payload.shippingAddress,
  });

  return newOrder;
};

const getAllOrdersFromDB = async (userId: string, role: string) => {
  const filter = role === 'USER' ? { userId } : {};
  const result = await Order.find(filter)
    .populate('userId', 'name email')
    .populate('items.productId', 'product_title product_image category')
    .sort('-createdAt');
  return result;
};

const getSingleOrderFromDB = async (
  orderId: string,
): Promise<IOrder | null> => {
  const result = await Order.findById(orderId)
    .populate('userId', 'name email')
    .populate('items.productId');

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }
  return result;
};

const updateOrderStatusInDB = async (
  orderId: string,
  status: string,
): Promise<IOrder | null> => {
  const result = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true, runValidators: true },
  );
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }
  return result;
};

export const OrderServices = {
  createOrderIntoDB,
  getAllOrdersFromDB,
  getSingleOrderFromDB,
  updateOrderStatusInDB,
};

