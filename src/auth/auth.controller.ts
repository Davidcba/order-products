import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('token')
  async createToken(@Body() payload: any): Promise<{ accessToken: string }> {
    // Implement authentication logic here (e.g., validate user credentials)
    const user = await this.authService.validateUser(
      payload.username,
      payload.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const accessToken = await this.authService.generateToken({
      sub: user.userId,
      username: user.username,
    });
    return { accessToken };
  }
}
