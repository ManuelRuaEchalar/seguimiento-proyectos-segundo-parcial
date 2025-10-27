import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
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
          select: { id: true, nombre: true, grado: true },
        },
        usuario: {
          select: { nombre: true, apellido: true, email: true, rol: true },
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
          select: { id: true, titulo: true, fase_actual: true, grado_actual: true },
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

    if (cu && typeof cu !== 'string') throw new BadRequestException('CU inválido');
    if (carrera && typeof carrera !== 'string') throw new BadRequestException('Carrera inválida');

    return this.prisma.estudiante.update({
      where: { id: userId },
      data: { ...(cu && { cu }), ...(carrera && { carrera }) },
      select: {
        id: true,
        cu: true,
        carrera: true,
        usuario: { select: { nombre: true, apellido: true, email: true } },
      },
    });
  }

  async asignarProyecto(userId: number, proyectoId: number) {
    const estudiante = await this.prisma.estudiante.findUnique({ where: { id: userId } });
    if (!estudiante) throw new BadRequestException('Estudiante no encontrado');

    const proyecto = await this.prisma.proyecto.findUnique({ where: { id: proyectoId } });
    if (!proyecto) throw new BadRequestException('Proyecto no encontrado');

    const actualizado = await this.prisma.estudiante.update({
      where: { id: userId },
      data: { proyecto_id: proyectoId },
      select: {
        id: true,
        cu: true,
        carrera: true,
        proyecto: { select: { id: true, titulo: true, fase_actual: true, grado_actual: true } },
      },
    });

    return { message: 'Proyecto asignado exitosamente', estudiante: actualizado };
  }

  async viewProyect(id: number) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id },
      include: {
        proyecto: {
          include: {
            documentos: {
              select: {
                id: true,
                titulo: true,
                version: true,
                file: true,
                estado: true,
                created_at: true,
              },
            },
          },
        },
      },
    });

    if (!estudiante) throw new NotFoundException('Estudiante no encontrado');
    if (!estudiante.proyecto) throw new NotFoundException('El estudiante no tiene un proyecto asignado');

    const proyecto = estudiante.proyecto;
    return {
      id: proyecto.id,
      titulo: proyecto.titulo,
      fase_actual: proyecto.fase_actual,
      grado_actual: proyecto.grado_actual,
      documentos: proyecto.documentos,
    };
  }

  async getEstudianteById(requesterId: number, id: number) {
    // 1️⃣ Buscar quién está haciendo la solicitud
    const requester = await this.prisma.usuario.findUnique({
      where: { id: requesterId },
      select: { rol: true },
    });

    if (!requester) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // 2️⃣ Validar que el solicitante sea DOCENTE o ADMIN
    if (requester.rol !== 'docente' && requester.rol !== 'admin') {
      throw new ForbiddenException('Solo docentes y administradores pueden acceder a esta información');
    }

    // 3️⃣ Buscar estudiante solicitado
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id },
      include: {
        usuario: { 
          select: { 
            nombre: true, 
            apellido: true, 
            email: true, 
            rol: true 
          } 
        },
        grupo: { 
          select: { 
            id: true, 
            nombre: true, 
            grado: true 
          } 
        },
        proyecto: { 
          select: { 
            id: true, 
            titulo: true,
            fase_actual: true,
            grado_actual: true
          } 
        },
      },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return estudiante;
  }

    async getInfoByUserId(userId: number) {
    const estudiante = await this.prisma.estudiante.findFirst({
      where: { id: userId },
      include: {
        usuario: {
          select: { 
            id: true, 
            nombre: true, 
            apellido: true, 
            email: true, 
            rol: true 
          },
        },
        grupo: {
          select: {
            id: true,
            nombre: true,
            grado: true,
            total_actividades: true,
            total_estudiantes: true,
            fase: true,
            fecha_ultima_actividad: true,
            docente: {
              select: {
                id: true,
                especialidad: true,
                usuario: {
                  select: {
                    nombre: true,
                    apellido: true,
                    email: true,
                  },
                },
              },
            },
            actividades: {
              select: {
                id: true,
                nombre: true,
                descripcion: true,
                elementos: true,
                fecha_creacion: true,
                estado: true,
              },
              orderBy: {
                fecha_creacion: 'desc', // Más recientes primero
              },
            },
          },
        },
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

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return estudiante;
  }
}
