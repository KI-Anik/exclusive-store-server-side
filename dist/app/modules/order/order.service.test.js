"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const mongoose_1 = __importDefault(require("mongoose"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const product_model_1 = require("../product/product.model");
const order_interface_1 = require("./order.interface");
const order_model_1 = require("./order.model");
const order_service_1 = require("./order.service");
// Mock dependencies
jest.mock('./order.model');
jest.mock('../product/product.model');
jest.mock('mongoose');
const OrderMock = order_model_1.Order;
const ProductMock = product_model_1.Product;
const mongooseMock = mongoose_1.default;
describe('OrderServices', () => {
    const mockProduct = {
        _id: new mongoose_1.default.Types.ObjectId(),
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
    const mockOrder = {
        _id: new mongoose_1.default.Types.ObjectId(),
        userId: new mongoose_1.default.Types.ObjectId(),
        items: [
            {
                productId: mockProduct._id,
                quantity: 2,
                price: 100,
            },
        ],
        totalAmount: 200,
        shippingAddress: '123 Test St',
        status: order_interface_1.OrderStatus.PENDING,
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
            mongooseMock.startSession.mockResolvedValue(mockSession);
        });
        const orderPayload = {
            items: [{ productId: mockProduct._id.toString(), quantity: 2 }],
            shippingAddress: '123 Test St',
        };
        it('should create an order and update stock successfully within a transaction', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const findQuery = { session: jest.fn().mockResolvedValue([mockProduct]) };
            ProductMock.find.mockReturnValue(findQuery);
            ProductMock.findByIdAndUpdate.mockResolvedValue(true);
            OrderMock.create.mockResolvedValue([mockOrder]); // create returns an array
            // Act
            const result = yield order_service_1.OrderServices.createOrderIntoDB(mockOrder.userId.toString(), orderPayload);
            // Assert
            expect(mongoose_1.default.startSession).toHaveBeenCalled();
            expect(mockSession.startTransaction).toHaveBeenCalled();
            expect(ProductMock.find).toHaveBeenCalledWith({
                _id: { $in: [mockProduct._id.toString()] },
            });
            expect(findQuery.session).toHaveBeenCalledWith(mockSession);
            expect(ProductMock.findByIdAndUpdate).toHaveBeenCalledWith(mockProduct._id, {
                quantityInStock: 8, // 10 - 2
                availability: true,
            }, { session: mockSession });
            expect(OrderMock.create).toHaveBeenCalledWith([expect.objectContaining({ totalAmount: 200 })], { session: mockSession });
            expect(mockSession.commitTransaction).toHaveBeenCalled();
            expect(mockSession.abortTransaction).not.toHaveBeenCalled();
            expect(mockSession.endSession).toHaveBeenCalled();
            expect(result).toEqual(mockOrder);
        }));
        it('should throw an error and abort transaction if a product is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            const findQuery = { session: jest.fn().mockResolvedValue([]) };
            ProductMock.find.mockReturnValue(findQuery);
            yield expect(order_service_1.OrderServices.createOrderIntoDB(mockOrder.userId.toString(), orderPayload)).rejects.toThrow('One or more products not found');
            expect(mockSession.abortTransaction).toHaveBeenCalled();
            expect(mockSession.commitTransaction).not.toHaveBeenCalled();
            expect(mockSession.endSession).toHaveBeenCalled();
        }));
        it('should throw an error and abort transaction if stock is insufficient', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const productWithLowStock = Object.assign(Object.assign({}, mockProduct), { quantityInStock: 1 });
            const findQuery = {
                session: jest.fn().mockResolvedValue([productWithLowStock]),
            };
            ProductMock.find.mockReturnValue(findQuery);
            // Act & Assert
            yield expect(order_service_1.OrderServices.createOrderIntoDB(mockOrder.userId.toString(), orderPayload)).rejects.toThrow(`Product "${productWithLowStock.product_title}" is out of stock or insufficient quantity available.`);
            expect(mockSession.startTransaction).toHaveBeenCalled();
            expect(ProductMock.findByIdAndUpdate).not.toHaveBeenCalled();
            expect(OrderMock.create).not.toHaveBeenCalled();
            expect(mockSession.commitTransaction).not.toHaveBeenCalled();
            expect(mockSession.abortTransaction).toHaveBeenCalled();
            expect(mockSession.endSession).toHaveBeenCalled();
        }));
    });
    // Test suite for getAllOrdersFromDB
    describe('getAllOrdersFromDB', () => {
        it('should retrieve orders for a specific user', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue([mockOrder]),
            };
            OrderMock.find.mockReturnValue(mockQuery);
            const result = yield order_service_1.OrderServices.getAllOrdersFromDB(mockOrder.userId.toString(), 'USER');
            expect(OrderMock.find).toHaveBeenCalledWith({ userId: mockOrder.userId.toString() });
            expect(result).toEqual([mockOrder]);
        }));
        it('should retrieve all orders for an admin', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue([mockOrder]),
            };
            OrderMock.find.mockReturnValue(mockQuery);
            yield order_service_1.OrderServices.getAllOrdersFromDB('admin-id', 'ADMIN');
            expect(OrderMock.find).toHaveBeenCalledWith({});
        }));
    });
    // Test suite for getSingleOrderFromDB
    describe('getSingleOrderFromDB', () => {
    });
    // Test suite for updateOrderStatusInDB
    describe('updateOrderStatusInDB', () => {
        it('should throw NOT_FOUND error if order to update is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            OrderMock.findByIdAndUpdate.mockResolvedValue(null);
            yield expect(order_service_1.OrderServices.updateOrderStatusInDB('non-existent-id', order_interface_1.OrderStatus.SHIPPED)).rejects.toThrow(new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Order not found'));
        }));
    });
});
