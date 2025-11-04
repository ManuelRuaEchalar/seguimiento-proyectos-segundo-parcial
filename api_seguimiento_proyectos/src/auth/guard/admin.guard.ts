import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('Usuario autenticado:', user); // Depuración

    if (!user || !user.id) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const dbUser = await this.prisma.usuario.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    console.log('Usuario de DB:', dbUser); // Depuración
    return dbUser.rol === 'admin';
  }
}
