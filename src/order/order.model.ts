import * as mongoose from 'mongoose';

export const OrderSchema = new mongoose.Schema(
  {
    clientName: String,
    total: Number,
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    createdAt: Date,
    updatedAt: Date,
  },
  { versionKey: false },
);

export interface Order extends mongoose.Document {
  clientName: string;
  total: number;
  products: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
