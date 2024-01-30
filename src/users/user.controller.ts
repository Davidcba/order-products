import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  async createUser(@Body() body: { username: string; password: string }) {
    const { username, password } = body;
    return this.userService.createUser(username, password);
  }
}
