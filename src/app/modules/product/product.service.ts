import httpStatus from 'http-status-codes';
import AppError from '../../errorHelpers/AppError';
import { IProduct } from './product.interface';
import { Product } from './product.model';
import mongoose, { Types } from 'mongoose';

const createProductIntoDB = async (payload: IProduct): Promise<IProduct> => {
  // Using a unique index on `product_title` in the schema is more robust
  // than a manual check to prevent race conditions.
  try {
    const result = await Product.create(payload);
    return result;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new AppError(
        httpStatus.CONFLICT,
        'A product with this title already exists.',
      );
    }
    throw error;
  }
};

const getAllProductsFromDB = async (query: Record<string, unknown>) => {
  const {
    searchTerm,
    category,
    minPrice,
    maxPrice,
    availability,
    sort,
    page = 1,
    limit = 10,
    ...otherFilters
  } = query;

  const filter: Record<string, unknown> = { ...otherFilters };

  // Search functionality
  if (searchTerm) {
    const searchRegex = new RegExp(searchTerm as string, 'i');
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
      (filter.price as Record<string, unknown>).$gte = Number(minPrice);
    }
    if (maxPrice) {
      (filter.price as Record<string, unknown>).$lte = Number(maxPrice);
    }
  }

  if (availability) {
    filter.availability = availability === 'true';
  }

  const productQuery = Product.find(filter);

  // Sorting
  const sortOption = (sort as string) || '-createdAt';
  productQuery.sort(sortOption.split(',').join(' '));

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);
  productQuery.skip(skip).limit(Number(limit));

  const data = await productQuery.exec();
  const total = await Product.countDocuments(filter);

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
    },
    data,
  };
};

const getSingleProductFromDB = async (id: number): Promise<IProduct | null> => {
  // Mongoose automatically casts the string `id` to an ObjectId.
  // The `id` is validated to be a valid ObjectId string in the route handler.
  const result = await Product.findById(id);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  return result;
};

const updateProductIntoDB = async (
  id: string,
  payload: Partial<IProduct>,
): Promise<IProduct | null> => {
  // Automatically update availability based on stock changes
  if (payload.quantityInStock !== undefined) {
    payload.availability = payload.quantityInStock > 0;
  }

  // Rely on the unique index on `product_title` to handle duplicates,
  // which is more efficient and avoids race conditions.
  try {
    const result = await Product.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!result) {
      throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
    }

    return result;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new AppError(
        httpStatus.CONFLICT,
        'Another product with this title already exists.',
      );
    }
    throw error;
  }
};

const deleteProductFromDB = async (id: string): Promise<IProduct | null> => {
  const result = await Product.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }
  return result;
};

export const ProductServices = {
  createProductIntoDB,
  getAllProductsFromDB,
  getSingleProductFromDB,
  updateProductIntoDB,
  deleteProductFromDB,
};