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
                });

                let grupoId: number | null = null;

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
                    grupoId = dto.grupo_id;
                } else if (dto.rol === 'docente') {
                    if (!dto.codigo_docente) {
                        throw new BadRequestException('Para docentes se requiere el código docente');
                    }

                    if (dto.codigo_docente !== 2636) {
                        throw new ForbiddenException('Código docente incorrecto');
                    }

                    const grupo = await prisma.grupo.create({
                        data: {
                            nombre: `${user.nombre} ${user.apellido}`,
                        },
                    });

                    await prisma.docente.create({
                        data: {
                            id: user.id,
                            grupo_id: grupo.id,
                        },
                    });
                    grupoId = grupo.id;
                }

                // Retornar datos del usuario con grupo_id
                return {
                    id: user.id,
                    email: user.email,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    rol: user.rol,
                    grupo_id: grupoId,
                };
            });

            return result;
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ForbiddenException('Credentials taken');
            }
            if (error instanceof BadRequestException || error instanceof ForbiddenException) {
                throw error;
            }
            throw error;
        }
    }

    async signin(dto: AuthDto) {
        // Buscar usuario incluyendo relaciones
        const user = await this.prisma.usuario.findUnique({
            where: { email: dto.email },
            include: {
                estudiante: true,
                docente: true,
            },
        });

        if (!user) throw new ForbiddenException('Credentials incorrect');

        const pwMatches = await argon.verify(user.hash, dto.contraseña);
        if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

        // Obtener grupo_id según el rol
        let grupoId: number | null = null;
        if (user.rol === 'estudiante' && user.estudiante) {
            grupoId = user.estudiante.grupo_id;
        } else if (user.rol === 'docente' && user.docente) {
            grupoId = user.docente.grupo_id;
        }

        // Retornar datos del usuario sin el hash
        const { hash, ...userWithoutHash } = user;
        return {
            ...userWithoutHash,
            grupo_id: grupoId,
        };
    }

    async signToken(userId: number, email: string): Promise<string> {
        const payload = { sub: userId, email };
        const secret = this.config.get('JWT_SECRET');
        return this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret: secret,
        });
    }

}