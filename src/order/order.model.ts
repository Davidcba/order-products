import * as mongoose from 'mongoose';

export const OrderSchema = new mongoose.Schema({
  clientName: String,
  total: Number,
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
});

export interface Order extends mongoose.Document {
  clientName: string;
  total: number;
  products: mongoose.Types.ObjectId[];
}

OrderSchema.virtual('total').get(function (this: any) {
  // Calculate the total by summing up the prices of all products
  return this.products.reduce((total: number, product: any) => {
    return total + product.price;
  }, 0);
});
