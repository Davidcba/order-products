import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './product/product.module';
import { OrdersModule } from './order/order.module';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import * as process from 'process';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './users/user.module';

dotenv.config();
@Module({
  imports: [
    AuthModule,
    MongooseModule.forRoot(process.env.MONGO_URI, {}),
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Replace with your actual secret key
      signOptions: { expiresIn: '1h' }, // Define token expiration time
    }),
    ProductsModule,
    OrdersModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
