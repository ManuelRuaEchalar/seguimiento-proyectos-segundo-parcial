import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GrupoService {
    constructor(private prisma: PrismaService) {}

    async create(nombre: string) {
        return await this.prisma.grupo.create({
            data: {
                nombre,
            },
        });
    }

async findAll() {
    return await this.prisma.grupo.findMany();
}

    async findOne(id: number) {
        const grupo = await this.prisma.grupo.findUnique({
            where: { id },
            include: {
                estudiantes: {
                    include: {
                        usuario: {
                            select: {
                                nombre: true,
                                apellido: true,
                                email: true,
                                rol: true,
                            },
                        },
                    },
                },
                docentes: {
                    include: {
                        usuario: {
                            select: {
                                nombre: true,
                                apellido: true,
                                email: true,
                                rol: true,
                            },
                        },
                    },
                },
            },
        });

        if (!grupo) {
            throw new NotFoundException(`Grupo con ID ${id} no encontrado`);
        }

        return grupo;
    }

    async update(id: number, nombre: string) {
        try {
            return await this.prisma.grupo.update({
                where: { id },
                data: { nombre },
            });
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException(`Grupo con ID ${id} no encontrado`);
            }
            throw error;
        }
    }

    async remove(id: number) {
        try {
            return await this.prisma.grupo.delete({
                where: { id },
            });
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException(`Grupo con ID ${id} no encontrado`);
            }
            throw error;
        }
    }

    // Método específico para obtener grupos disponibles para estudiantes
    async getGruposDisponibles() {
        return await this.prisma.grupo.findMany({
            select: {
                id: true,
                nombre: true,
                _count: {
                    select: {
                        estudiantes: true,
                    },
                },
                docentes: {
                    include: {
                        usuario: {
                            select: {
                                nombre: true,
                                apellido: true,
                            },
                        },
                    },
                },
            },
        });
    }

    // Validar si un grupo existe
    async exists(id: number): Promise<boolean> {
        const grupo = await this.prisma.grupo.findUnique({
            where: { id },
        });
        return !!grupo;
    }
}