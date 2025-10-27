import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class ActividadService {
  async crearActividad(data: {
    nombre: string;
    elementos: any;
    descripcion?: string;
    grupo_id: number;
  }) {
    try {
      // Verificar que el grupo existe
      const grupo = await prisma.grupo.findUnique({
        where: { id: data.grupo_id }
      });

      if (!grupo) {
        throw new HttpException('El grupo especificado no existe', HttpStatus.NOT_FOUND);
      }

      const actividad = await prisma.actividad.create({
        data: {
          nombre: data.nombre,
          elementos: data.elementos,
          descripcion: data.descripcion,
          grupo_id: data.grupo_id,
          estado: 'activo'
        },
        include: {
          grupo: {
            select: {
              id: true,
              nombre: true
            }
          }
        }
      });

      // Actualizar el contador de actividades del grupo
      await prisma.grupo.update({
        where: { id: data.grupo_id },
        data: {
          total_actividades: { increment: 1 },
          fecha_ultima_actividad: new Date()
        }
      });

      return {
        message: 'Actividad creada exitosamente',
        actividad
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error al crear la actividad',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async borrarActividad(id: number) {
    try {
      const actividad = await prisma.actividad.findUnique({
        where: { id }
      });

      if (!actividad) {
        throw new HttpException('Actividad no encontrada', HttpStatus.NOT_FOUND);
      }

      await prisma.actividad.delete({
        where: { id }
      });

      // Actualizar el contador de actividades del grupo
      await prisma.grupo.update({
        where: { id: actividad.grupo_id },
        data: {
          total_actividades: { decrement: 1 }
        }
      });

      return {
        message: 'Actividad borrada exitosamente',
        id
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error al borrar la actividad',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async editarActividad(id: number, data: {
    nombre?: string;
    elementos?: any;
    descripcion?: string;
    estado?: string;
  }) {
    try {
      const actividad = await prisma.actividad.findUnique({
        where: { id }
      });

      if (!actividad) {
        throw new HttpException('Actividad no encontrada', HttpStatus.NOT_FOUND);
      }

      const actividadActualizada = await prisma.actividad.update({
        where: { id },
        data: {
          ...(data.nombre && { nombre: data.nombre }),
          ...(data.elementos && { elementos: data.elementos }),
          ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
          ...(data.estado && { estado: data.estado as any })
        },
        include: {
          grupo: {
            select: {
              id: true,
              nombre: true
            }
          }
        }
      });

      return {
        message: 'Actividad actualizada exitosamente',
        actividad: actividadActualizada
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error al editar la actividad',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async obtenerActividadesPorGrupo(grupoId: number) {
    try {
      const grupo = await prisma.grupo.findUnique({
        where: { id: grupoId }
      });

      if (!grupo) {
        throw new HttpException('Grupo no encontrado', HttpStatus.NOT_FOUND);
      }

      const actividades = await prisma.actividad.findMany({
        where: { grupo_id: grupoId },
        include: {
          grupo: {
            select: {
              id: true,
              nombre: true,
              grado: true
            }
          }
        },
        orderBy: {
          fecha_creacion: 'desc'
        }
      });

      return {
        grupo: {
          id: grupo.id,
          nombre: grupo.nombre,
          grado: grupo.grado
        },
        actividades,
        total: actividades.length
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error al obtener las actividades',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}