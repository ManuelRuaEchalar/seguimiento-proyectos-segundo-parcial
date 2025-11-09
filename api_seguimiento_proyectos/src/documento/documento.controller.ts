import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Res,
  BadRequestException,
  NotFoundException,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Query,
  Patch,
  UseGuards,
  Req
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentoService } from './documento.service';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { File as MulterFile } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { $Enums } from '@prisma/client';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { Request } from 'express';

@Controller('documento')
export class DocumentoController {
  constructor(private documentoService: DocumentoService) { }

  // 🔥 NUEVO: Endpoint optimizado que solo retorna la URL
  @Post('doc-url')
  async getDocUrl(@Body() body: { id: number }) {
    try {
      const { id } = body;

      if (!id || typeof id !== 'number') {
        throw new BadRequestException('Código de documento inválido');
      }

      // Solo obtener la ruta del archivo, no el archivo físico
      const documento = await this.documentoService.getDocUrl(id);

      return {
        success: true,
        url: documento.url, // URL pública para acceso directo desde Nginx
        ...documento
      };
    } catch (error) {
      console.error('Error en getDocUrl:', error);
      throw new HttpException(
        error.message || 'Error al obtener URL del documento',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Mantener este endpoint solo para casos legacy o descarga forzada
  @Post('get-doc')
  async getDoc(@Body('id') id: number, @Res() res: Response) {
    try {
      // Simplificado: solo validar y retornar info básica
      const docInfo = await this.documentoService.getDocUrl(id);

      // Redirigir a la URL estática de Nginx
      return res.redirect(docInfo.url);
    } catch (error) {
      console.error('❌ Error en getDoc:', error);
      return res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Error interno del servidor'
      });
    }
  }

  @UseGuards(JwtGuard)
  @Get('teacher-observations')
  async getTeacherObservations(
    @Req() req: Request,
    @Query('estudiante_id') estudianteId: string,
    @Query('actividad_id') actividadId: string,
  ) {
    const user = req.user as { id: number; email: string; rol: string };

    if (!estudianteId || !actividadId) {
      throw new BadRequestException('El ID de estudiante y actividad son requeridos');
    }

    const estudianteIdNum = parseInt(estudianteId, 10);
    const actividadIdNum = parseInt(actividadId, 10);

    if (isNaN(estudianteIdNum) || isNaN(actividadIdNum)) {
      throw new BadRequestException('Los IDs deben ser números válidos');
    }

    return this.documentoService.getTeacherObservations(
      user.id,
      estudianteIdNum,
      actividadIdNum
    );
  }

  @UseGuards(JwtGuard)
  @Get('student-docs')
  async getStudentDocs(
    @Req() req: Request,
    @Query('actividad_id') actividadId: string,
  ) {
    const user = req.user as { id: number; email: string; rol: string };

    if (user.rol !== 'estudiante') {
      throw new BadRequestException('El usuario no es un estudiante');
    }

    if (!actividadId) {
      throw new BadRequestException('El ID de actividad es requerido');
    }

    const actividadIdNum = parseInt(actividadId, 10);
    if (isNaN(actividadIdNum)) {
      throw new BadRequestException('El ID de actividad debe ser un número válido');
    }

    return this.documentoService.getStudentDocuments(user.id, actividadIdNum);
  }

  @Get('get-activity-docs/:actividadId')
  @UseGuards(JwtGuard)
  async getActivityDocs(@Param('actividadId') actividadId: string) {
    try {
      const idNum = parseInt(actividadId);
      if (isNaN(idNum) || idNum <= 0) {
        throw new BadRequestException('El ID de la actividad debe ser un número positivo');
      }

      const documentos = await this.documentoService.getActivityDocs(idNum);

      return {
        success: true,
        data: documentos,
      };
    } catch (error) {
      console.error('❌ Error en getActivityDocs:', error);
      throw new HttpException(
        error.message || 'Error al obtener documentos de la actividad',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  @Get('get-pendientes')
  @UseGuards(JwtGuard)
  async getPendientes(@GetUser('id') docenteId: number) {
    // docenteId viene directamente del access_token
    console.log('📘 Docente autenticado con ID:', docenteId);

    const pendientes = await this.documentoService.getPendientes(docenteId);
    return {
      success: true,
      data: pendientes,
    };
  }

  @Post('doc-info')
  async getDocInfo(@Body() body: { id: number }) {
    try {
      const { id } = body;

      if (!id || typeof id !== 'number') {
        throw new HttpException('Código de documento inválido', HttpStatus.BAD_REQUEST);
      }

      console.log('📋 Obteniendo información del documento:', id);

      const docInfo = await this.documentoService.getDocInfo(id);

      console.log('📋 Información del documento encontrada:', docInfo);

      return docInfo;
    } catch (error) {
      console.error('Error en getDocInfo:', error);

      if (error.message.includes('no encontrado')) {
        throw new HttpException(
          `Documento con código ${body.id} no encontrado`,
          HttpStatus.NOT_FOUND
        );
      }

      throw new HttpException(
        'Error interno del servidor al obtener la información del documento',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

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
      fileSize: 10 * 1024 * 1024, // 10MB
    }
  }))
  async upload(
    @UploadedFile() file: MulterFile,
    @Body('proyectoId') proyectoId: string,
    @Body('actividadId') actividadId: string,
    @Body('titulo') titulo: string,
    @Res() res: Response
  ) {
    return this.documentoService.uploadDocumento(file, proyectoId, actividadId, titulo, res);
  }

  @Get(':proyectoId')
  async getDocumentsByProyecto(
    @Param('proyectoId') proyectoId: string,
    @Query('fase') fase: string,
    @Res() res: Response
  ) {
    try {
      const proyectoIdNum = parseInt(proyectoId);
      if (isNaN(proyectoIdNum)) {
        throw new BadRequestException('proyectoId debe ser un número válido');
      }

      // Validar que fase sea un valor válido del enum
      const fasesValidas = ['tema', 'perfil', 'proyecto'];
      if (!fase || !fasesValidas.includes(fase)) {
        throw new BadRequestException('fase debe ser uno de: tema, perfil, proyecto');
      }

      console.log('📋 Obteniendo documentos para proyecto:', proyectoIdNum, 'fase:', fase);

      const documents = await this.documentoService.findByProyecto(proyectoIdNum, fase);

      console.log('📋 Documentos encontrados:', documents.length);

      return res.status(200).json({
        success: true,
        documentos: documents
      });
    } catch (error) {
      console.error('❌ Error en getDocumentsByProyecto:', error);

      if (error instanceof BadRequestException) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      if (error instanceof NotFoundException) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor al obtener los documentos'
      });
    }
  }

  // documento.controller.ts

  @Patch('cambiar-estado')
  async cambiarEstado(
    @Body('id') id: number,
    @Body('nuevoEstado') nuevoEstado: string,
    @Body('justificacion') justificacion: string,
    @Res() res: Response
  ) {
    try {
      if (!id || isNaN(id)) {
        throw new BadRequestException('El ID del documento debe ser un número válido');
      }

      const estadosValidos = Object.values($Enums.EstadoDocumento);
      if (!estadosValidos.includes(nuevoEstado as $Enums.EstadoDocumento)) {
        throw new BadRequestException(`Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}`);
      }

      // Validar justificación para rechazos
      if (nuevoEstado === 'rechazado') {
        if (!justificacion || justificacion.trim().length === 0) {
          throw new BadRequestException('Se requiere una justificación para rechazar el documento');
        }
        if (justificacion.trim().length < 10) {
          throw new BadRequestException('La justificación debe tener al menos 10 caracteres');
        }
      }

      const actualizado = await this.documentoService.cambiarEstadoDocumento(
        id,
        nuevoEstado as $Enums.EstadoDocumento,
        justificacion
      );

      return res.status(200).json({
        success: true,
        message: `Estado del documento actualizado a "${nuevoEstado}"`,
        documento: actualizado
      });
    } catch (error) {
      console.error('❌ Error en cambiarEstado:', error);

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        return res.status(error.getStatus()).json({
          success: false,
          error: error.message
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor al cambiar el estado del documento'
      });
    }
  }

  @Post('rechazar')
  async rechazarDocumento(
    @Body() body: { documentoId: number; motivo: string; proyectoId: number },
    @Res() res: Response
  ) {
    try {
      const { documentoId, motivo, proyectoId } = body;

      if (!documentoId || !motivo || !proyectoId) {
        return res.status(400).json({
          success: false,
          error: 'Faltan datos requeridos: documentoId, motivo o proyectoId'
        });
      }

      // Cambiar estado del documento a "rechazado"
      await this.documentoService.cambiarEstadoDocumento(
        documentoId,
        'rechazado' as $Enums.EstadoDocumento
      );

      // Aquí puedes crear una observación general con el motivo del rechazo
      // o guardarlo en una nueva tabla "RechazosDocumento"
      console.log(`📝 Documento ${documentoId} rechazado. Motivo: ${motivo}`);

      return res.status(200).json({
        success: true,
        message: 'Documento rechazado exitosamente',
        motivo
      });
    } catch (error) {
      console.error('❌ Error al rechazar documento:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor al rechazar el documento'
      });
    }
  }

// ✅ NUEVO - Usando path params
@Get('by-proyecto-grupo/:proyectoId/:grupoId')
@UseGuards(JwtGuard)
async getDocsByProyectoYGrupo(
  @Param('proyectoId') proyectoId: string,
  @Param('grupoId') grupoId: string,
) {
  try {
    const proyectoIdNum = parseInt(proyectoId, 10);
    const grupoIdNum = parseInt(grupoId, 10);

    if (isNaN(proyectoIdNum) || proyectoIdNum <= 0) {
      throw new BadRequestException('proyecto_id debe ser un número válido');
    }

    if (isNaN(grupoIdNum) || grupoIdNum <= 0) {
      throw new BadRequestException('grupo_id debe ser un número válido');
    }

    const documentos = await this.documentoService.getDocsByProyectoYGrupo(
      proyectoIdNum,
      grupoIdNum,
    );

    return {
      success: true,
      data: documentos,
    };
  } catch (error) {
    throw new HttpException(
      error.message || 'Error al obtener documentos por proyecto y grupo',
      error.status || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
}