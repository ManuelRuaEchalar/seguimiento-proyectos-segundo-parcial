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

async getConfiguracionProyecto(userId: number) {
  // 1. Obtener el estudiante con su grupo
  const estudiante = await this.prisma.estudiante.findUnique({
    where: { id: userId },
    include: {
      grupo: true,
      proyecto: true,
    },
  });

  if (!estudiante) {
    throw new NotFoundException('Estudiante no encontrado');
  }

  if (!estudiante.grupo_id) {
    throw new NotFoundException('El estudiante no tiene un grupo asignado');
  }

  const grupoId = estudiante.grupo_id;
  const proyectoEmisorId = estudiante.proyecto_id;

  // 2. Obtener temas aprobados del grupo (documentos de fase "tema" aprobados)
  const actividadesTema = await this.prisma.actividad.findMany({
    where: {
      grupo_id: grupoId,
      fase: 'tema',
    },
    select: {
      id: true,
      documentos: {
        where: {
          estado: 'aprobado',
          proyecto_id: proyectoEmisorId,
        },
        select: {
          id: true,
          titulo: true,
        },
      },
    },
  });

  // Aplanar los documentos aprobados (temas)
  const temas = actividadesTema.flatMap(actividad =>
    actividad.documentos.map(doc => ({
      id: doc.id,
      titulo: doc.titulo,
    }))
  );

  // 3. Obtener estudiantes del mismo grupo (excepto el que hace la petición)
  const estudiantesGrupo = await this.prisma.estudiante.findMany({
    where: {
      grupo_id: grupoId,
      id: { not: userId },
    },
    include: {
      usuario: {
        select: {
          nombre: true,
          apellido: true,
        },
      },
      proyecto: {
        select: {
          id: true,
          titulo: true,
        },
      },
    },
  });

  // Formatear lista de estudiantes (id y nombre completo)
  const estudiantes = estudiantesGrupo.map(est => ({
    id: est.id,
    nombre: `${est.usuario.nombre} ${est.usuario.apellido}`,
  }));

  // 4. Obtener proyectos únicos de los compañeros del grupo
  const proyectosIds = new Set<number>();
  const proyectosMap = new Map<number, { id: number; titulo: string; estudiantes: { id: number; nombre: string }[] }>();

  for (const est of estudiantesGrupo) {
    if (est.proyecto_id && !proyectosIds.has(est.proyecto_id)) {
      proyectosIds.add(est.proyecto_id);

      // Obtener todos los estudiantes de este proyecto
      const estudiantesDelProyecto = await this.prisma.estudiante.findMany({
        where: {
          proyecto_id: est.proyecto_id,
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
        },
      });

      proyectosMap.set(est.proyecto_id, {
        id: est.proyecto.id,
        titulo: est.proyecto.titulo || 'Proyecto sin título',
        estudiantes: estudiantesDelProyecto.map(e => ({
          id: e.id, // ID del estudiante
          nombre: `${e.usuario.nombre} ${e.usuario.apellido}`,
        })),
      });
    }
  }

  const proyectos = Array.from(proyectosMap.values());

  return {
    emisor_id: userId,
    proyecto_emisor_id: proyectoEmisorId,
    temas,
    proyectos,
    estudiantes,
  };
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
          elementos: true,
          elementos_hechos: true,
          fase: true,
          fecha_inicio_tema: true,
          fecha_fin_tema: true,
          fecha_inicio_perfil: true,
          fecha_fin_perfil: true,
          fecha_inicio_proyecto: true,
          fecha_fin_proyecto: true,
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
              es_final: true,
              fase: true,
              estado: true,
            },
            orderBy: {
              fecha_creacion: 'desc',
            },
          },
        },
      },
      grupo_dos: {
        select: {
          id: true,
          nombre: true,
          grado: true,
          total_actividades: true,
          total_estudiantes: true,
          elementos: true,
          elementos_hechos: true,
          fase: true,
          fecha_inicio_tema: true,
          fecha_fin_tema: true,
          fecha_inicio_perfil: true,
          fecha_fin_perfil: true,
          fecha_inicio_proyecto: true,
          fecha_fin_proyecto: true,
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
              es_final: true,
              fase: true,
              estado: true,
            },
            orderBy: {
              fecha_creacion: 'desc',
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

  // Si grupo_dos_id es null, no se devuelve el campo grupo_dos
  if (!estudiante.grupo_dos_id) {
    delete (estudiante as any).grupo_dos;
  }

  return estudiante;
}


  async actualizarTituloProyecto(proyectoId: number, titulo: string) {
  // Verificar que el proyecto existe
  const proyectoExiste = await this.prisma.proyecto.findUnique({
    where: { id: proyectoId },
  });

  if (!proyectoExiste) {
    throw new NotFoundException('Proyecto no encontrado');
  }

  // Actualizar el título del proyecto
  const proyectoActualizado = await this.prisma.proyecto.update({
    where: { id: proyectoId },
    data: { titulo: titulo.trim() },
    select: {
      id: true,
      titulo: true,
      fase_actual: true,
      grado_actual: true,
    },
  });

  return {
    message: 'Título del proyecto actualizado correctamente',
    proyecto: proyectoActualizado,
  };
}
}
