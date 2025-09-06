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
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const product_model_1 = require("./product.model");
const product_service_1 = require("./product.service");
const mongoose_1 = require("mongoose");
// Mock the Product model
jest.mock('./product.model');
const ProductMock = product_model_1.Product;
describe('ProductServices', () => {
    const mockProduct = {
        _id: new mongoose_1.Types.ObjectId(),
        product_title: 'Galaxy Tab S8+',
        product_image: 'https://example.com/image.jpg',
        category: 'Samsung',
        price: 599,
        description: 'A great tablet.',
        specification: ['12.4-inch display', '8GB RAM'],
        availability: true,
        rating: 4.8,
    };
    afterEach(() => {
        jest.clearAllMocks();
    });
    // Test suite for createProductIntoDB
    describe('createProductIntoDB', () => {
        it('should create a product successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            ProductMock.findOne.mockResolvedValue(null);
            ProductMock.create.mockResolvedValue(mockProduct);
            // Destructure to separate the payload for creation from the full document
            const { _id } = mockProduct, creationPayload = __rest(mockProduct, ["_id"]);
            const result = yield product_service_1.ProductServices.createProductIntoDB(creationPayload);
            expect(ProductMock.findOne).toHaveBeenCalledWith({
                product_title: creationPayload.product_title,
            });
            expect(ProductMock.create).toHaveBeenCalledWith(creationPayload);
            expect(result).toEqual(mockProduct);
        }));
        it('should throw a conflict error if product title already exists', () => __awaiter(void 0, void 0, void 0, function* () {
            ProductMock.findOne.mockResolvedValue(mockProduct);
            const { _id } = mockProduct, creationPayload = __rest(mockProduct, ["_id"]);
            yield expect(product_service_1.ProductServices.createProductIntoDB(creationPayload)).rejects.toThrow(new AppError_1.default(http_status_codes_1.default.CONFLICT, 'A product with this title already exists.'));
        }));
    });
    describe('getAllProductsFromDB', () => {
        it('should retrieve all products with default pagination and sorting', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockExec = jest.fn().mockResolvedValue([mockProduct]);
            const mockSort = jest.fn().mockReturnThis();
            const mockSkip = jest.fn().mockReturnThis();
            const mockLimit = jest.fn().mockReturnThis();
            ProductMock.find.mockReturnValue({
                sort: mockSort,
                skip: mockSkip,
                limit: mockLimit,
                exec: mockExec,
            });
            ProductMock.countDocuments.mockResolvedValue(1);
            const result = yield product_service_1.ProductServices.getAllProductsFromDB({});
            expect(ProductMock.find).toHaveBeenCalledWith({});
            expect(mockSort).toHaveBeenCalledWith('-createdAt');
            expect(mockSkip).toHaveBeenCalledWith(0);
            expect(mockLimit).toHaveBeenCalledWith(10);
            expect(mockExec).toHaveBeenCalled();
            expect(result.data).toEqual([mockProduct]);
            expect(result.meta.total).toBe(1);
        }));
        it('should handle search, filter, and sort parameters', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockExec = jest.fn().mockResolvedValue([]);
            const mockSort = jest.fn().mockReturnThis();
            const mockSkip = jest.fn().mockReturnThis();
            const mockLimit = jest.fn().mockReturnThis();
            ProductMock.find.mockReturnValue({
                sort: mockSort,
                skip: mockSkip,
                limit: mockLimit,
                exec: mockExec,
            });
            ProductMock.countDocuments.mockResolvedValue(0);
            const query = {
                searchTerm: 'Galaxy',
                category: 'Samsung',
                minPrice: '500',
                maxPrice: '700',
                sort: 'price',
            };
            yield product_service_1.ProductServices.getAllProductsFromDB(query);
            const searchRegex = new RegExp(query.searchTerm, 'i');
            expect(ProductMock.find).toHaveBeenCalledWith(expect.objectContaining({
                category: 'Samsung',
                price: { $gte: 500, $lte: 700 },
            }));
            expect(mockSort).toHaveBeenCalledWith('price');
        }));
    });
    describe('getSingleProductFromDB', () => {
        it('should return a single product if found', () => __awaiter(void 0, void 0, void 0, function* () {
            ProductMock.findById.mockResolvedValue(mockProduct);
            const result = yield product_service_1.ProductServices.getSingleProductFromDB('some-id');
            expect(ProductMock.findById).toHaveBeenCalledWith('some-id');
            expect(result).toEqual(mockProduct);
        }));
        it('should throw a Not Found error if product is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            ProductMock.findById.mockResolvedValue(null);
            yield expect(product_service_1.ProductServices.getSingleProductFromDB('non-existent-id')).rejects.toThrow(new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Product not found'));
        }));
    });
    describe('updateProductIntoDB', () => {
        const updatePayload = { price: 650 };
        const updatedProduct = Object.assign(Object.assign({}, mockProduct), updatePayload);
        it('should update a product successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            ProductMock.findById.mockResolvedValue(mockProduct);
            ProductMock.findByIdAndUpdate.mockResolvedValue(updatedProduct);
            const result = yield product_service_1.ProductServices.updateProductIntoDB('some-id', updatePayload);
            expect(ProductMock.findById).toHaveBeenCalledWith('some-id');
            expect(ProductMock.findByIdAndUpdate).toHaveBeenCalledWith('some-id', updatePayload, {
                new: true,
                runValidators: true,
            });
            expect(result).toEqual(updatedProduct);
        }));
        it('should throw a Not Found error if product to update is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            ProductMock.findById.mockResolvedValue(null);
            yield expect(product_service_1.ProductServices.updateProductIntoDB('non-existent-id', updatePayload)).rejects.toThrow(new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Product not found'));
        }));
    });
    describe('deleteProductFromDB', () => {
        it('should throw a Not Found error if product to delete is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            ProductMock.findById.mockResolvedValue(null);
            yield expect(product_service_1.ProductServices.deleteProductFromDB('non-existent-id')).rejects.toThrow(new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Product not found'));
        }));
    });
});
