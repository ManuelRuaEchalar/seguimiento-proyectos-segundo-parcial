import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import path from 'path';

@Injectable()
export class FinalService {
  constructor(private prisma: PrismaService) {}

async crearFinal(data: {
  titulo: string;
  carrera: string;
  año: number;
  estado?: string;
  archivo: string;
  fase: string;
  actividad_id: number;
  proyecto_id: number;
  tags?: number[];
}): Promise<any> { // 👈 Agregar tipo de retorno explícito
  const { tags, proyecto_id, actividad_id, ...finalData } = data;

  // ✅ VALIDACIÓN: Verificar si ya existe un final aprobado o pendiente
  const finalExistente = await this.prisma.final.findFirst({
    where: {
      proyecto_id: proyecto_id,
      actividad_id: actividad_id,
      OR: [
        { estado: 'aprobado' },
        { estado: 'pendiente' }
      ]
    },
  });

  // 🚫 Si existe un final aprobado o pendiente, retornar objeto de error
  if (finalExistente) {
    if (finalExistente.estado === 'aprobado') {
      return {
        error: 'Ya tienes un documento aprobado',
        existe: true
      };
    }
    if (finalExistente.estado === 'pendiente') {
      return {
        error: 'Espera a que tu docente revise el último documento que subiste',
        existe: true
      };
    }
  }

  // 📊 Contar finales existentes con el mismo proyecto_id y actividad_id
  const finalesExistentes = await this.prisma.final.count({
    where: {
      proyecto_id: proyecto_id,
      actividad_id: actividad_id,
    },
  });

  // 🔢 Calcular la nueva versión (cantidad existente + 1)
  const nuevaVersion = finalesExistentes + 1;

  // Crear el final con las relaciones de tags, proyecto y actividad
  const createData: any = {
    ...finalData,
    version: nuevaVersion,
    tags: tags && tags.length > 0
      ? {
          connect: tags.map(tagId => ({ id: tagId }))
        }
      : undefined,
    proyecto: proyecto_id
      ? { connect: { id: proyecto_id } }
      : undefined,
    actividad: actividad_id
      ? { connect: { id: actividad_id } }
      : undefined,
  };

  const nuevoFinal = await this.prisma.final.create({
    data: createData,
    include: {
      tags: true,
      proyecto: true,
      actividad: true,
    },
  });

  return nuevoFinal;
}

  async borrarFinal(id: number) {
    return this.prisma.final.delete({ where: { id } });
  }

  async actualizarFinal(id: number, data: any) {
    return this.prisma.final.update({ where: { id }, data });
  }

  async obtenerFinalesAprobados() {
    return this.prisma.final.findMany({
      where: { estado: 'aprobado' },
      include: { tags: true, proyecto: true },
    });
  }

  async buscarFinales(filtros: any) {
    const { tag, carrera, año, titulo } = filtros;

    return this.prisma.final.findMany({
      where: {
        AND: [
          carrera ? { carrera: { contains: String(carrera), mode: 'insensitive' as const } } : {},
          año ? { año: parseInt(String(año)) } : {},
          titulo ? { titulo: { contains: String(titulo), mode: 'insensitive' as const } } : {},
          tag
            ? {
                tags: {
                  some: { 
                    nombre: { contains: String(tag), mode: 'insensitive' as const }
                  },
                },
              }
            : {},
        ].filter(condition => Object.keys(condition).length > 0), // Filter out empty objects
        estado: 'aprobado',
      },
      include: { tags: true, proyecto: true },
    });
  }

// En tu servicio final.service.ts
async getDoc(id: number) {
  // Validar que id sea un número válido
  if (!id || isNaN(id) || id <= 0) {
    throw new BadRequestException(`El ID del documento final debe ser un número positivo pero es ${id}`);
  }

  const documentoFinal = await this.prisma.final.findUnique({
    where: { id },
    include: {
      proyecto: {
        include: {
          estudiantes: {
            include: {
              usuario: true // Incluir la relación con usuario para obtener nombres
            }
          }
        }
      }
    }
  });

  if (!documentoFinal) {
    throw new NotFoundException(`Documento final con ID ${id} no encontrado`);
  }

  const relativePath = documentoFinal.archivo;
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  const absolutePath = path.join(process.cwd(), 'public', cleanPath);

  console.log('🔍 Ruta en BD (Final):', relativePath);
  console.log('🔍 Ruta absoluta construida:', absolutePath);

  if (!fs.existsSync(absolutePath)) {
    console.error('❌ Archivo final no encontrado físicamente:', absolutePath);
    throw new NotFoundException('El archivo final no existe en el servidor');
  }

  console.log('✅ Archivo final encontrado:', absolutePath);

  // Extraer nombres completos de estudiantes
  const estudiantes = documentoFinal.proyecto.estudiantes.map(est => 
    `${est.usuario.nombre} ${est.usuario.apellido}`
  );

  return {
    filePath: absolutePath,
    mimeType: this.getMimeType(relativePath),
    titulo: documentoFinal.titulo,
    carrera: documentoFinal.carrera,
    estudiantes: estudiantes
  };
}

  private getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}