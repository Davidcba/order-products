import * as mongoose from 'mongoose';
export const ProductSchema = new mongoose.Schema(
  {
    name: String,
    sku: String,
    price: Number,
    picture: Buffer,
  },
  { versionKey: false },
);

export interface Product extends mongoose.Document {
  name: string;
  sku: string;
  price: number;
  picture: Buffer;
}
