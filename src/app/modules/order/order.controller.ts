import httpStatus from 'http-status-codes';
import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import AppError from '../../errorHelpers/AppError';
import { OrderServices } from './order.service';

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const result = await OrderServices.createOrderIntoDB(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Order created successfully',
    data: result,
  });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const { userId, role } = req.user!;
  const result = await OrderServices.getAllOrdersFromDB(userId, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Orders retrieved successfully',
    data: result,
  });
});

const getSingleOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await OrderServices.getSingleOrderFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order retrieved successfully',
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Status is required');
  }

  const result = await OrderServices.updateOrderStatusInDB(id, status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order status updated successfully',
    data: result,
  });
});

export const OrderControllers = {
  createOrder,
  getAllOrders,
  getSingleOrder,
  updateOrderStatus,
};
