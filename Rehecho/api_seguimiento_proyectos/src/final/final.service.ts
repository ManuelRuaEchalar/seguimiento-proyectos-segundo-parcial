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
}) {
  const { tags, proyecto_id, actividad_id, ...finalData } = data;

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
    version: nuevaVersion, // ✨ Asignar la versión calculada
    // 🏷️ Conectar tags existentes usando su ID
    tags: tags && tags.length > 0
      ? {
          connect: tags.map(tagId => ({ id: tagId }))
        }
      : undefined,
    // 🔗 Conectar el proyecto por su id
    proyecto: proyecto_id
      ? { connect: { id: proyecto_id } }
      : undefined,
    // 🔗 Conectar la actividad por su id
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
        carrera ? { carrera: { contains: String(carrera), mode: 'insensitive' } } : {},
        año ? { año: parseInt(String(año)) } : {},
        titulo ? { titulo: { contains: String(titulo), mode: 'insensitive' } } : {},
        tag
          ? {
              tags: {
                some: { 
                  nombre: { contains: String(tag) } // Remove mode here
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

async getDoc(id: number) {
    // Validar que id sea un número válido
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException(`El ID del documento final debe ser un número positivo pero es ${id}`);
    }

    const documentoFinal = await this.prisma.final.findUnique({
      where: { id },
      select: {
        archivo: true,
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

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'finales');
      console.log('📂 Contenido de uploads/finales:');
      try {
        const files = fs.readdirSync(uploadsDir);
        files.forEach(file => console.log(`   - ${file}`));
      } catch (err) {
        console.log('   📂 Carpeta no existe o está vacía');
      }

      throw new NotFoundException('El archivo final no existe en el servidor');
    }

    console.log('✅ Archivo final encontrado:', absolutePath);

    return {
      filePath: absolutePath,
      mimeType: this.getMimeType(relativePath),
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
