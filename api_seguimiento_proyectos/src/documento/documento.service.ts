import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';

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

    const filePath = documento.file;
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('El archivo no existe en el servidor');
    }

    return {
      filePath,
      mimeType: this.getMimeType(filePath),
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
