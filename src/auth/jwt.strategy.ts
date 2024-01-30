import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import * as dotenv from 'dotenv';
import * as process from 'process';
dotenv.config();
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET, // Use your own secret key here
    });
  }

  async validate(payload: any) {
    // Here, the payload contains decoded token data, not username and password
    const { sub } = payload; // Extract user information from the payload
    const user = await this.authService.validateUserById(sub); // Assuming you have a method to validate user by ID
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
