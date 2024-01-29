import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(payload: any): Promise<string> {
    return this.jwtService.sign(payload);
  }
  async validateUser(payload: any): Promise<any> {
    // You can add your own user validation logic here
    //const user = this.users.find(u => u.userId === payload.sub);

    if (!payload) {
      throw new UnauthorizedException('Invalid user');
    }

    return payload;
  }
}
