import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto';
import { LoginDto } from './dto/login.dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async login(loginDto: LoginDto, res: Response) {
    console.log('Intentando login con email:', loginDto.email);
    const user = await this.prisma.usuario.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      console.log('Usuario no encontrado');
      throw new BadRequestException('Credenciales inválidas');
    }

    console.log('Usuario encontrado, verificando contraseña');
    const passwordMatches = await argon.verify(user.hash, loginDto.password);
    if (!passwordMatches) {
      console.log('Contraseña incorrecta');
      throw new BadRequestException('Credenciales inválidas');
    }

    console.log('Contraseña verificada, generando token');
    const token = await this.signToken(user.id, user.email);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 1 día
    });

    console.log('Token generado y cookie establecida');
    return res.status(200).json({
      message: 'Login exitoso',
      user: { id: user.id, email: user.email, rol: user.rol },
    });
  }

  async register(registerDto: RegisterDto) {
    if (registerDto.rol !== 'estudiante') {
      throw new ForbiddenException('Solo los estudiantes pueden registrarse');
    }

    const hash = await argon.hash(registerDto.password);
    try {
      const user = await this.prisma.usuario.create({
        data: {
          nombre: registerDto.nombre,
          apellido: registerDto.apellido,
          email: registerDto.email,
          hash,
          rol: registerDto.rol,
          estudiante: {
            create: {
              cu: registerDto.cu,
              carrera: registerDto.carrera,
            },
          },
        },
      });
      return {
        message: 'Usuario creado',
        user: { id: user.id, email: user.email, rol: user.rol },
      };
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('El email ya está en uso');
      }
      throw error;
    }
  }

  async signToken(userId: number, email: string): Promise<string> {
    const payload = { sub: userId, email };
    return this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '15m',
    });
  }
  async logout(res: Response) {
    res.clearCookie('access_token');
    return res.status(200).json({ message: 'Logout exitoso' });
  }
}
