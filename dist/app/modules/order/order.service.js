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
exports.OrderServices = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const mongoose_1 = __importDefault(require("mongoose"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const product_model_1 = require("../product/product.model");
const order_model_1 = require("./order.model");
const createOrderIntoDB = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Start a Mongoose session for transaction
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const productIds = payload.items.map((item) => item.productId);
        const products = yield product_model_1.Product.find({ _id: { $in: productIds } }).session(session);
        if (products.length !== productIds.length) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'One or more products not found');
        }
        let totalAmount = 0;
        const orderItems = [];
        for (const item of payload.items) {
            const product = products.find((p) => p._id.toString() === item.productId);
            if (!product) {
                throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, `Product with ID ${item.productId} not found`);
            }
            // Check for availability and stock
            if (!product.availability || product.quantityInStock < item.quantity) {
                throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Product "${product.product_title}" is out of stock or insufficient quantity available.`);
            }
            const newStock = product.quantityInStock - item.quantity;
            const newAvailability = newStock > 0;
            // Update product stock and availability
            yield product_model_1.Product.findByIdAndUpdate(product._id, {
                quantityInStock: newStock,
                availability: newAvailability,
            }, { session });
            const price = product.price;
            totalAmount += price * item.quantity;
            orderItems.push({
                productId: new mongoose_1.default.Types.ObjectId(item.productId),
                quantity: item.quantity,
                price: price,
            });
        }
        // Create the order
        const newOrderData = {
            userId: new mongoose_1.default.Types.ObjectId(userId),
            items: orderItems,
            totalAmount,
            shippingAddress: payload.shippingAddress,
        };
        const newOrder = (yield order_model_1.Order.create([newOrderData], { session }))[0];
        yield session.commitTransaction();
        return newOrder;
    }
    catch (error) {
        yield session.abortTransaction();
        throw error; // Re-throw the error to be caught by the global error handler
    }
    finally {
        session.endSession();
    }
});
const getAllOrdersFromDB = (userId, role) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = role === 'USER' ? { userId } : {};
    const result = yield order_model_1.Order.find(filter)
        .populate('userId', 'name email')
        .populate('items.productId', 'product_title product_image category')
        .sort('-createdAt');
    return result;
});
const getSingleOrderFromDB = (orderId, requestingUserId, requestingUserRole) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = { _id: orderId };
    // If the user is a regular user, they can only access their own orders.
    if (requestingUserRole === 'USER') {
        filter.userId = requestingUserId;
    }
    const result = yield order_model_1.Order.findOne(filter)
        .populate('userId', 'name email')
        .populate('items.productId');
    if (!result) {
        // Use a generic message to avoid confirming the existence of an order ID
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Order not found or you do not have permission to view it.');
    }
    return result;
});
const updateOrderStatusInDB = (orderId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield order_model_1.Order.findByIdAndUpdate(orderId, { status }, { new: true, runValidators: true });
    if (!result) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Order not found');
    }
    return result;
});
exports.OrderServices = {
    createOrderIntoDB,
    getAllOrdersFromDB,
    getSingleOrderFromDB,
    updateOrderStatusInDB,
};
