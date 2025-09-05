import httpStatus from 'http-status-codes';
import AppError from '../../errorHelpers/AppError';
import { IProduct } from './product.interface';
import { Product } from './product.model';
import mongoose from 'mongoose';

const createProductIntoDB = async (payload: IProduct): Promise<IProduct> => {
  // Check if a product with the same title already exists to prevent duplicates
  const existingProduct = await Product.findOne({
    product_title: payload.product_title,
  });

  if (existingProduct) {
    throw new AppError(
      httpStatus.CONFLICT,
      'A product with this title already exists.',
    );
  }

  const result = await Product.create(payload);
  return result;
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

const getSingleProductFromDB = async (id: string): Promise<IProduct | null> => {
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
  const product = await Product.findById(id);

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  // Automatically update availability based on stock changes
  if (payload.quantityInStock !== undefined) {
    payload.availability = payload.quantityInStock > 0;
  }

  // Prevent duplicate titles on update, excluding the current document
  if (payload.product_title) {
    const existingProduct = await Product.findOne({
      product_title: payload.product_title,
      _id: { $ne: id },
    });
    if (existingProduct) {
      throw new AppError(
        httpStatus.CONFLICT,
        'Another product with this title already exists.',
      );
    }
  }

  const result = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteProductFromDB = async (id: string): Promise<IProduct | null> => {
  const product = await Product.findById(id);

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  const result = await Product.findByIdAndDelete(id);
  return result;
};

export const ProductServices = {
  createProductIntoDB,
  getAllProductsFromDB,
  getSingleProductFromDB,
  updateProductIntoDB,
  deleteProductFromDB,
};