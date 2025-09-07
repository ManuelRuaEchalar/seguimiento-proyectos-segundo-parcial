import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService, 
        private jwt: JwtService, 
        private config: ConfigService
    ) { }

    async signup(dto: AuthDto) {
        const hash = await argon.hash(dto.contraseña);
        
        try {
            // Usar transacción para crear usuario y la relación correspondiente
            const result = await this.prisma.$transaction(async (prisma) => {
                // Crear usuario
                const user = await prisma.usuario.create({
                    data: {
                        email: dto.email,
                        hash,
                        nombre: dto.nombre,
                        apellido: dto.apellido,
                        rol: dto.rol,
                    },
                    select: {
                        id: true,
                        email: true,
                        nombre: true,
                        apellido: true,
                        rol: true,
                    },
                });

                // Crear la relación correspondiente según el rol
                if (dto.rol === 'estudiante') {
                    if (!dto.cu || !dto.carrera) {
                        throw new BadRequestException('Para estudiantes se requiere: cu, carrera y grupo_id');
                    }
                    
                    await prisma.estudiante.create({
                        data: {
                            id: user.id,
                            cu: dto.cu,
                            carrera: dto.carrera,
                            grupo_id: dto.grupo_id,
                        },
                    });
                } else if (dto.rol === 'docente') {
                    // Verificar que se haya enviado el código docente
                    if (!dto.codigo_docente) {
                        throw new BadRequestException('Para docentes se requiere el código docente');
                    }
                    
                    // Verificar que el código docente sea correcto
                    if (dto.codigo_docente !== 2636) {
                        throw new ForbiddenException('Código docente incorrecto');
                    }
                    
                    // Crear grupo con el nombre del docente
                    const grupo = await prisma.grupo.create({
                        data: {
                            nombre: `${user.nombre} ${user.apellido}`,
                        },
                    });
                    
                    // Crear el docente con el ID del grupo creado
                    await prisma.docente.create({
                        data: {
                            id: user.id,
                            grupo_id: grupo.id,
                        },
                    });
                }
                // Si es admin, no se crea ninguna relación adicional

                return user;
            });
            //return token and rol
            const access_token = this.signToken(result.id, result.email);
            const rol = dto.rol;

            return { access_token, rol };
        } catch (error) {
            // Verifica por código de error directamente
            if (error.code === 'P2002') {
                throw new ForbiddenException('Credentials taken');
            }
            // Si es un BadRequestException o ForbiddenException, lo relanzamos
            if (error instanceof BadRequestException || error instanceof ForbiddenException) {
                throw error;
            }
            throw error;
        }
    }

    async signin(dto: AuthDto) {
        // find user by email
        const user = await this.prisma.usuario.findUnique({
            where: {
                email: dto.email,
            },
        });

        if (!user) {
            throw new ForbiddenException('Credentials incorrect');
        }

        // compare password
        const pwMatches = await argon.verify(user.hash, dto.contraseña);
        if (!pwMatches) {
            throw new ForbiddenException('Credentials incorrect');
        }

        const rol = user.rol;
        const access_token = this.signToken(user.id, user.email);
        return {access_token, rol};
    }

    async signToken(userId: number, email: string) {
        const payload = {
            sub: userId,
            email
        };
        const secret = this.config.get('JWT_SECRET');

        const token = await this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret: secret,
        });

        return {
            access_token: token,
        };
    }
}