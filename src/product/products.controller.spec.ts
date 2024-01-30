import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './product.controller';
import { ProductsService } from './product.service';
import { Product } from './product.model';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('ProductsController', () => {
  let productsController: ProductsController;
  let productsService: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [ProductsService],
    }).compile();

    productsController = module.get<ProductsController>(ProductsController);
    productsService = module.get<ProductsService>(ProductsService);
  });

  describe('getProduct', () => {
    it('should return a product with image by ID', async () => {
      const productId = 'dummyId';
      // @ts-ignore
      const productData: Product = {
        name: 'Product 1',
        sku: 'SKU1',
        price: 10.99,
        picture: Buffer.from('dummy'),
        // Add other required properties here
      };
      const imageBuffer = Buffer.from('dummy');

      jest
        .spyOn(productsService, 'getProductWithImageByFilename')
        .mockResolvedValue({ product: productData, image: imageBuffer });

      const result = await productsController.getProduct(productId);

      expect(result.product).toEqual(productData);
      expect(result.image).toEqual(imageBuffer);
    });

    it('should throw NotFoundException when product is not found', async () => {
      const productId = 'nonExistentId';

      jest
        .spyOn(productsService, 'getProductWithImageByFilename')
        .mockRejectedValue(new NotFoundException());

      await expect(productsController.getProduct(productId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException when an error occurs', async () => {
      const productId = 'dummyId';

      jest
        .spyOn(productsService, 'getProductWithImageByFilename')
        .mockRejectedValue(new InternalServerErrorException());

      await expect(productsController.getProduct(productId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // Add more test cases for other controller methods as needed
});
