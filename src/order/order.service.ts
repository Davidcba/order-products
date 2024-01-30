import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Order } from './order.model';
import { ProductsService } from '../product/product.service';
import { newProducts } from './order.types';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<Order>,
    private readonly productsService: ProductsService,
  ) {}

  async createOrder(clientName: string, products: string[]): Promise<Order> {
    const productIds = products.map(
      (productId) => new mongoose.Types.ObjectId(productId),
    );
    const newtotal = await this.productsService.getTotalPrice(products);
    const newOrder = new this.orderModel({
      clientName,
      products: productIds,
      total: newtotal,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await newOrder.save();
  }
  async updateOrder(
    id: string,
    clientName: string,
    products: newProducts[],
  ): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    const currentProducts = order.products;
    products.forEach((products) => {
      const actionId = new Types.ObjectId(products.id);
      if (products.action === 'add') {
        currentProducts.push(actionId);
      } else if (products.action === 'delete') {
        const indexOfSearch = currentProducts.indexOf(actionId);
        if (indexOfSearch !== -1) {
          currentProducts.splice(indexOfSearch, 1);
        }
      } else {
        return new BadRequestException(
          'ERROR: Bad Request while updating order',
        );
      }
    });
    order.products = currentProducts;
    order.clientName = clientName ? clientName : order.clientName;
    order.clientName = clientName ? clientName : order.clientName;
    order.total = await this.productsService.getTotalPrice(currentProducts);
    return await order.save();
  }
  async getOrder(id: string): Promise<Order> {
    try {
      const order = await this.orderModel
        .findOne({ _id: id })
        .populate({
          path: 'products',
          select: '_id , name',
        })
        .exec();

      if (!order) {
        throw new NotFoundException('Order not found');
      }
      const newTotal = await this.updateTotal(
        order.products,
        new mongoose.Types.ObjectId(id),
      );
      order.total = newTotal;
      return order;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch order');
    }
  }
  async getOrders(): Promise<Order[]> {
    return await this.orderModel.find().exec();
  }
  async updateTotal(
    products: string[] | Types.ObjectId[],
    orderId: Types.ObjectId,
  ): Promise<number> {
    const newTotal = await this.productsService.getTotalPrice(products);
    await this.orderModel
      .findOneAndUpdate({ _id: orderId }, { total: newTotal })
      .exec();
    return newTotal;
  }

  async getHighAmount(): Promise<Order> {
    try {
      const orders = await this.orderModel.find().sort({ total: -1 }).exec();

      return orders[0];
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch orders');
    }
  }

  async getLastMonth(): Promise<Order[]> {
    try {
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

      return await this.orderModel
        .find({ createdAt: { $gte: lastMonthDate } })
        .sort({ total: -1 }) // Sorting by total in descending order (-1)
        .exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch orders');
    }
  }
}
