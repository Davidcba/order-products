import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from "mongoose";
import { User } from './user.model';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async createUser(username: string, password: string): Promise<User> {
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user with the hashed password
      const newUser = new this.userModel({
        username,
        password: hashedPassword,
      });

      // Save the new user to the database
      return await newUser.save();
    } catch (error) {
      // Handle any errors that occur during the hashing process
      throw new Error('Failed to create user');
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      const user = await this.userModel.findOne({ username }).exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async findById(userId: string) {
    try {
      let id  = new Types.ObjectId(userId)
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }
}
