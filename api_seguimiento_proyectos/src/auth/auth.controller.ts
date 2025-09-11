// ===== auth.controller.ts =====
import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('signup')
    async signup(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response) {
        const user = await this.authService.signup(dto);
        const access_token = await this.authService.signToken(user.id, user.email);

        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
        });

        return user; // Retorna los datos del usuario incluyendo grupo_id
    }

    @Post('signin')
    async signin(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response) {
        const user = await this.authService.signin(dto);
        const access_token = await this.authService.signToken(user.id, user.email);

        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
        });

        return user; // Retorna los datos del usuario incluyendo grupo_id
    }

    // Añadir endpoint de logout
    @Post('logout')
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('access_token');
        return { message: 'Logged out' };
    }
}