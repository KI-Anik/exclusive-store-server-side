import { z } from 'zod';
import { Types } from 'mongoose';

export const createProductZodSchema = z.object({
  body: z.object({
    product_title: z
      .string({
        required_error: 'Product title is required',
        invalid_type_error: 'Product title must be a string',
      })
      .min(3, { message: 'Product title must be at least 3 characters long' }),
    product_image: z
      .string({
        required_error: 'Product image is required',
        invalid_type_error: 'Product image must be a string',
      })
      .url({ message: 'Product image must be a valid URL' }),
    category: z.string({
      required_error: 'Category is required',
      invalid_type_error: 'Category must be a string',
    }),
    price: z
      .number({
        required_error: 'Price is required',
        invalid_type_error: 'Price must be a number',
      })
      .positive({ message: 'Price must be a positive number' }),
    description: z
      .string({
        required_error: 'Description is required',
        invalid_type_error: 'Description must be a string',
      })
      .min(10, { message: 'Description must be at least 10 characters long' }),
    specification: z
      .array(z.string(), {
        required_error: 'Specification is required',
        invalid_type_error: 'Specification must be an array of strings',
      })
      .nonempty({ message: 'Specification cannot be empty' }),
    availability: z.boolean({
      invalid_type_error: 'Availability must be a boolean',
    }).optional(),
    quantityInStock: z
      .number({
        required_error: 'Stock quantity is required',
        invalid_type_error: 'Stock quantity must be a number',
      })
      .int({ message: 'Stock quantity must be an integer' })
      .min(0, { message: 'Stock quantity cannot be negative' }),
    rating: z
      .number({
        required_error: 'Rating is required',
        invalid_type_error: 'Rating must be a number',
      })
      .min(0, { message: 'Rating must be at least 0' })
      .max(5, { message: 'Rating must be at most 5' }),
  }),
});

export const updateProductZodSchema = z.object({
  body: z.object({
    product_title: z
      .string({
        invalid_type_error: 'Product title must be a string',
      })
      .min(3, { message: 'Product title must be at least 3 characters long' })
      .optional(),
    product_image: z
      .string({
        invalid_type_error: 'Product image must be a string',
      })
      .url({ message: 'Product image must be a valid URL' })
      .optional(),
    category: z
      .string({
        invalid_type_error: 'Category must be a string',
      })
      .optional(),
    price: z
      .number({
        invalid_type_error: 'Price must be a number',
      })
      .positive({ message: 'Price must be a positive number' })
      .optional(),
    description: z
      .string({
        invalid_type_error: 'Description must be a string',
      })
      .min(10, { message: 'Description must be at least 10 characters long' })
      .optional(),
    specification: z
      .array(z.string(), {
        invalid_type_error: 'Specification must be an array of strings',
      })
      .nonempty({ message: 'Specification cannot be empty' })
      .optional(),
    availability: z
      .boolean({
        invalid_type_error: 'Availability must be a boolean',
      })
      .optional(),
    quantityInStock: z
      .number({
        invalid_type_error: 'Stock quantity must be a number',
      })
      .int({ message: 'Stock quantity must be an integer' })
      .min(0, { message: 'Stock quantity cannot be negative' })
      .optional(),
    rating: z
      .number({
        invalid_type_error: 'Rating must be a number',
      })
      .min(0, { message: 'Rating must be at least 0' })
      .max(5, { message: 'Rating must be at most 5' })
      .optional(),
  }),
});

export const objectIdValidationSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: 'Invalid Product ID provided',
    }),
  }),
});