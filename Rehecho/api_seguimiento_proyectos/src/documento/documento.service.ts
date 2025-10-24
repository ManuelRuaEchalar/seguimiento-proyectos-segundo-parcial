import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { $Enums } from '@prisma/client';

@Injectable()
export class DocumentoService {
  constructor(private prisma: PrismaService) {}

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
      activo: true,
      proyecto: {
        estudiantes: {
          some: { grupo_id: { in: grupoIds } },
        },
      },
    },
    select: {
      id: true,
      titulo: true,
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
    estudiantes: doc.proyecto.estudiantes.map(est => ({
      id: est.id,
      nombre_completo: `${est.usuario.nombre} ${est.usuario.apellido}`,
      cu: est.cu,
      carrera: est.carrera,
    })),
  }));
}

  async getDoc(id: number) {
    // Validar que id sea un número válido
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException(`El ID del documento debe ser un número positivo pero es ${id}`);
    }

    const documento = await this.prisma.documento.findUnique({
      where: { id },
      select: { 
        file: true,
        activo: true
      }
    });

    if (!documento || !documento.activo) {
      throw new NotFoundException('Documento no encontrado o no está activo');
    }

    const relativePath = documento.file;
    const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
    const absolutePath = path.join(process.cwd(), 'public', cleanPath);

    console.log('🔍 Ruta en BD:', relativePath);
    console.log('🔍 Ruta absoluta construida:', absolutePath);

    if (!fs.existsSync(absolutePath)) {
      console.error('❌ Archivo no encontrado físicamente:', absolutePath);
      
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'documentos');
      console.log('📂 Contenido de uploads/documentos:');
      try {
        const files = fs.readdirSync(uploadsDir);
        files.forEach(file => console.log(`   - ${file}`));
      } catch (err) {
        console.log('   📂 Carpeta no existe o está vacía');
      }
      
      throw new NotFoundException('El archivo no existe en el servidor');
    }

    console.log('✅ Archivo encontrado:', absolutePath);

    return {
      filePath: absolutePath,
      mimeType: this.getMimeType(relativePath),
    };
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
        fase: true,
        activo: true,
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

async crearDocumento(datos: {
    titulo: string;
    version: number;
    file: string;
    proyecto_id: number;
    estado: string;
    fase: string;
    activo: boolean;
  }) {
    // Validar datos de entrada
    if (!datos.titulo || !datos.file || !datos.proyecto_id || !datos.estado || !datos.fase) {
      throw new BadRequestException('Faltan datos requeridos para crear el documento');
    }

    try {
      return await this.prisma.documento.create({
        data: {
          titulo: datos.titulo,
          version: datos.version,
          file: datos.file,
          estado: datos.estado as any,
          justificacion: '',
          fase: datos.fase as any,
          activo: datos.activo,
          created_at: new Date(),
          proyecto_id: datos.proyecto_id
        }
      });
    } catch (error) {
      console.error('Error creando documento:', error);
      throw new Error('No se pudo crear el documento en la base de datos');
    }
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
        fase: faseEnum, // ✅ ahora es del tipo correcto
        activo: true
      },
      select: {
        id: true,
        titulo: true,
        version: true,
        estado: true,
        justificacion: true,
        fase: true,
        activo: true,
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
    select: { id: true, estado: true, activo: true }
  });

  if (!documento || !documento.activo) {
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
      fase: true,
      proyecto_id: true,
      justificacion: true
    }
  });

  console.log(`✅ Estado del documento ${id} cambiado a "${nuevoEstado}"`);
  return actualizado;
}


}