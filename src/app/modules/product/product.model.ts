import { model, Schema } from 'mongoose';
import { IProduct } from './product.interface';

const productSchema = new Schema<IProduct>(
  {
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
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Product = model<IProduct>('Product', productSchema);