import { 
  Body, 
  Controller, 
  Post, 
  Res, 
  BadRequestException, 
  NotFoundException,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentoService } from './documento.service';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { File as MulterFile } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

@Controller('documento')
export class DocumentoController {
  constructor(private documentoService: DocumentoService) {}

  @Post('get-doc')
  async getDoc(@Body('codigoDoc') codigoDoc: number, @Res() res: Response) {
    try {
      const { filePath, mimeType } = await this.documentoService.getDoc(codigoDoc);
      
      console.log('📄 Enviando archivo:', filePath);
      console.log('📄 Tipo MIME:', mimeType);

      // Verificar que el archivo existe antes de enviarlo
      if (!fs.existsSync(filePath)) {
        console.error('❌ Archivo no encontrado:', filePath);
        return res.status(404).json({
          success: false,
          error: 'Archivo no encontrado en el servidor'
        });
      }

      // SOLUCIÓN: No usar root cuando filePath es absoluto
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
      
      // Si filePath es absoluto (empieza con C:\ en Windows), no usar root
      if (path.isAbsolute(filePath)) {
        return res.sendFile(filePath);
      } else {
        // Si es relativo, usar root
        return res.sendFile(filePath, { root: process.cwd() });
      }
      
    } catch (error) {
      console.error('❌ Error en getDoc:', error);
      
      if (error instanceof NotFoundException) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Subir un documento PDF al proyecto
   * Recibe: archivo (multipart/form-data), proyectoId, titulo
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('documento', {
    storage: diskStorage({
      destination: (req, file, callback) => {
        const uploadPath = './public/uploads/documentos';
        
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
          console.log(`✅ Carpeta creada: ${uploadPath}`);
        }
        
        callback(null, uploadPath);
      },
      filename: (req, file, callback) => {
        const timestamp = Date.now();
        const cleanTitle = (req.body.titulo || 'documento').replace(/[^a-z0-9]/gi, '_');
        const filename = `${cleanTitle}_${timestamp}${extname(file.originalname)}`;
        callback(null, filename);
      }
    }),
    fileFilter: (req, file, callback) => {
      if (file.mimetype !== 'application/pdf') {
        return callback(new BadRequestException('Solo se permiten archivos PDF'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB máximo
    }
  }))
  async upload(
    @UploadedFile() file: MulterFile,
    @Body('proyectoId') proyectoId: string,
    @Body('titulo') titulo: string,
    @Res() res: Response
  ) {
    try {
      console.log('📁 Archivo recibido:', file?.originalname);
      console.log('📁 Ruta donde se guardó:', file?.path);

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'No se ha subido ningún archivo'
        });
      }

      if (!fs.existsSync(file.path)) {
        console.error('❌ El archivo no se guardó físicamente:', file.path);
        return res.status(500).json({
          success: false,
          error: 'Error al guardar el archivo en el servidor'
        });
      }

      console.log('✅ Archivo guardado exitosamente en:', file.path);

      if (!proyectoId || !titulo) {
        return res.status(400).json({
          success: false,
          error: 'Faltan datos requeridos: proyectoId o titulo'
        });
      }

      const proyectoIdNum = parseInt(proyectoId);
      if (isNaN(proyectoIdNum)) {
        return res.status(400).json({
          success: false,
          error: 'proyectoId debe ser un número válido'
        });
      }

      const proyectoExiste = await this.documentoService.verificarProyecto(proyectoIdNum);
      if (!proyectoExiste) {
        return res.status(404).json({
          success: false,
          error: 'Proyecto no encontrado'
        });
      }

      // IMPORTANTE: Guardar la ruta relativa tal como la usa el servicio
      const relativePath = `/uploads/documentos/${file.filename}`;

      console.log('💾 Guardando en BD con ruta:', relativePath);

      const nuevoDocumento = await this.documentoService.crearDocumento({
        titulo,
        version: 1,
        file: relativePath,
        proyectoId: proyectoIdNum
      });

      console.log('✅ Documento creado en BD:', nuevoDocumento.codigoDoc);

      return res.status(201).json({
        success: true,
        codigoDoc: nuevoDocumento.codigoDoc,
        message: 'PDF subido correctamente',
        fileName: file.filename,
        filePath: relativePath,
        physicalPath: file.path
      });

    } catch (error) {
      console.error('❌ Error subiendo documento:', error);
      
      if (file && file.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
          console.log('🗑️ Archivo eliminado tras error:', file.path);
        } catch (unlinkError) {
          console.error('❌ Error eliminando archivo tras fallo:', unlinkError);
        }
      }

      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor al procesar el PDF'
      });
    }
  }
}