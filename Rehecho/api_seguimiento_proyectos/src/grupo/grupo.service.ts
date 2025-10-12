import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GrupoService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    nombre: string;
    grado: string;
    docente_id?: number;
  }): Promise<any> {
    return this.prisma.grupo.create({
      data: {
        nombre: data.nombre,
        grado:
          data.grado as any as import('../../node_modules/.prisma/client').$Enums.Grado,
        docente_id: data.docente_id,
      },
      include: {
        docente: true, // Relación correcta
      },
    });
  }

  async findAll(): Promise<any[]> {
    return this.prisma.grupo.findMany({
      include: {
        docente: {
          include: {
            usuario: {
              select: {
                nombre: true,
                apellido: true,
              },
            },
          },
        },
        estudiantes: {
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

  async findOne(id: number): Promise<any> {
    return this.prisma.grupo.findUnique({
      where: { id },
      include: {
        docente: true, // Relación correcta
      },
    });
  }
}
