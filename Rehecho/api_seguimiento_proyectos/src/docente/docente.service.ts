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
          select: { id: true },
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
          select: { id: true },
        },
      },
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }
    return docente;
  }
}
