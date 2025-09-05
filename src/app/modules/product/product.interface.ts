import { Types } from "mongoose";

export interface IProduct {
  _id?: Types.ObjectId;
  product_title: string;
  product_image: string;
  category: string;
  price: number;
  description: string;
  specification: string[];
  availability: boolean;
  rating: number;
  quantityInStock: number;
}