"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductZodSchema = exports.createProductZodSchema = void 0;
const zod_1 = require("zod");
exports.createProductZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        product_title: zod_1.z
            .string({
            required_error: 'Product title is required',
            invalid_type_error: 'Product title must be a string',
        })
            .min(3, { message: 'Product title must be at least 3 characters long' }),
        product_image: zod_1.z
            .string({
            required_error: 'Product image is required',
            invalid_type_error: 'Product image must be a string',
        })
            .url({ message: 'Product image must be a valid URL' }),
        category: zod_1.z.string({
            required_error: 'Category is required',
            invalid_type_error: 'Category must be a string',
        }),
        price: zod_1.z
            .number({
            required_error: 'Price is required',
            invalid_type_error: 'Price must be a number',
        })
            .positive({ message: 'Price must be a positive number' }),
        description: zod_1.z
            .string({
            required_error: 'Description is required',
            invalid_type_error: 'Description must be a string',
        })
            .min(10, { message: 'Description must be at least 10 characters long' }),
        specification: zod_1.z
            .array(zod_1.z.string(), {
            required_error: 'Specification is required',
            invalid_type_error: 'Specification must be an array of strings',
        })
            .nonempty({ message: 'Specification cannot be empty' }),
        availability: zod_1.z.boolean({
            invalid_type_error: 'Availability must be a boolean',
        }).optional(),
        quantityInStock: zod_1.z
            .number({
            required_error: 'Stock quantity is required',
            invalid_type_error: 'Stock quantity must be a number',
        })
            .int({ message: 'Stock quantity must be an integer' })
            .min(0, { message: 'Stock quantity cannot be negative' }),
        rating: zod_1.z
            .number({
            required_error: 'Rating is required',
            invalid_type_error: 'Rating must be a number',
        })
            .min(0, { message: 'Rating must be at least 0' })
            .max(5, { message: 'Rating must be at most 5' }),
    }),
});
exports.updateProductZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        product_title: zod_1.z
            .string({
            invalid_type_error: 'Product title must be a string',
        })
            .min(3, { message: 'Product title must be at least 3 characters long' })
            .optional(),
        product_image: zod_1.z
            .string({
            invalid_type_error: 'Product image must be a string',
        })
            .url({ message: 'Product image must be a valid URL' })
            .optional(),
        category: zod_1.z
            .string({
            invalid_type_error: 'Category must be a string',
        })
            .optional(),
        price: zod_1.z
            .number({
            invalid_type_error: 'Price must be a number',
        })
            .positive({ message: 'Price must be a positive number' })
            .optional(),
        description: zod_1.z
            .string({
            invalid_type_error: 'Description must be a string',
        })
            .min(10, { message: 'Description must be at least 10 characters long' })
            .optional(),
        specification: zod_1.z
            .array(zod_1.z.string(), {
            invalid_type_error: 'Specification must be an array of strings',
        })
            .nonempty({ message: 'Specification cannot be empty' })
            .optional(),
        availability: zod_1.z
            .boolean({
            invalid_type_error: 'Availability must be a boolean',
        })
            .optional(),
        quantityInStock: zod_1.z
            .number({
            invalid_type_error: 'Stock quantity must be a number',
        })
            .int({ message: 'Stock quantity must be an integer' })
            .min(0, { message: 'Stock quantity cannot be negative' })
            .optional(),
        rating: zod_1.z
            .number({
            invalid_type_error: 'Rating must be a number',
        })
            .min(0, { message: 'Rating must be at least 0' })
            .max(5, { message: 'Rating must be at most 5' })
            .optional(),
    }),
});
