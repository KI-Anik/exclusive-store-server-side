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

const OrderMock = Order as jest.Mocked<typeof Order>;
const ProductMock = Product as jest.Mocked<typeof Product>;

describe('OrderServices', () => {
  const mockProduct = {
    _id: new mongoose.Types.ObjectId(),
    product_title: 'Test Product',
    price: 100,
    availability: true,
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
    const orderPayload = {
      items: [{ productId: mockProduct._id.toString(), quantity: 2 }],
      shippingAddress: '123 Test St',
    };

    it('should create an order successfully', async () => {
      (ProductMock.find as jest.Mock).mockResolvedValue([mockProduct]);
      (OrderMock.create as jest.Mock).mockResolvedValue(mockOrder);

      const result = await OrderServices.createOrderIntoDB(
        mockOrder.userId.toString(),
        orderPayload,
      );

      expect(ProductMock.find).toHaveBeenCalledWith({
        _id: { $in: [mockProduct._id.toString()] },
      });
      expect(OrderMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          totalAmount: 200,
          shippingAddress: '123 Test St',
        }),
      );
      expect(result).toEqual(mockOrder);
    });

    it('should throw NOT_FOUND error if a product is not found', async () => {
      (ProductMock.find as jest.Mock).mockResolvedValue([]);

      await expect(
        OrderServices.createOrderIntoDB(
          mockOrder.userId.toString(),
          orderPayload,
        ),
      ).rejects.toThrow(
        new AppError(httpStatus.NOT_FOUND, 'One or more products not found'),
      );
    });

    it('should throw BAD_REQUEST error if a product is unavailable', async () => {
      const unavailableProduct = { ...mockProduct, availability: false };
      (ProductMock.find as jest.Mock).mockResolvedValue([unavailableProduct]);

      await expect(
        OrderServices.createOrderIntoDB(
          mockOrder.userId.toString(),
          orderPayload,
        ),
      ).rejects.toThrow(
        new AppError(
          httpStatus.BAD_REQUEST,
          `Product "${unavailableProduct.product_title}" is currently unavailable`,
        ),
      );
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
    it('should throw NOT_FOUND error if order is not found', async () => {
      // Mock the chained .populate() calls
      const finalQuery = {
        populate: jest.fn().mockResolvedValue(null), // The second populate resolves to null
      };
      const initialQuery = {
        populate: jest.fn().mockReturnValue(finalQuery), // The first populate returns the next query object
      };
      (OrderMock.findById as jest.Mock).mockReturnValue(initialQuery);

      await expect(
        OrderServices.getSingleOrderFromDB('non-existent-id'),
      ).rejects.toThrow(new AppError(httpStatus.NOT_FOUND, 'Order not found'));
    });
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