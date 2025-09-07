import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import type { Usuario } from '../../generated/prisma';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';


@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
    @Get('me')
    getMe(@GetUser() user: Usuario){


        return user;
    }


    @Patch()
    editUser() {}
}
