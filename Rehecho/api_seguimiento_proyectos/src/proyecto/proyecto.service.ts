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

  async obtenerProyecto(id: number) {
    if (!id || typeof id !== 'number') {
      throw new BadRequestException('El ID del proyecto es obligatorio y debe ser numérico.');
    }

    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id },
    });

    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado.');
    }

    return {
      message: 'Proyecto obtenido exitosamente',
      proyecto,
    };
  }
}

/**
 * Servicio para obtener todos los datos de un proyecto
 */
export async function fetchProyectoById(id: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL no está configurada');
  }

  const response = await fetch(`${apiUrl}/proyecto/obtener`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 🔒 Envia cookies (JWT)
    body: JSON.stringify({ id }),
  });

  console.log(`Solicitud a ${apiUrl}/proyecto/obtener con body:`, { id });

  if (!response.ok) {
    console.error('Error en la respuesta del servidor:', response.status, response.statusText);
    throw new Error('Error al obtener el proyecto');
  }

  const data = await response.json();
  console.log('Respuesta del servidor:', data);
  return data;
}
