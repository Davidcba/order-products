import { Controller, Post, Body, Param, Put, Get } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from "./order.model";

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body('clientName') clientName: string, @Body('products') products: string[]): Promise<Order> {
    return await this.ordersService.createOrder(clientName, products);
  }

  @Put(':id')
  async updateOrder(
    @Param('id') orderId: string,
    @Body('clientName') clientName: string,
    @Body('products') products: string[],
  ): Promise<Order> {
    return await this.ordersService.updateOrder(orderId, clientName, products);
  }

  @Get()
  async getOrders(): Promise<Order[]> {
    return await this.ordersService.getOrders();
  }

  @Get(':id')
  async getOrder(@Param('id') orderId: string): Promise<Order> {
    return await this.ordersService.getOrder(orderId);
  }
}
