import { Controller, Get, UseGuards, Post, Body, Put } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  getProfile(@GetUser('id') userId: number) {
    return this.userService.getProfile(userId);
  }

  @Get('me')
  getMe(@GetUser() user: any) {
    return { message: 'Mis datos', user };
  }

  @Post('join-group')
  joinGroup(@GetUser('id') userId: number, @Body('group_id') groupId: number) {
    return this.userService.joinGroup(userId, groupId);
  }

  @Put()
  updateUser(@GetUser('id') userId: number, @Body() body: any) {
    return this.userService.updateUser(userId, body);
  }
}
