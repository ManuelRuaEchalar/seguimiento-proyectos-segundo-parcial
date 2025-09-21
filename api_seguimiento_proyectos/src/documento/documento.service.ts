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

    // SOLUCIÓN: Manejar correctamente las rutas
    const relativePath = documento.file; // /uploads/documentos/archivo.pdf
    
    // Construir la ruta absoluta correctamente
    // Si relativePath empieza con '/', quitarle el primer '/'
    const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
    const absolutePath = path.join(process.cwd(), 'public', cleanPath);

    console.log('🔍 Ruta en BD:', relativePath);
    console.log('🔍 Ruta absoluta construida:', absolutePath);

    // Verificar que el archivo existe
    if (!fs.existsSync(absolutePath)) {
      console.error('❌ Archivo no encontrado físicamente:', absolutePath);
      
      // DEBUGGING: Listar archivos en la carpeta para ver qué hay
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

  
}
