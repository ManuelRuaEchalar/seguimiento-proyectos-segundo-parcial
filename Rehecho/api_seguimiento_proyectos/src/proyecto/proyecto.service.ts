import { Injectable, BadRequestException } from '@nestjs/common';
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

  
}
