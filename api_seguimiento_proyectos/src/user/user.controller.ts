import { Controller, Get, Patch, UnauthorizedException, UseGuards, Req } from '@nestjs/common';
import type { Usuario } from '../../generated/prisma';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { Request as ExpressRequest } from 'express';

interface RequestWithCookies extends ExpressRequest {
  cookies: { [key: string]: string };
}

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  @Get('me')
  getMe(@Req() req: RequestWithCookies, @GetUser() user: Usuario) {
    if (!req.cookies?.access_token) {
      throw new UnauthorizedException();
    }
    return user;
  }

  @Patch()
  editUser() {}
}
