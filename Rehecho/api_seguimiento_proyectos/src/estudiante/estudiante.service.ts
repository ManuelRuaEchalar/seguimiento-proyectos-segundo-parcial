import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EstudianteService {
  constructor(private prisma: PrismaService) {}

  // Obtener datos del estudiante y su usuario
  async getProfile(userId: number) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: userId },
      select: {
        id: true,
        cu: true,
        carrera: true,
        proyecto_id: true,
        grupo: {
          select: {
            id: true,
            nombre: true,
            grado: true,
          },
        },
        usuario: {
          select: {
            nombre: true,
            apellido: true,
            email: true,
            rol: true,
          },
        },
      },
    });

    if (!estudiante) throw new NotFoundException('Estudiante no encontrado');
    return estudiante;
  }

  // Obtener el proyecto asociado al estudiante
  async getProyecto(userId: number) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: userId },
      include: {
        proyecto: {
          select: {
            id: true,
            titulo: true,
            fase_actual: true,
            grado_actual: true,
          },
        },
      },
    });

    if (!estudiante) throw new NotFoundException('Estudiante no encontrado');
    if (!estudiante.proyecto) throw new NotFoundException('No tiene proyecto asignado');

    return estudiante.proyecto;
  }

  // Actualizar datos del estudiante (por ejemplo CU o carrera)
  async updateEstudiante(userId: number, body: any) {
    const { cu, carrera } = body;

    if (cu && typeof cu !== 'string') {
      throw new BadRequestException('CU inválido');
    }
    if (carrera && typeof carrera !== 'string') {
      throw new BadRequestException('Carrera inválida');
    }

    return this.prisma.estudiante.update({
      where: { id: userId },
      data: {
        ...(cu && { cu }),
        ...(carrera && { carrera }),
      },
      select: {
        id: true,
        cu: true,
        carrera: true,
        usuario: {
          select: {
            nombre: true,
            apellido: true,
            email: true,
          },
        },
      },
    });
  }

  async asignarProyecto(userId: number, proyectoId: number) {
  const estudiante = await this.prisma.estudiante.findUnique({
    where: { id: userId },
  });

  if (!estudiante) {
    throw new BadRequestException('Estudiante no encontrado');
  }

  const proyecto = await this.prisma.proyecto.findUnique({
    where: { id: proyectoId },
  });

  if (!proyecto) {
    throw new BadRequestException('Proyecto no encontrado');
  }

  const actualizado = await this.prisma.estudiante.update({
    where: { id: userId },
    data: { proyecto_id: proyectoId },
    select: {
      id: true,
      cu: true,
      carrera: true,
      proyecto: {
        select: {
          id: true,
          titulo: true,
          fase_actual: true,
          grado_actual: true,
        },
      },
    },
  });

  return {
    message: 'Proyecto asignado exitosamente',
    estudiante: actualizado,
  };
}
}
