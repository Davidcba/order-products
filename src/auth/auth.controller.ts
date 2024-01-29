import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token')
  async createToken(@Body() payload: any): Promise<{ accessToken: string }> {
    const accessToken = await this.authService.generateToken(payload);
    return { accessToken };
  }
}
