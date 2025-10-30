import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocenteService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.docente.findMany({
      include: {
        usuario: {
          select: { id: true, nombre: true, apellido: true, email: true },
        },
        grupos: {
          select: { id: true, nombre: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const docente = await this.prisma.docente.findUnique({
      where: { id },
      include: {
        usuario: {
          select: { id: true, nombre: true, apellido: true, email: true },
        },
        grupos: {
          select: { id: true, nombre: true },
        },
      },
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }
    return docente;
  }

  async getInfoByUserId(userId: number) {
    const docente = await this.prisma.docente.findFirst({
      where: { id: userId },
      include: {
        usuario: {
          select: { id: true, nombre: true, apellido: true, email: true, rol: true },
        },
        grupos: {
          select: {
            id: true,
            nombre: true,
            grado: true,
            elementos: true,
            elementos_hechos: true,
            total_actividades: true,
            total_estudiantes: true,
            fase: true,
            fecha_ultima_actividad: true,
          },
        },
      },
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    return docente;
  }
}
