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

const getOrdersForCurrentUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const result = await OrderServices.getOrdersForCurrentUserFromDB(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Orders for current user retrieved successfully',
    data: result,
  });
});

const getAllOrdersForAdmin = catchAsync(async (req: Request, res: Response) => {
  // This controller is for admin use only and is protected by the checkAuth middleware.
  const result = await OrderServices.getAllOrdersForAdminFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Orders retrieved successfully',
    data: result,
  });
});

const getSingleOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, role, email } = req.user!;
  const result = await OrderServices.getSingleOrderFromDB(id, userId, role, email);

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
  getOrdersForCurrentUser,
  getAllOrdersForAdmin,
  getSingleOrder,
  updateOrderStatus,
};
