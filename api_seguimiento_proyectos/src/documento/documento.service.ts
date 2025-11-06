import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { File as MulterFile } from 'multer';
import { Response } from 'express';
import * as path from 'path';
import { $Enums } from '@prisma/client';
import { version } from 'os';

@Injectable()
export class DocumentoService {
  constructor(private prisma: PrismaService) { }

  // 🔥 NUEVO: Método optimizado que solo retorna URL
async getDocUrl(id: number) {
  if (!id || isNaN(id) || id <= 0) {
    throw new BadRequestException('El ID del documento debe ser un número positivo');
  }

  const documento = await this.prisma.documento.findUnique({
    where: { id },
    select: {
      id: true,
      file: true,
      titulo: true,
      version: true,
      created_at: true,
      // Agrega otros campos que necesites
    }
  });

  if (!documento) {
    throw new NotFoundException('Documento no encontrado');
  }

  // Construir URL pública (accesible directamente desde Nginx)
  const publicUrl = documento.file.startsWith('/') 
    ? documento.file 
    : `/${documento.file}`;

  return {
    id: documento.id,
    url: publicUrl, // Ejemplo: /uploads/documentos/archivo_123456.pdf
    titulo: documento.titulo,
    version: documento.version,
    created_at: documento.created_at
  };
}

// Optimizar método existente (eliminar verificaciones innecesarias de filesystem)
async getDoc(id: number) {
  if (!id || isNaN(id) || id <= 0) {
    throw new BadRequestException('El ID del documento debe ser un número positivo');
  }

  const documento = await this.prisma.documento.findUnique({
    where: { id },
    select: {
      file: true,
    }
  });

  if (!documento) {
    throw new NotFoundException('Documento no encontrado en la base de datos');
  }

  const relativePath = documento.file;
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  const absolutePath = path.join(process.cwd(), 'public', cleanPath);

  // ⚠️ ELIMINAR validación de existencia física - deja que Nginx lo maneje
  // Esta validación causa latencia innecesaria
  
  return {
    filePath: absolutePath,
    mimeType: 'application/pdf', // Simplificado
  };
}

  async getTeacherObservations(
  docenteId: number,
  estudianteId: number,
  actividadId: number
) {
  // 1. Verificar que el docente existe
  const docente = await this.prisma.usuario.findFirst({
    where: { id: docenteId },
  });

  if (!docente) {
    throw new NotFoundException('Docente no encontrado');
  }

  // 2. Obtener el estudiante con su proyecto
  const estudiante = await this.prisma.estudiante.findFirst({
    where: { id: estudianteId },
    select: {
      id: true,
      proyecto_id: true,
      proyecto: {
        select: {
          id: true,
          titulo: true,
        },
      },
    },
  });

  if (!estudiante) {
    throw new NotFoundException('Estudiante no encontrado');
  }

  if (!estudiante.proyecto_id) {
    throw new NotFoundException('El estudiante no tiene un proyecto asignado');
  }

  // 3. Verificar que la actividad existe
  const actividad = await this.prisma.actividad.findUnique({
    where: { id: actividadId },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
    },
  });

  if (!actividad) {
    throw new NotFoundException('Actividad no encontrada');
  }

