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

  async getDocInfo(codigoDoc: number) {
    const doc = await this.prisma.documento.findUnique({
      where: { codigoDoc },
      select: {
        codigoDoc: true,
        titulo: true,
        version: true,
        file: true,
        proyectoId: true,
      },
    });

    if (!doc) {
      throw new Error(`Documento con código ${codigoDoc} no encontrado`);
    }

    return doc; // Nest lo serializa como JSON
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
