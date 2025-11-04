import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          console.log('Cookie recibida:', request.cookies); // Depuración
          return request?.cookies?.access_token;
        },
      ]),
      secretOrKey: config.get('JWT_SECRET'),
      ignoreExpiration: false, // Asegura que los tokens expirados fallen
    });
  }

  async validate(payload: { sub: number; email: string }) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return { id: user.id, email: user.email, rol: user.rol }; // Simplificado para depuración
  }
}
