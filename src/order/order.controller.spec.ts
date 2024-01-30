import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './order.controller';
import { OrdersService } from './order.service';
import { Order } from './order.model';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ProductsService } from '../product/product.service';

describe('OrdersController', () => {
  let ordersController: OrdersController;
  let ordersService: OrdersService;
  let ProductService: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [OrdersService, ProductsService],
    }).compile();

    ordersController = module.get<OrdersController>(OrdersController);
    ordersService = module.get<OrdersService>(OrdersService);
  });

  describe('createOrder', () => {
    it('should create a new order', async () => {
      const orderData = {
        clientName: 'Client 1',
        products: ['Product 1', 'Product 2'],
      };
      // @ts-expect-error
      const createdOrder: Order = { id: '1', ...orderData };

      jest.spyOn(ordersService, 'createOrder').mockResolvedValue(createdOrder);

      const result = await ordersController.createOrder(
        orderData.clientName,
        orderData.products,
      );

      expect(result).toEqual(createdOrder);
    });

    it('should throw InternalServerErrorException when an error occurs', async () => {
      jest
        .spyOn(ordersService, 'createOrder')
        .mockRejectedValue(new InternalServerErrorException());

      await expect(
        ordersController.createOrder('Client 1', ['Product 1', 'Product 2']),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('updateOrder', () => {
    it('should update an existing order', async () => {
      const orderId = '1';
      const orderData = {
        clientName: 'Updated Client',
        products: [],
      };
      // @ts-ignore
      const updatedOrder: Order = { id: orderId, ...orderData };

      jest.spyOn(ordersService, 'updateOrder').mockResolvedValue(updatedOrder);
      const result = await ordersController.updateOrder(
        orderId,
        orderData.clientName,
        orderData.products,
      );

      expect(result).toEqual(updatedOrder);
    });

    it('should throw NotFoundException when order is not found', async () => {
      const orderId = '999';
      const orderData = {
        clientName: 'Updated Client',
        products: [],
      };

      jest
        .spyOn(ordersService, 'updateOrder')
        .mockRejectedValue(new NotFoundException());

      await expect(
        ordersController.updateOrder(
          orderId,
          orderData.clientName,
          orderData.products,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getOrder', () => {
    it('should return an order by ID', async () => {
      const orderId = '1';
      // @ts-ignore
      const order: Order = {
        id: orderId,
        clientName: 'Client 1',
        products: [
          new Types.ObjectId('65b0278ecb65b02264abc61a'),
          new Types.ObjectId('65b0278ecb65b02264abc61a'),
        ],
      };

      jest.spyOn(ordersService, 'getOrder').mockResolvedValue(order);

      const result = await ordersController.getOrder(orderId);

      expect(result).toEqual(order);
    });

    it('should throw NotFoundException when order is not found', async () => {
      const orderId = '999';

      jest
        .spyOn(ordersService, 'getOrder')
        .mockRejectedValue(new NotFoundException());

      await expect(ordersController.getOrder(orderId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // Add more test cases for other controller methods as needed
});
