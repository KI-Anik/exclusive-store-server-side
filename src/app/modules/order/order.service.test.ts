import httpStatus from 'http-status-codes';
import mongoose from 'mongoose';
import AppError from '../../errorHelpers/AppError';
import { IProduct } from '../product/product.interface';
import { Product } from '../product/product.model';
import { IOrder, OrderStatus } from './order.interface';
import { Order } from './order.model';
import { OrderServices } from './order.service';

// Mock dependencies
jest.mock('./order.model');
jest.mock('../product/product.model');
jest.mock('mongoose');

const OrderMock = Order as jest.Mocked<typeof Order>;
const ProductMock = Product as jest.Mocked<typeof Product>;
const mongooseMock = mongoose as jest.Mocked<typeof mongoose>;

describe('OrderServices', () => {
  const mockProduct = {
    _id: new mongoose.Types.ObjectId(),
    product_title: 'Test Product',
    price: 100,
    availability: true,
    quantityInStock: 10,
    product_image: '',
    category: '',
    description: '',
    specification: [],
    rating: 5,
  };

  const mockOrder: IOrder = {
    _id: new mongoose.Types.ObjectId(),
    userId: new mongoose.Types.ObjectId(),
    items: [
      {
        productId: mockProduct._id,
        quantity: 2,
        price: 100,
      },
    ],
    totalAmount: 200,
    shippingAddress: '123 Test St',
    status: OrderStatus.PENDING,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test suite for createOrderIntoDB
  describe('createOrderIntoDB', () => {
    const mockSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };

    beforeEach(() => {
      // Mock mongoose.startSession to return our mock session
      (mongooseMock.startSession as jest.Mock).mockResolvedValue(mockSession);
    });

    const orderPayload = {
      items: [{ productId: mockProduct._id.toString(), quantity: 2 }],
      shippingAddress: '123 Test St',
    };

    it('should create an order and update stock successfully within a transaction', async () => {
      // Arrange
      const findQuery = { session: jest.fn().mockResolvedValue([mockProduct]) };
      (ProductMock.find as jest.Mock).mockReturnValue(findQuery);
      (ProductMock.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);
      (OrderMock.create as jest.Mock).mockResolvedValue([mockOrder]); // create returns an array

      // Act
      const result = await OrderServices.createOrderIntoDB(
        mockOrder.userId.toString(),
        orderPayload,
      );

      // Assert
      expect(mongoose.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();

      expect(ProductMock.find).toHaveBeenCalledWith({
        _id: { $in: [mockProduct._id.toString()] },
      });
      expect(findQuery.session).toHaveBeenCalledWith(mockSession);

      expect(ProductMock.findByIdAndUpdate).toHaveBeenCalledWith(
        mockProduct._id,
        {
          quantityInStock: 8, // 10 - 2
          availability: true,
        },
        { session: mockSession },
      );

      expect(OrderMock.create).toHaveBeenCalledWith(
        [expect.objectContaining({ totalAmount: 200 })],
        { session: mockSession },
      );

      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.abortTransaction).not.toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(result).toEqual(mockOrder);
    });

    it('should throw an error and abort transaction if a product is not found', async () => {
      const findQuery = { session: jest.fn().mockResolvedValue([]) };
      (ProductMock.find as jest.Mock).mockReturnValue(findQuery);

      await expect(
        OrderServices.createOrderIntoDB(
          mockOrder.userId.toString(),
          orderPayload,
        ),
      ).rejects.toThrow('One or more products not found');

      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.commitTransaction).not.toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('should throw an error and abort transaction if stock is insufficient', async () => {
      // Arrange
      const productWithLowStock = { ...mockProduct, quantityInStock: 1 };
      const findQuery = {
        session: jest.fn().mockResolvedValue([productWithLowStock]),
      };
      (ProductMock.find as jest.Mock).mockReturnValue(findQuery);

      // Act & Assert
      await expect(
        OrderServices.createOrderIntoDB(
          mockOrder.userId.toString(),
          orderPayload,
        ),
      ).rejects.toThrow(
        `Product "${productWithLowStock.product_title}" is out of stock or insufficient quantity available.`,
      );

      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(ProductMock.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(OrderMock.create).not.toHaveBeenCalled();
      expect(mockSession.commitTransaction).not.toHaveBeenCalled();
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });
  });

  // Test suite for getAllOrdersFromDB
  describe('getAllOrdersFromDB', () => {
    it('should retrieve orders for a specific user', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([mockOrder]),
      };
      (OrderMock.find as jest.Mock).mockReturnValue(mockQuery);

      const result = await OrderServices.getAllOrdersFromDB(
        mockOrder.userId.toString(),
        'USER',
      );

      expect(OrderMock.find).toHaveBeenCalledWith({ userId: mockOrder.userId.toString() });
      expect(result).toEqual([mockOrder]);
    });

    it('should retrieve all orders for an admin', async () => {
        const mockQuery = {
            populate: jest.fn().mockReturnThis(),
            sort: jest.fn().mockResolvedValue([mockOrder]),
          };
      (OrderMock.find as jest.Mock).mockReturnValue(mockQuery);

      await OrderServices.getAllOrdersFromDB('admin-id', 'ADMIN');

      expect(OrderMock.find).toHaveBeenCalledWith({});
    });
  });

  // Test suite for getSingleOrderFromDB
  describe('getSingleOrderFromDB', () => {
   });


  // Test suite for updateOrderStatusInDB
  describe('updateOrderStatusInDB', () => {
    it('should throw NOT_FOUND error if order to update is not found', async () => {
      (OrderMock.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await expect(
        OrderServices.updateOrderStatusInDB(
          'non-existent-id',
          OrderStatus.SHIPPED,
        ),
      ).rejects.toThrow(new AppError(httpStatus.NOT_FOUND, 'Order not found'));
    });
  });
});

