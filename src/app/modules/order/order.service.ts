import httpStatus from 'http-status-codes';
import mongoose from 'mongoose';
import AppError from '../../errorHelpers/AppError';
import { Product } from '../product/product.model';
import { IOrder, IOrderItem } from './order.interface';
import { Order } from './order.model';
import { IUser, Role } from '../user/user.interface';

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

const getOrdersForCurrentUserFromDB = async (userId: string) => {
  // This endpoint is for the "My Orders" page and should ALWAYS be filtered by the logged-in user.
  const result = await Order.find({ userId })
    .populate('userId', 'name email')
    .populate('items.productId', 'product_title product_image category')
    .sort('-createdAt');
  return result;
};

const getAllOrdersForAdminFromDB = async () => {
  // This endpoint is for the "Manage Orders" admin page and fetches all orders.
  const result = await Order.find({})
    .populate('userId', 'name email')
    .populate('items.productId', 'product_title product_image category')
    .sort('-createdAt');
  return result;
};

const getSingleOrderFromDB = async (
  orderId: string,
  requestingUserId: string,
  requestingUserRole: Role,
  requestingUserEmail: string,
): Promise<IOrder> => {
  const order = await Order.findById(orderId)
    .populate<{ userId: IUser }>('userId', 'name email')
    .populate('items.productId');

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }

  // Security check: If the user is a regular user, ensure they own the order.
  if (
    requestingUserRole === Role.USER &&
    (order.userId._id.toString() !== requestingUserId ||
      order.userId.email !== requestingUserEmail)
  ) {
    throw new AppError(httpStatus.FORBIDDEN, 'You do not have permission to view this order.');
  }

  // Admins can view any order.
  return order;
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
  getOrdersForCurrentUserFromDB,
  getAllOrdersForAdminFromDB,
  getSingleOrderFromDB,
  updateOrderStatusInDB,
};
