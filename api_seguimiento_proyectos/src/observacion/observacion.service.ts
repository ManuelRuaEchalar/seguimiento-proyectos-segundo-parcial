import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ObservacionService {
  constructor(private prisma: PrismaService) {}

  // 🔹 Obtener observaciones por documento
  async getObservaciones(codigoDoc: number) {
    const observaciones = await this.prisma.observacion.findMany({
      where: { documento_id: codigoDoc },
      orderBy: {
        id: 'desc',
      },
    });

    console.log(`📖 ${observaciones.length} observaciones encontradas para documento ${codigoDoc}`);
    return observaciones;
  }

  // 🔹 Obtener observaciones de un proyecto, excluyendo un documento específico
  async getProjectObservaciones(codigoProyecto: number, codigoDoc: number) {
    const observaciones = await this.prisma.observacion.findMany({
      where: {
        proyecto_id: codigoProyecto,
        documento_id: {
          not: codigoDoc,
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    console.log(
      `📖 Observaciones para proyecto_id: ${codigoProyecto}, excluyendo documento_id: ${codigoDoc}:`,
      observaciones.length
    );

    return observaciones;
  }

  // 🔹 Crear una nueva observación
  async createObservacion(highlight: any) {
    console.log('📝 Datos recibidos en createObservacion:', highlight);
    
    // Extraer proyecto_id y documento_id
    const proyectoId = highlight.proyecto_id || highlight.proyectoId || highlight.codigoProyecto;
    const documentoId = highlight.documento_id || highlight.documentoId || highlight.codigoDoc;

    console.log('🔍 Proyecto ID extraído:', proyectoId, 'Tipo:', typeof proyectoId);
    console.log('🔍 Documento ID extraído:', documentoId, 'Tipo:', typeof documentoId);

    // Validaciones
    if (!proyectoId) {
      const camposRecibidos = Object.keys(highlight);
      throw new Error(`proyecto_id es requerido. Campos recibidos: ${JSON.stringify(camposRecibidos)}`);
    }

    if (!documentoId) {
      throw new Error('documento_id es requerido');
    }

    // Preparar los datos para Prisma
    // IMPORTANTE: NO incluir 'id' - dejar que sea autoincremental
    const data = {
      content_text: highlight.content?.text || '',
      comment_text: highlight.comment?.text || null,
      comment_emoji: highlight.comment?.emoji || null,
      estado: highlight.estado || 'pendiente',
      bounding_x1: highlight.position?.boundingRect?.x1 || 0,
      bounding_y1: highlight.position?.boundingRect?.y1 || 0,
      bounding_x2: highlight.position?.boundingRect?.x2 || 0,
      bounding_y2: highlight.position?.boundingRect?.y2 || 0,
      bounding_page: highlight.position?.pageNumber || 1,
      rects: highlight.position?.rects || [],
      documento_id: Number(documentoId),
      proyecto_id: Number(proyectoId),
    };

    console.log('💾 Datos para crear observación:', JSON.stringify(data, null, 2));

    try {
      const result = await this.prisma.observacion.create({
        data,
      });
      console.log('✅ Observación creada exitosamente con ID:', result.id);
      return result;
    } catch (error) {
      console.error('❌ Error al crear observación en Prisma:', error);
      throw error;
    }
  }

  // 🔹 Cambiar el estado de una observación
  async cambiarEstado(id: string, estado: string) {
    console.log(`🔄 Cambiando estado de observación ${id} a ${estado}`);
    
    try {
      const result = await this.prisma.observacion.update({
        where: {
          id: Number(id),
        },
        data: {
          estado,
        },
      });
      
      console.log('✅ Estado actualizado:', result);
      return result;
    } catch (error) {
      console.error('❌ Error al cambiar estado:', error);
      
      // Si el error es porque no se encontró el registro
      if (error.code === 'P2025') {
        throw new NotFoundException(`Observación con ID ${id} no encontrada`);
      }
      
      throw error;
    }
  }

async updateEstadoObservacion(id: number, estado: string, comentario?: string) {
  // 1️⃣ Actualizar estado de observación
  const updatedObs = await this.prisma.observacion.update({
    where: { id },
    data: { estado },
  });

  // 2️⃣ Actualizar todas las correcciones asociadas
  await this.prisma.correccion.updateMany({
    where: { observacion_id: id },
    data: { estado },
  });

  // 3️⃣ Si la observación fue rechazada, crear una nueva basada en la corrección
  if (estado === 'rechazado') {
    // Buscar la corrección asociada a esta observación
    const correccion = await this.prisma.correccion.findFirst({
      where: { observacion_id: id },
    });

    if (!correccion) {
      throw new Error(`No se encontró una corrección asociada a la observación ${id}`);
    }

    // Crear nueva observación con datos de la corrección
    const nuevaObs = await this.prisma.observacion.create({
      data: {
        documento_id: correccion.documento_id,
        proyecto_id: updatedObs.proyecto_id, // ✅ se obtiene de la observación original
        bounding_x1: correccion.bounding_x1,
        bounding_y1: correccion.bounding_y1,
        bounding_x2: correccion.bounding_x2,
        bounding_y2: correccion.bounding_y2,
        bounding_page: correccion.bounding_page,
        rects: correccion.rects,
        content_text: correccion.content_text,
        comment_text: comentario || '',
        correccion_id: correccion.id,
        estado: 'pendiente',
      },
    });

    return nuevaObs;
  }

  // 4️⃣ Si no es rechazado, devolver la observación actualizada
  return updatedObs;
}


  // 🔹 Eliminar una observación
  async deleteObservacion(id: number) {
    console.log(`🗑️ Eliminando observación ${id}`);
    
    try {
      const result = await this.prisma.observacion.delete({
        where: { id },
      });
      
      console.log('✅ Observación eliminada:', result);
      return result;
    } catch (error) {
      console.error('❌ Error al eliminar observación:', error);
      
      if (error.code === 'P2025') {
        throw new NotFoundException(`Observación con ID ${id} no encontrada`);
      }
      
      throw error;
    }
  }

  // 🔹 Actualizar una observación completa
  async updateObservacion(id: number, highlight: any) {
    console.log(`📝 Actualizando observación ${id}`);
    
    const data: any = {};

    if (highlight.content?.text !== undefined) {
      data.content_text = highlight.content.text;
    }
    if (highlight.comment?.text !== undefined) {
      data.comment_text = highlight.comment.text;
    }
    if (highlight.comment?.emoji !== undefined) {
      data.comment_emoji = highlight.comment.emoji;
    }
    if (highlight.estado !== undefined) {
      data.estado = highlight.estado;
    }
    if (highlight.position?.boundingRect) {
      data.bounding_x1 = highlight.position.boundingRect.x1;
      data.bounding_y1 = highlight.position.boundingRect.y1;
      data.bounding_x2 = highlight.position.boundingRect.x2;
      data.bounding_y2 = highlight.position.boundingRect.y2;
      data.bounding_page = highlight.position.pageNumber || 1;
    }
    if (highlight.position?.rects) {
      data.rects = highlight.position.rects;
    }

    try {
      const result = await this.prisma.observacion.update({
        where: { id },
        data,
      });
      
      console.log('✅ Observación actualizada:', result);
      return result;
    } catch (error) {
      console.error('❌ Error al actualizar observación:', error);
      
      if (error.code === 'P2025') {
        throw new NotFoundException(`Observación con ID ${id} no encontrada`);
      }
      
      throw error;
    }
  }

  // 🔹 Obtener una observación por ID
  async getObservacionById(id: number) {
    console.log(`🔍 Buscando observación ${id}`);
    
    try {
      const observacion = await this.prisma.observacion.findUnique({
        where: { id },
        include: {
          proyecto: true,
          documento: true,
          correccion: true,
        },
      });

      if (!observacion) {
        throw new NotFoundException(`Observación con ID ${id} no encontrada`);
      }

      console.log('✅ Observación encontrada:', observacion);
      return observacion;
    } catch (error) {
      console.error('❌ Error al buscar observación:', error);
      throw error;
    }
  }

  // 🔹 Obtener observaciones por estado
  async getObservacionesByEstado(estado: string, codigoDoc?: number) {
    console.log(`📖 Buscando observaciones con estado: ${estado}`);
    
    const where: any = { estado };
    
    if (codigoDoc) {
      where.documento_id = codigoDoc;
    }

    const observaciones = await this.prisma.observacion.findMany({
      where,
      orderBy: {
        id: 'desc',
      },
    });

    console.log(`✅ ${observaciones.length} observaciones encontradas con estado ${estado}`);
    return observaciones;
  }
}