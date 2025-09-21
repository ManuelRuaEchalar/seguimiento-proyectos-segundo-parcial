import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentoService {
  constructor(private prisma: PrismaService) {}

  async getDoc(codigoDoc: number) {
    const documento = await this.prisma.documento.findUnique({
      where: { codigoDoc },
      select: { file: true }
    });

    if (!documento) {
      throw new NotFoundException('Documento no encontrado');
    }

    // ← AQUÍ ESTÁ EL PROBLEMA: La ruta relativa se debe convertir a absoluta
    // Si en BD guardas: /uploads/documentos/archivo.pdf
    // La ruta física es: ./public/uploads/documentos/archivo.pdf
    const relativePath = documento.file; // /uploads/documentos/archivo.pdf
    const absolutePath = path.join(process.cwd(), 'public', relativePath); // ./public/uploads/documentos/archivo.pdf

    console.log('🔍 Buscando archivo en:', absolutePath);

    if (!fs.existsSync(absolutePath)) {
      console.error('❌ Archivo no encontrado físicamente:', absolutePath);
      throw new NotFoundException('El archivo no existe en el servidor');
    }

    return {
      filePath: absolutePath, // ← Usar la ruta absoluta
      mimeType: this.getMimeType(relativePath),
    };
  }

  /**
   * Verificar si el proyecto existe
   */
  async verificarProyecto(proyectoId: number): Promise<boolean> {
    try {
      const proyecto = await this.prisma.proyecto.findUnique({
        where: { codigoProyecto: proyectoId }
      });
      return !!proyecto;
    } catch (error) {
      console.error('Error verificando proyecto:', error);
      return false;
    }
  }

  /**
   * Crear un nuevo documento en la base de datos
   */
  async crearDocumento(datos: {
    titulo: string;
    version: number;
    file: string;
    proyectoId: number;
  }) {
    try {
      return await this.prisma.documento.create({
        data: {
          titulo: datos.titulo,
          version: datos.version,
          file: datos.file,
          proyectoId: datos.proyectoId
        }
      });
    } catch (error) {
      console.error('Error creando documento:', error);
      throw new Error('No se pudo crear el documento en la base de datos');
    }
  }

  private getMimeType(filePath: string): string {
    if (filePath.endsWith('.pdf')) return 'application/pdf';
    if (filePath.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (filePath.endsWith('.doc')) return 'application/msword';
    if (filePath.endsWith('.png')) return 'image/png';
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
    return 'application/octet-stream';
  }
}