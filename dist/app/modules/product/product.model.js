"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    product_title: {
        type: String,
        required: true,
        trim: true,
    },
    product_image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    specification: {
        type: [String],
        required: true,
    },
    availability: {
        type: Boolean,
        required: true,
        default: true,
    },
    quantityInStock: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
    },
}, {
    timestamps: true,
    versionKey: false,
});
exports.Product = (0, mongoose_1.model)('Product', productSchema);
