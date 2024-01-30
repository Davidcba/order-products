import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../users/user.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UserService,
  ) {}

  async generateToken(payload: any): Promise<string> {
    // Generate and return JWT token
    return this.jwtService.sign(payload);
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare provided password with stored hashed password
    const isPasswordValid = await this.comparePasswords(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // If password is valid, return user data
    return { userId: user.id, username: user.username };
  }

  async hashPassword(password: string): Promise<string> {
    // Generate hash of password using bcrypt
    return bcrypt.hash(password, 10);
  }

  async comparePasswords(
    enteredPassword: string,
    storedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(enteredPassword, storedPassword);
  }

  async validateUserById(userId: string): Promise<any> {
    // Assuming you have a method in your UserService to find a user by ID
    const user = await this.usersService.findById(userId);
    return user; // Return the user if found, otherwise return null
  }
}
