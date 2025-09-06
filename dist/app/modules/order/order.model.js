"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const order_interface_1 = require("./order.interface");
const orderItemSchema = new mongoose_1.Schema({
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
}, { _id: false });
const orderSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: String, required: true, trim: true },
    status: {
        type: String,
        enum: Object.values(order_interface_1.OrderStatus),
        default: order_interface_1.OrderStatus.PENDING,
        required: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
exports.Order = (0, mongoose_1.model)('Order', orderSchema);
