import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './product.model';

@Injectable()
export class ProductsService {
  private readonly bucket: GridFSBucket;

  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
  ) {
    const mongooseConnection = this.productModel.db;
    this.bucket = new GridFSBucket(mongooseConnection.db, {
      bucketName: 'productImages',
    });
  }

  async createProduct(
    product: Product,
    file: Express.Multer.File,
  ): Promise<Product> {
    try {
      const newProduct = new this.productModel({
        ...product,
        picture: file.buffer,
      });

      await newProduct.save();

      const uploadStream = this.bucket.openUploadStream(newProduct.id, {
        metadata: { contentType: file.mimetype },
      });
      uploadStream.write(file.buffer);
      uploadStream.end();
      await new Promise((resolve, reject) => {
        uploadStream.on('finish', resolve);
        uploadStream.on('error', reject);
      });

      return newProduct;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async getProducts(): Promise<Product[]> {
    try {
      const resArr = await this.productModel.find().exec();
      resArr.forEach(function (obj) {
        obj.picture = undefined;
      });
      return resArr;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch products');
    }
  }

  async getProductWithImageByFilename(
    productId: string,
    filename: string,
  ): Promise<{ product: Product; image: Buffer }> {
    try {
      const product = await this.productModel.findById(productId);

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const fileDoc = await this.bucket.find({ filename }).limit(1).next();
      if (!fileDoc) {
        throw new NotFoundException('File not found');
      }

      const fileId = fileDoc._id;
      const chunks: any[] = [];

      return new Promise<{ product: Product; image: Buffer }>(
        (resolve, reject) => {
          const downloadStream = this.bucket.openDownloadStream(fileId);

          downloadStream.on('data', (chunk) => {
            chunks.push(chunk);
          });

          downloadStream.on('end', () => {
            const imageBuffer = Buffer.concat(chunks);
            resolve({ product, image: imageBuffer });
          });

          downloadStream.on('error', (error) => {
            reject(error);
          });
        },
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch product with image',
      );
    }
  }
}
