import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProyectoService {
  constructor(private prisma: PrismaService) {}

  async createProyecto(titulo: string) {
    if (!titulo || typeof titulo !== 'string') {
      throw new BadRequestException('El título del proyecto es obligatorio y debe ser texto.');
    }

    const nuevoProyecto = await this.prisma.proyecto.create({
      data: {
        titulo,
        fase_actual: 'tema',
        grado_actual: 'grado1',
      },
      select: {
        id: true,
        titulo: true,
        fase_actual: true,
        grado_actual: true,
      },
    });

    return {
      message: 'Proyecto creado exitosamente',
      proyecto: nuevoProyecto,
    };
  }

  async cambiarFase(id: number) {
    if (!id || typeof id !== 'number') {
      throw new BadRequestException('El ID del proyecto es obligatorio y debe ser numérico.');
    }

    const proyecto = await this.prisma.proyecto.findUnique({ where: { id } });
    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado.');
    }

    const ordenFases = ['tema', 'perfil', 'proyecto'] as const;
    const indiceActual = ordenFases.indexOf(proyecto.fase_actual as any);

    if (indiceActual === -1) {
      throw new BadRequestException('La fase actual no es válida.');
    }

    if (indiceActual === ordenFases.length - 1) {
      throw new BadRequestException('El proyecto ya está en la última fase.');
    }

    const siguienteFase = ordenFases[indiceActual + 1];

    const proyectoActualizado = await this.prisma.proyecto.update({
      where: { id },
      data: { fase_actual: siguienteFase },
      select: {
        id: true,
        titulo: true,
        fase_actual: true,
      },
    });

    return {
      message: `Fase cambiada exitosamente a "${siguienteFase}"`,
      proyecto: proyectoActualizado,
    };
  }
}
