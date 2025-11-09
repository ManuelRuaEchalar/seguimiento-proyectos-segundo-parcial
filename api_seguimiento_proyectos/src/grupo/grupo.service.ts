import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GrupoService {
  constructor(private prisma: PrismaService) {}

  async asignarFechasGrupo(data: any): Promise<any> {
    const {
      id,
      fecha_inicio_tema,
      fecha_fin_tema,
      fecha_inicio_perfil,
      fecha_fin_perfil,
      fecha_inicio_proyecto,
      fecha_fin_proyecto,
    } = data;

    if (!id) {
      throw new Error('Debe proporcionar el ID del grupo.');
    }

    // Creamos un objeto con solo los campos presentes (no undefined)
    const updateData: any = {};

    if (fecha_inicio_tema && fecha_fin_tema) {
      updateData.fecha_inicio_tema = new Date(fecha_inicio_tema);
      updateData.fecha_fin_tema = new Date(fecha_fin_tema);
    }

    if (fecha_inicio_perfil && fecha_fin_perfil) {
      updateData.fecha_inicio_perfil = new Date(fecha_inicio_perfil);
      updateData.fecha_fin_perfil = new Date(fecha_fin_perfil);
    }

    if (fecha_inicio_proyecto && fecha_fin_proyecto) {
      updateData.fecha_inicio_proyecto = new Date(fecha_inicio_proyecto);
      updateData.fecha_fin_proyecto = new Date(fecha_fin_proyecto);
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No se enviaron fechas válidas para actualizar.');
    }

    // Actualizar y retornar el grupo completo
    const grupoActualizado = await this.prisma.grupo.update({
      where: { id },
      data: updateData,
    });

    // Retornar el grupo completo con todos sus campos
    return grupoActualizado;
  }

  async actualizarElementos(
    grupoId: number,
    elementos: any,
  ): Promise<{ message: string; grupo: any }> {
    try {
      // Verificar que el grupo existe
      const grupo = await this.prisma.grupo.findUnique({
        where: { id: grupoId },
      });

      if (!grupo) {
        throw new HttpException(
          'El grupo especificado no existe',
          HttpStatus.NOT_FOUND,
        );
      }

      // Actualizar los elementos del grupo
      const grupoActualizado = await this.prisma.grupo.update({
        where: { id: grupoId },
        data: {
          elementos: elementos,
        },
        include: {
          docente: {
            include: {
              usuario: {
                select: {
                  nombre: true,
                  apellido: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      return {
        message: 'Elementos del grupo actualizados exitosamente',
        grupo: grupoActualizado,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error al actualizar los elementos del grupo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(data: {
    nombre: string;
    grado: string;
    docente_id?: number;
  }): Promise<any> {
    // Determinar la fase según el grado
    let fase = 'tema';
    if (data.grado === 'grado2') {
      fase = 'proyecto';
    }

    return this.prisma.grupo.create({
      data: {
        nombre: data.nombre,
        grado:
          data.grado as any as import('../../node_modules/.prisma/client').$Enums.Grado,
        docente_id: data.docente_id,
        fase,
      },
      include: {
        docente: true,
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

  async obtenerGruposFinal(): Promise<any[]> {
    const grupos = await this.prisma.grupo.findMany({
      where: { grado: 'grado2' },
      select: {
        id: true,
        nombre: true,
        grado: true,
        docente: {
          select: {
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

    // Combinar nombre y apellido del docente en una sola propiedad
    return grupos.map((g) => ({
      id: g.id,
      nombre: g.nombre,
      grado: g.grado,
      docente_nombre_completo: g.docente
        ? `${g.docente.usuario.nombre} ${g.docente.usuario.apellido}`
        : 'Sin docente asignado',
    }));
  }

  async unirseAGrupoGrado2(userId: number, grupoId: number): Promise<any> {
    // Buscar el grupo y verificar su grado
    const grupo = await this.prisma.grupo.findUnique({
      where: { id: grupoId },
      select: { id: true, grado: true, nombre: true },
    });

    if (!grupo) {
      throw new HttpException(
        'El grupo especificado no existe',
        HttpStatus.NOT_FOUND,
      );
    }

    if (grupo.grado !== 'grado2') {
      throw new HttpException(
        'Solo puedes unirte a grupos de grado2',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Buscar el estudiante asociado al usuario
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: userId },
      select: { id: true, grupo_dos_id: true },
    });

    if (!estudiante) {
      throw new HttpException(
        'No se encontró el registro del estudiante',
        HttpStatus.NOT_FOUND,
      );
    }

    // Evitar duplicados
    if (estudiante.grupo_dos_id) {
      throw new HttpException(
        'Ya estás asignado a un grupo de grado2',
        HttpStatus.CONFLICT,
      );
    }

    // Actualizar el registro del estudiante
    const actualizado = await this.prisma.estudiante.update({
      where: { id: userId },
      data: { grupo_dos_id: grupoId },
      select: {
        id: true,
        grupo_dos: {
          select: {
            id: true,
            nombre: true,
            grado: true,
          },
        },
      },
    });

    return {
      message: `Te has unido correctamente al grupo ${actualizado.grupo_dos.nombre}`,
      grupo: actualizado.grupo_dos,
    };
  }

  async obtenerEstudiantesDeGrupo(grupoId: number) {
    const estudiantes = await this.prisma.estudiante.findMany({
      where: { grupo_id: grupoId },
      select: {
        id: true,
        cu: true,
        carrera: true,
        proyecto_id: true,
        proyecto: {
          select: {
            titulo: true,
          },
        },
        usuario: {
          select: {
            nombre: true,
            apellido: true,
            email: true,
          },
        },
      },
    });

    return estudiantes.map(est => ({
      id: est.id,
      nombre_completo: `${est.usuario.nombre} ${est.usuario.apellido}`,
      carrera: est.carrera,
      cu: est.cu,
      correo: est.usuario.email,
      proyecto_id: est.proyecto_id,
      titulo_proyecto: est.proyecto?.titulo || null,
    }));
  }
}