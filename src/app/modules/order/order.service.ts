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
  // Start a Mongoose session for transaction
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const productIds = payload.items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } }).session(
      session,
    );

    if (products.length !== productIds.length) {
      throw new AppError(httpStatus.NOT_FOUND, 'One or more products not found');
    }

    let totalAmount = 0;
    const orderItems: IOrderItem[] = [];

    for (const item of payload.items) {
      const product = products.find((p) => p._id.toString() === item.productId);

      if (!product) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          `Product with ID ${item.productId} not found`,
        );
      }

      // Check for availability and stock
      if (!product.availability || product.quantityInStock < item.quantity) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Product "${product.product_title}" is out of stock or insufficient quantity available.`,
        );
      }

      const newStock = product.quantityInStock - item.quantity;
      const newAvailability = newStock > 0;

      // Update product stock and availability
      await Product.findByIdAndUpdate(
        product._id,
        {
          quantityInStock: newStock,
          availability: newAvailability,
        },
        { session },
      );

      const price = product.price;
      totalAmount += price * item.quantity;
      orderItems.push({
        productId: new mongoose.Types.ObjectId(item.productId),
        quantity: item.quantity,
        price: price,
      });
    }

    // Create the order
    const newOrderData = {
      userId: new mongoose.Types.ObjectId(userId),
      items: orderItems,
      totalAmount,
      shippingAddress: payload.shippingAddress,
    };

    const newOrder = (await Order.create([newOrderData], { session }))[0];

    await session.commitTransaction();
    return newOrder;
  } catch (error) {
    await session.abortTransaction();
    throw error; // Re-throw the error to be caught by the global error handler
  } finally {
    session.endSession();
  }
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
  requestingUserId: string,
  requestingUserRole: string,
): Promise<IOrder | null> => {
  const filter: mongoose.FilterQuery<IOrder> = { _id: orderId };

  // If the user is a regular user, they can only access their own orders.
  if (requestingUserRole === 'USER') {
    filter.userId = requestingUserId;
  }

  const result = await Order.findOne(filter)
    .populate('userId', 'name email')
    .populate('items.productId');

  if (!result) {
    // Use a generic message to avoid confirming the existence of an order ID
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found or you do not have permission to view it.');
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
