import { Controller, Post, Body, Param, Put, Get, UseGuards } from "@nestjs/common";
import { OrdersService } from './order.service';
import { Order } from './order.model';
import { newProducts } from './order.types';
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('higherAmount')
  async getHigherAmount(): Promise<Order> {
    console.log('Inside higher ammount');
    return await this.ordersService.getHighAmount();
  }
  @Get('lastmonth')
  async lastMonth(): Promise<Order[]> {
    console.log('Inside higher ammount');
    return await this.ordersService.getLastMonth();
  }
  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @Body('clientName') clientName: string,
    @Body('products') products: string[],
  ): Promise<Order> {
    return await this.ordersService.createOrder(clientName, products);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateOrder(
    @Param('id') orderId: string,
    @Body('clientName') clientName: string,
    @Body('products') products: newProducts[],
  ): Promise<Order> {
    return await this.ordersService.updateOrder(orderId, clientName, products);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getOrders(): Promise<Order[]> {
    return await this.ordersService.getOrders();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOrder(@Param('id') orderId: string): Promise<Order> {
    return await this.ordersService.getOrder(orderId);
  }
}