  // 4. Obtener los documentos del proyecto y actividad con sus observaciones y correcciones
  const documentos = await this.prisma.documento.findMany({
    where: {
      proyecto_id: estudiante.proyecto_id,
      actividad_id: actividadId,
    },
    select: {
      id: true,
      titulo: true,
      version: true,
      file: true,
      estado: true,
      justificacion: true,
      created_at: true,
      observaciones: {
        select: {
          id: true,
          content_text: true,
          comment_text: true,
          comment_emoji: true,
          estado: true,
          bounding_x1: true,
          bounding_y1: true,
          bounding_x2: true,
          bounding_y2: true,
          bounding_page: true,
          rects: true,
          correccion: {
            select: {
              id: true,
              content_text: true,
              comment_text: true,
              comment_emoji: true,
              estado: true,
              bounding_x1: true,
              bounding_y1: true,
              bounding_x2: true,
              bounding_y2: true,
              bounding_page: true,
              rects: true,
            },
          },
        },
        orderBy: {
          id: 'desc',
        },
      },
      correcciones: {
        select: {
          id: true,
          content_text: true,
          comment_text: true,
          comment_emoji: true,
          estado: true,
          bounding_x1: true,
          bounding_y1: true,
          bounding_x2: true,
          bounding_y2: true,
          bounding_page: true,
          rects: true,
          observacion_id: true,
        },
        orderBy: {
          id: 'desc',
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  // 5. Calcular estadísticas
  const totalObservaciones = documentos.reduce(
    (sum, doc) => sum + doc.observaciones.length,
    0
  );
  const totalCorrecciones = documentos.reduce(
    (sum, doc) => sum + doc.correcciones.length,
    0
  );

  return {
    estudiante: {
      id: estudiante.id,
      proyecto_id: estudiante.proyecto_id,
      proyecto_titulo: estudiante.proyecto?.titulo,
    },
    actividad: {
      id: actividad.id,
      nombre: actividad.nombre,
      descripcion: actividad.descripcion,
    },
    estadisticas: {
      total_documentos: documentos.length,
      total_observaciones: totalObservaciones,
      total_correcciones: totalCorrecciones,
    },
    documentos,
  };
}

  async getStudentDocuments(userId: number, actividadId: number) {
  // 1. Obtener el estudiante con su proyecto
  const estudiante = await this.prisma.estudiante.findFirst({
    where: { id: userId },
    select: {
      id: true,
      proyecto_id: true,
    },
  });

  if (!estudiante) {
    throw new NotFoundException('Estudiante no encontrado');
  }

  if (!estudiante.proyecto_id) {
    throw new NotFoundException('El estudiante no tiene un proyecto asignado');
  }

  // 2. Verificar que la actividad existe y obtener es_final
  const actividad = await this.prisma.actividad.findUnique({
    where: { id: actividadId },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      es_final: true,
    },
  });

  if (!actividad) {
    throw new NotFoundException('Actividad no encontrada');
  }

  // 3. Si es actividad final, retornar finales en lugar de documentos
  if (actividad.es_final) {
    const finales = await this.prisma.final.findMany({
      where: {
        proyecto_id: estudiante.proyecto_id,
        actividad_id: actividadId,
      },
      include: {
        tags: {
          select: {
            id: true,
            nombre: true,
          },
        },
        actividad: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    return {
      proyecto_id: estudiante.proyecto_id,
      actividad_id: actividadId,
      es_final: true,
      total_finales: finales.length,
      finales,
    };
  }

  // 4. Flujo normal: Obtener documentos si no es actividad final
  const documentos = await this.prisma.documento.findMany({
    where: {
      proyecto_id: estudiante.proyecto_id,
      actividad_id: actividadId,
    },
    include: {
      observaciones: {
        select: {
          id: true,
          content_text: true,
          comment_text: true,
          comment_emoji: true,
          estado: true,
          bounding_x1: true,
          bounding_y1: true,
          bounding_x2: true,
          bounding_y2: true,
          bounding_page: true,
          rects: true,
        },
        orderBy: {
          id: 'desc',
        },
      },
      correcciones: {
        select: {
          id: true,
          content_text: true,
          comment_text: true,
          comment_emoji: true,
          estado: true,
          bounding_x1: true,
          bounding_y1: true,
          bounding_x2: true,
          bounding_y2: true,
          bounding_page: true,
          rects: true,
          observacion_id: true,
        },
        orderBy: {
          id: 'desc',
        },
      },
      actividad: {
        select: {
          id: true,
          nombre: true,
          descripcion: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  return {
    proyecto_id: estudiante.proyecto_id,
    actividad_id: actividadId,
    es_final: false,
    total_documentos: documentos.length,
    documentos,
  };
}

async getActivityDocs(actividadId: number) {
  // Validar el ID
  if (!actividadId || isNaN(actividadId) || actividadId <= 0) {
    throw new BadRequestException('El ID de la actividad debe ser un número positivo');
  }

  // Verificar si la actividad existe y obtener es_final
  const actividad = await this.prisma.actividad.findUnique({
    where: { id: actividadId },
    select: {
      id: true,
      es_final: true,
    },
  });

  if (!actividad) {
    throw new NotFoundException('Actividad no encontrada');
  }

  // Si es actividad final, retornar finales
  if (actividad.es_final) {
    const finales = await this.prisma.final.findMany({
      where: {
        actividad_id: actividadId,
      },
      include: {
        proyecto: {
          include: {
            estudiantes: {
              include: {
                usuario: true,
              },
            },
          },
        },
        tags: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    if (finales.length === 0) {
      return [];
    }

    // Mapear finales con estructura similar a documentos
    return finales.map((final) => ({
      id: final.id,
      titulo: final.titulo,
      carrera: final.carrera,
      año: final.año,
      estado: final.estado,
      version: final.version,
      archivo: final.archivo,
      fase: final.fase,
      tags: final.tags,
      proyecto: {
        id: final.proyecto.id,
        titulo: final.proyecto.titulo,
        fase: final.proyecto.fase_actual,
        estudiantes: final.proyecto.estudiantes.map((est) => ({
          id: est.id,
          cu: est.cu,
          carrera: est.carrera,
          usuario: {
            nombre: est.usuario.nombre,
            apellido: est.usuario.apellido,
            email: est.usuario.email,
          },
        })),
      },
    }));
  }

  // Flujo normal: obtener documentos
  const documentos = await this.prisma.documento.findMany({
    where: {
      actividad_id: actividadId,
    },
    include: {
      proyecto: {
        include: {
          estudiantes: {
            include: {
              usuario: true,
            },
          },
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  if (documentos.length === 0) {
    return [];
  }

  // Mapear documentos
  return documentos.map((doc) => ({
    id: doc.id,
    titulo: doc.titulo,
    version: doc.version,
    estado: doc.estado,
    justificacion: doc.justificacion,
    created_at: doc.created_at,
    file: doc.file,
    proyecto: {
      id: doc.proyecto.id,
      titulo: doc.proyecto.titulo,
      fase: doc.proyecto.fase_actual,
      estudiantes: doc.proyecto.estudiantes.map((est) => ({
        id: est.id,
        cu: est.cu,
        carrera: est.carrera,
        usuario: {
          nombre: est.usuario.nombre,
          apellido: est.usuario.apellido,
          email: est.usuario.email,
        },
      })),
    },
  }));
}


  async getPendientes(docenteId: number) {
    // 1️⃣ Obtener todos los grupos del docente autenticado
    const grupos = await this.prisma.grupo.findMany({
      where: { docente_id: docenteId },
      select: { id: true },
    });

    const grupoIds = grupos.map(g => g.id);
    if (grupoIds.length === 0) return [];

    // 2️⃣ Buscar documentos pendientes de proyectos con estudiantes en esos grupos
    const documentos = await this.prisma.documento.findMany({
      where: {
        estado: 'pendiente',
        proyecto: {
          estudiantes: {
            some: { grupo_id: { in: grupoIds } },
          },
        },
      },
      select: {
        id: true,
        titulo: true,
        estado: true,
        created_at: true,
        proyecto: {
          select: {
            estudiantes: {
              where: { grupo_id: { in: grupoIds } },
              select: {
                id: true,
                cu: true,
                carrera: true,
                usuario: {
                  select: { nombre: true, apellido: true },
                },
              },
            },
          },
        },
      },
    });

    // 3️⃣ Formatear respuesta
    return documentos.map(doc => ({
      id: doc.id,
      titulo: doc.titulo,
      fecha_creacion: doc.created_at,
      estado: doc.estado,
      estudiantes: doc.proyecto.estudiantes.map(est => ({
        id: est.id,
        nombre_completo: `${est.usuario.nombre} ${est.usuario.apellido}`,
        cu: est.cu,
        carrera: est.carrera,
      })),
    }));
  }

  async getDocInfo(id: number) {
    // Validar que id sea un número válido
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del documento debe ser un número positivo');
    }

    const doc = await this.prisma.documento.findUnique({
      where: { id },
      select: {
        id: true,
        titulo: true,
        version: true,
        estado: true,
        created_at: true,
        file: true,
        proyecto_id: true,
      },
    });

    if (!doc) {
      throw new NotFoundException(`Documento con código ${id} no encontrado`);
    }

    return doc;
  }

  async verificarProyecto(proyectoId: number): Promise<boolean> {
    // Validar que proyectoId sea un número válido
    if (!proyectoId || isNaN(proyectoId) || proyectoId <= 0) {
      return false;
    }

    try {
      const proyecto = await this.prisma.proyecto.findUnique({
        where: { id: proyectoId }
      });
      return !!proyecto;
    } catch (error) {
      console.error('Error verificando proyecto:', error);
      return false;
    }
  }

  async obtenerFaseProyecto(proyectoId: number): Promise<string> {
    try {
      const proyecto = await this.prisma.proyecto.findUnique({
        where: { id: proyectoId },
        select: { fase_actual: true }
      });

      return proyecto?.fase_actual || 'tema'; // Default to 'tema' if not found
    } catch (error) {
      console.error('Error obteniendo fase del proyecto:', error);
      return 'tema';
    }
  }

  async verificarActividad(actividadId: number): Promise<boolean> {
    const actividad = await this.prisma.actividad.findUnique({
      where: { id: actividadId }
    });
    return !!actividad;
  }

  async verificarEstadoDocumentos(proyectoId: number, actividadId: number): Promise<'pendiente' | 'aprobado' | 'ninguno'> {
  const docs = await this.prisma.documento.findMany({
    where: { proyecto_id: proyectoId, actividad_id: actividadId },
    select: { estado: true }
  });

  if (docs.some(d => d.estado === 'pendiente')) return 'pendiente';
  if (docs.some(d => d.estado === 'aprobado')) return 'aprobado';
  return 'ninguno';
}


  async crearDocumento(data: {
  titulo: string;
  version: number;
  file: string;
  proyecto_id: number;
  actividad_id: number;
  estado: string;
}) {
  // 🟢 Calcular cuántos documentos hay para ese proyecto y actividad
  const versionActual = await this.prisma.documento.count({
    where: {
      proyecto_id: data.proyecto_id,
      actividad_id: data.actividad_id
    }
  });

  const siguienteVersion = versionActual + 1;

  // Crear el nuevo documento con la versión calculada
  return this.prisma.documento.create({
    data: {
      titulo: data.titulo,
      version: siguienteVersion,
      file: data.file,
      proyecto_id: data.proyecto_id,
      actividad_id: data.actividad_id,
      estado: data.estado as any
    }
  });
}


  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();

    switch (ext) {
      case '.pdf': return 'application/pdf';
      case '.docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case '.doc': return 'application/msword';
      case '.png': return 'image/png';
      case '.jpg':
      case '.jpeg': return 'image/jpeg';
      default: return 'application/octet-stream';
    }
  }

  async findByProyecto(proyectoId: number, fase: string) {
    if (!proyectoId || isNaN(proyectoId) || proyectoId <= 0) {
      throw new BadRequestException('El ID del proyecto debe ser un número positivo');
    }

    try {
      // Convertir el string fase al enum Prisma
      const faseEnum = fase as $Enums.FaseProyecto;

      const documents = await this.prisma.documento.findMany({
        where: {
          proyecto_id: proyectoId,
        },
        select: {
          id: true,
          titulo: true,
          version: true,
          estado: true,
          justificacion: true,
          created_at: true,
          file: true,
          proyecto_id: true
        },
        orderBy: { created_at: 'desc' }
      });

      if (!documents || documents.length === 0) {
        console.log(`📂 No se encontraron documentos para proyecto_id: ${proyectoId} y fase: ${fase}`);
        return [];
      }

      return documents;
    } catch (error) {
      console.error('Error obteniendo documentos por proyecto:', error);
      throw new NotFoundException(`No se encontraron documentos para el proyecto ${proyectoId} en fase ${fase}`);
    }
  }

  async cambiarEstadoDocumento(
    id: number,
    nuevoEstado: $Enums.EstadoDocumento,
    justificacion?: string
  ) {
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID del documento debe ser un número positivo');
    }

    var documento_estado = nuevoEstado;

    const documento = await this.prisma.documento.findUnique({
      where: { id },
      select: { id: true, estado: true }
    });

    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado o inactivo`);
    }

    // Construir datos de actualización condicionalmente
    const dataToUpdate: {
      estado: $Enums.EstadoDocumento;
      justificacion?: string | null;
    } = {
      estado: nuevoEstado
    };

    // Solo modificar justificación cuando sea relevante
    if (nuevoEstado === 'rechazado') {
      if (!justificacion?.trim()) {
        throw new BadRequestException('Se requiere justificación para rechazar');
      }
      dataToUpdate.justificacion = justificacion.trim();
    } else if (documento.estado === 'rechazado' && documento_estado !== 'rechazado') {
      // Limpiar justificación al salir del estado rechazado
      dataToUpdate.justificacion = null;
    }
    // Si no es rechazo y no viene de rechazo, no tocar justificacion

    const actualizado = await this.prisma.documento.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        titulo: true,
        version: true,
        estado: true,
        proyecto_id: true,
        justificacion: true
      }
    });

    console.log(`✅ Estado del documento ${id} cambiado a "${nuevoEstado}"`);
    return actualizado;
  }

async uploadDocumento(
  file: MulterFile,
  proyectoId: string,
  actividadId: string,
  titulo: string,
  res: Response
) {
  try {
    if (!file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No se ha subido ningún archivo' 
      });
    }

    if (!proyectoId || !actividadId || !titulo) {
      // 🔥 Limpiar archivo inmediatamente si faltan datos
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({ 
        success: false, 
        error: 'Faltan datos requeridos: proyectoId, actividadId o titulo' 
      });
    }

    const proyectoIdNum = parseInt(proyectoId);
    const actividadIdNum = parseInt(actividadId);

    if (isNaN(proyectoIdNum) || isNaN(actividadIdNum)) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({ 
        success: false, 
        error: 'proyectoId y actividadId deben ser números válidos' 
      });
    }

    // 🔥 OPTIMIZACIÓN: Ejecutar validaciones en paralelo
    const [proyectoExiste, actividadInfo, estadoActual] = await Promise.all([
      this.verificarProyecto(proyectoIdNum),
      this.prisma.actividad.findUnique({
        where: { id: actividadIdNum },
        select: { id: true, fase: true, es_final: true }
      }),
      this.verificarEstadoDocumentos(proyectoIdNum, actividadIdNum)
    ]);

    if (!proyectoExiste) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(404).json({ 
        success: false, 
        error: 'Proyecto no encontrado' 
      });
    }

    if (!actividadInfo) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(404).json({ 
        success: false, 
        error: 'Actividad no encontrada' 
      });
    }

    // Validaciones de estado
    if (estadoActual === 'pendiente' && actividadInfo.fase !== 'tema') {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        error: 'Ya tienes un documento pendiente de revisión'
      });
    }

    if (estadoActual === 'aprobado' && actividadInfo.fase !== 'tema') {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        error: 'Ya has aprobado esta actividad'
      });
    }

    // Guardar en BD
    const relativePath = `/uploads/documentos/${file.filename}`;
    
    const nuevoDocumento = await this.crearDocumento({
      titulo,
      version: 0,
      file: relativePath,
      proyecto_id: proyectoIdNum,
      actividad_id: actividadIdNum,
      estado: 'pendiente'
    });

    return res.status(201).json({
      success: true,
      id: nuevoDocumento.id,
      url: relativePath, // 🔥 NUEVO: Retornar URL directa
      message: 'PDF subido correctamente',
      version: nuevoDocumento.version
    });

  } catch (error) {
    console.error('❌ Error subiendo documento:', error);

    if (file?.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (unlinkError) {
        console.error('❌ Error eliminando archivo:', unlinkError);
      }
    }

    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
}

}