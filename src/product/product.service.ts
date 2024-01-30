import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { Model, Types } from "mongoose";
import { GridFSBucket } from "mongodb";
import { InjectModel } from "@nestjs/mongoose";
import { Product } from "./product.model";

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
  async getTotalPrice(productIds: Types.ObjectId[] | string[]) {
    const idCount = {};
    const resultPrices = {};
    if (Array.isArray(productIds)) {
      productIds = productIds.map((id) => {
        return typeof id === 'string' ? new Types.ObjectId(id) : id;
      });
    } else {
      throw new Error('Invalid productIds');
    }
    // Count how many items inside the id array.
    productIds.forEach((id) => {
      idCount[id._id] = (idCount[id._id] || 0) + 1;
    });
    console.log(idCount);
    try {
      // Find all products by their IDs
      const products = await this.productModel.find({
        _id: { $in: productIds },
      });
      // Count the price of each different item
      products.forEach((product) => {
        resultPrices[product._id] = product.price;
      });
      //Here I validate the total of each type of product.
      const totalPricePerProduct = Object.keys(idCount).map((id) => ({
        name: id,
        sumValue: idCount[id] * resultPrices[id],
      }));
      // And as last step I calculate the total price product
      return totalPricePerProduct.reduce((acc, obj) => acc + obj.sumValue, 0);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while fetching total order price',
      );
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
