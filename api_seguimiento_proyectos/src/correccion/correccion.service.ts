import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CorreccionService {
  constructor(private prisma: PrismaService) {}

  // =====================
  // 📌 Obtener correcciones de un documento
  // =====================
  async getCorrecciones(codigoDoc: number) {
    const correcciones = await this.prisma.correccion.findMany({
      where: { documento_id: codigoDoc },
      include: {
        observacion: true,
      },
    });

    console.log('📖 Correcciones encontradas:', correcciones.length);
    return correcciones;
  }

  // =====================
  // 📌 Obtener corrección por ID
  // =====================
  async getCorreccionById(id: string) {
    const correccion = await this.prisma.correccion.findUnique({
      where: { id: Number(id) },
      include: {
        observacion: true,
      },
    });

    if (!correccion) {
      throw new NotFoundException(`Corrección con ID ${id} no encontrada`);
    }

    return correccion;
  }

  // =====================
  // 📌 Crear corrección
  // =====================
  async createCorreccion(highlight: any) {
    console.log('📝 Creando corrección para observación:', highlight.observacionId);
    console.log('📦 Datos recibidos:', JSON.stringify(highlight, null, 2));
    
    // Validar que observacionId existe
    if (!highlight.observacionId) {
      throw new Error('observacionId es requerido para crear una corrección');
    }

    // Validar que documento_id existe
    const documentoId = highlight.documento_id || highlight.codigoDoc;
    if (!documentoId) {
      throw new Error('documento_id es requerido');
    }

    // Verificar que la observación existe
    const observacionExiste = await this.prisma.observacion.findUnique({
      where: { id: Number(highlight.observacionId) },
    });

    if (!observacionExiste) {
      throw new NotFoundException(`Observación con ID ${highlight.observacionId} no encontrada`);
    }

    console.log('✅ Observación encontrada:', observacionExiste.id);

    // Verificar si ya existe una corrección para esta observación
    const correccionExistente = await this.prisma.correccion.findUnique({
      where: { observacion_id: Number(highlight.observacionId) },
    });

    if (correccionExistente) {
      console.log('⚠️ Ya existe una corrección para esta observación, actualizando...');
      return this.prisma.correccion.update({
        where: { observacion_id: Number(highlight.observacionId) },
        data: {
          content_text: highlight.content?.text || null,
          comment_text: highlight.comment?.text || null,
          comment_emoji: highlight.comment?.emoji || null,
          estado: highlight.estado || 'pendiente',
          bounding_x1: highlight.position?.boundingRect?.x1 || 0,
          bounding_y1: highlight.position?.boundingRect?.y1 || 0,
          bounding_x2: highlight.position?.boundingRect?.x2 || 0,
          bounding_y2: highlight.position?.boundingRect?.y2 || 0,
          bounding_page: highlight.position?.pageNumber || 1,
          rects: highlight.position?.rects || [],
        },
        include: {
          observacion: true,
        },
      });
    }

    // Crear nueva corrección usando SOLO IDs (formato "unchecked")
    try {
      const dataToCreate = {
        content_text: highlight.content?.text || null,
        comment_text: highlight.comment?.text || null,
        comment_emoji: highlight.comment?.emoji || null,
        estado: highlight.estado || 'pendiente',
        bounding_x1: highlight.position?.boundingRect?.x1 || 0,
        bounding_y1: highlight.position?.boundingRect?.y1 || 0,
        bounding_x2: highlight.position?.boundingRect?.x2 || 0,
        bounding_y2: highlight.position?.boundingRect?.y2 || 0,
        bounding_page: highlight.position?.pageNumber || 1,
        rects: highlight.position?.rects || [],
        observacion_id: Number(highlight.observacionId),
        documento_id: Number(documentoId),
      };

      console.log('💾 Datos a crear:', JSON.stringify(dataToCreate, null, 2));

      const result = await this.prisma.correccion.create({
        data: dataToCreate,
        include: {
          observacion: true,
          documento: true,
        },
      });

      console.log('✅ Corrección creada exitosamente:', result.id);
      return result;
    } catch (error) {
      console.error('❌ Error al crear corrección:', error);
      console.error('❌ Error completo:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  // =====================
  // 📌 Actualizar corrección
  // =====================
  async updateCorreccion(id: number, highlight: any) {
    console.log(`📝 Actualizando corrección ${id}`);

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
      const result = await this.prisma.correccion.update({
        where: { id },
        data,
      });

      console.log('✅ Corrección actualizada:', result);
      return result;
    } catch (error) {
      console.error('❌ Error al actualizar corrección:', error);

      if (error.code === 'P2025') {
        throw new NotFoundException(`Corrección con ID ${id} no encontrada`);
      }

      throw error;
    }
  }

  // =====================
  // 📌 Eliminar corrección por observacionId
  // =====================
  async deleteCorreccionByObservacionId(observacionId: string) {
    console.log('🗑️ Eliminando corrección con observacionId:', observacionId);

    const correccion = await this.prisma.correccion.findUnique({
      where: { observacion_id: Number(observacionId) },
    });

    if (!correccion) {
      throw new NotFoundException(
        `No se encontró una corrección con observacionId: ${observacionId}`,
      );
    }

    await this.prisma.correccion.delete({
      where: { observacion_id: Number(observacionId) },
    });

    console.log('✅ Corrección eliminada exitosamente');
    return {
      message: `Corrección con observacionId ${observacionId} eliminada exitosamente`,
    };
  }

  // =====================
  // 📌 Eliminar corrección por ID
  // =====================
  async deleteCorreccion(id: number) {
    console.log(`🗑️ Eliminando corrección ${id}`);

    try {
      const result = await this.prisma.correccion.delete({
        where: { id },
      });

      console.log('✅ Corrección eliminada:', result);
      return result;
    } catch (error) {
      console.error('❌ Error al eliminar corrección:', error);

      if (error.code === 'P2025') {
        throw new NotFoundException(`Corrección con ID ${id} no encontrada`);
      }

      throw error;
    }
  }

  // =====================
  // 📌 Obtener correcciones por estado
  // =====================
  async getCorreccionesByEstado(estado: string, codigoDoc?: number) {
    console.log(`📖 Buscando correcciones con estado: ${estado}`);

    const where: any = { estado };

    if (codigoDoc) {
      where.documento_id = codigoDoc;
    }

    const correcciones = await this.prisma.correccion.findMany({
      where,
      include: {
        observacion: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    console.log(
      `✅ ${correcciones.length} correcciones encontradas con estado ${estado}`,
    );
    return correcciones;
  }
}