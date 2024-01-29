import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './order.model';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<Order>,
  ) {}

  async createOrder(clientName: string, products: string[]): Promise<Order> {
    const newOrder = new this.orderModel({
      clientName,
      products,
    });

    return await newOrder.save();
  }

  async updateOrder(
    id: string,
    clientName: string,
    products: string[],
  ): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.clientName = clientName;
    order.products.toHex = products;

    return await order.save();
  }

  async getOrder(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getOrders(): Promise<Order[]> {
    return await this.orderModel.find().exec();
  }
}
