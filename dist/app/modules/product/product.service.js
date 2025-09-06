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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductServices = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const product_model_1 = require("./product.model");
const createProductIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if a product with the same title already exists to prevent duplicates
    const existingProduct = yield product_model_1.Product.findOne({
        product_title: payload.product_title,
    });
    if (existingProduct) {
        throw new AppError_1.default(http_status_codes_1.default.CONFLICT, 'A product with this title already exists.');
    }
    const result = yield product_model_1.Product.create(payload);
    return result;
});
const getAllProductsFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm, category, minPrice, maxPrice, availability, sort, page = 1, limit = 10 } = query, otherFilters = __rest(query, ["searchTerm", "category", "minPrice", "maxPrice", "availability", "sort", "page", "limit"]);
    const filter = Object.assign({}, otherFilters);
    // Search functionality
    if (searchTerm) {
        const searchRegex = new RegExp(searchTerm, 'i');
        filter.$or = [
            { product_title: searchRegex },
            { description: searchRegex },
            { category: searchRegex },
        ];
    }
    // Filtering
    if (category) {
        filter.category = category;
    }
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) {
            filter.price.$gte = Number(minPrice);
        }
        if (maxPrice) {
            filter.price.$lte = Number(maxPrice);
        }
    }
    if (availability) {
        filter.availability = availability === 'true';
    }
    const productQuery = product_model_1.Product.find(filter);
    // Sorting
    const sortOption = sort || '-createdAt';
    productQuery.sort(sortOption.split(',').join(' '));
    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    productQuery.skip(skip).limit(Number(limit));
    const data = yield productQuery.exec();
    const total = yield product_model_1.Product.countDocuments(filter);
    return {
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
        },
        data,
    };
});
const getSingleProductFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield product_model_1.Product.findById(id);
    if (!result) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Product not found');
    }
    return result;
});
const updateProductIntoDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield product_model_1.Product.findById(id);
    if (!product) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Product not found');
    }
    // Automatically update availability based on stock changes
    if (payload.quantityInStock !== undefined) {
        payload.availability = payload.quantityInStock > 0;
    }
    // Prevent duplicate titles on update, excluding the current document
    if (payload.product_title) {
        const existingProduct = yield product_model_1.Product.findOne({
            product_title: payload.product_title,
            _id: { $ne: id },
        });
        if (existingProduct) {
            throw new AppError_1.default(http_status_codes_1.default.CONFLICT, 'Another product with this title already exists.');
        }
    }
    const result = yield product_model_1.Product.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
});
const deleteProductFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield product_model_1.Product.findById(id);
    if (!product) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Product not found');
    }
    const result = yield product_model_1.Product.findByIdAndDelete(id);
    return result;
});
exports.ProductServices = {
    createProductIntoDB,
    getAllProductsFromDB,
    getSingleProductFromDB,
    updateProductIntoDB,
    deleteProductFromDB,
};
