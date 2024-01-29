import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Param,
  InternalServerErrorException,
} from '@nestjs/common';
import { Express } from 'express';
import { ProductsService } from './product.service';
import { Product } from './product.model';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getProducts(): Promise<Product[]> {
    try {
      return await this.productsService.getProducts();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch products');
    }
  }

  @Get(':id')
  async getProduct(
    @Param('id') id: string,
  ): Promise<{ product: Product; image: Buffer }> {
    try {
      return await this.productsService.getProductWithImageByFilename(id, id);
    } catch (error) {
      if (error.status === 404) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch product with image',
      );
    }
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('file')
  async uploadFile(
    @Body() body: Product,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    try {
      return await this.productsService.createProduct(body, file);
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload file');
    }
  }
}
