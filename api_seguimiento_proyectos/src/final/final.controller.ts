import {
  Controller,
  Post,
  Delete,
  Put,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  Res,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { FinalService } from './final.service';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { File as MulterFile } from 'multer';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import path, { extname } from 'path';

@Controller('final')
export class FinalController {
  constructor(private readonly finalService: FinalService) {}

  // ✅ Crear registro Final (solo docentes)
  @UseGuards(JwtGuard)
  @Post()
  async crearFinal(@Req() req: Request, @Body() body: any) {
    const user = req.user as { id: number; email: string; rol: string };

    if (user.rol !== 'estudiante') {
      throw new HttpException('Solo los docentes pueden crear finales', HttpStatus.FORBIDDEN);
    }

    return this.finalService.crearFinal(body);
  }

  @UseGuards(JwtGuard)
@Post('upload')
@UseInterceptors(
  FileInterceptor('archivo', {
    storage: diskStorage({
      destination: (req, file, callback) => {
        const uploadPath = './public/uploads/finales';
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
          console.log(`✅ Carpeta creada: ${uploadPath}`);
        }
        callback(null, uploadPath);
      },
      filename: (req, file, callback) => {
        const timestamp = Date.now();
        const cleanTitle = (req.body.titulo || 'final').replace(/[^a-z0-9]/gi, '_');
        const filename = `${cleanTitle}_${timestamp}${extname(file.originalname)}`;
        callback(null, filename);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (file.mimetype !== 'application/pdf') {
        return callback(new BadRequestException('Solo se permiten archivos PDF'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB
    },
  }),
)
async upload(
  @UploadedFile() file: MulterFile,
  @Body('titulo') titulo: string,
  @Body('carrera') carrera: string,
  @Body('anio') anio: string,
  @Body('fase') fase: string,
  @Body('actividad_id') actividad_id: string,
  @Body('proyecto_id') proyecto_id: string,
  @Body('tags') tags: string,
  @Res() res: Response,
) {
  try {
    console.log('=== DATOS RECIBIDOS EN LA API ===');
    console.log('📄 File:', file?.originalname);
    console.log('📝 titulo:', titulo);
    console.log('🎓 carrera:', carrera);
    console.log('📅 anio:', anio);
    console.log('📊 fase:', fase);
    console.log('🆔 proyecto_id:', proyecto_id);
    console.log('🏷️ tags (raw):', tags);

    if (!file) {
      return res.status(400).json({ success: false, error: 'No se ha subido ningún archivo' });
    }

    if (!titulo || !carrera || !anio || !fase || !proyecto_id) {
      console.error('❌ Faltan datos:', { titulo, carrera, anio, fase, proyecto_id });
      return res.status(400).json({ 
        success: false, 
        error: 'Faltan datos requeridos',
        detalles: { titulo: !!titulo, carrera: !!carrera, anio: !!anio, fase: !!fase, proyecto_id: !!proyecto_id }
      });
    }

    const proyectoIdNum = parseInt(proyecto_id);
    if (isNaN(proyectoIdNum)) {
      return res.status(400).json({ success: false, error: 'proyecto_id debe ser un número válido' });
    }

    // 🏷️ Parsear tags
    let tagsArray: number[] = [];
    if (tags) {
      try {
        tagsArray = JSON.parse(tags);
        console.log('🏷️ tags parseados:', tagsArray);
        
        if (!Array.isArray(tagsArray)) {
          return res.status(400).json({ success: false, error: 'Tags debe ser un array' });
        }
      } catch (error) {
        console.error('❌ Error parseando tags:', error);
        return res.status(400).json({ success: false, error: 'Tags inválidos' });
      }
    }

    const relativePath = `/uploads/finales/${file.filename}`;

    const resultado = await this.finalService.crearFinal({
      titulo,
      carrera,
      año: parseInt(anio),
      archivo: relativePath,
      fase,
      actividad_id: parseInt(actividad_id),
      proyecto_id: proyectoIdNum,
      tags: tagsArray,
    });

    // ✅ Verificar si hay un error de validación
    if (resultado.error && resultado.existe) {
      console.log('⚠️ Validación rechazada:', resultado.error);
      
      // Eliminar el archivo subido
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
        console.log('🗑️ Archivo eliminado:', file.path);
      }
      
      return res.status(400).json({
        success: false,
        error: resultado.error
      });
    }

    console.log('✅ Final creado:', resultado);

    return res.status(201).json({
      success: true,
      message: 'Final subido correctamente',
      id: resultado.id,
      filePath: relativePath,
      tags: resultado.tags,
    });
  } catch (error) {
    console.error('❌ Error subiendo final:', error);
    if (file && file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      detalle: error.message 
    });
  }
}

  // ✅ Eliminar Final (solo docente)
  @UseGuards(JwtGuard)
  @Delete(':id')
  async borrarFinal(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { id: number; rol: string };
    if (user.rol !== 'docente') {
      throw new HttpException('Solo los docentes pueden eliminar finales', HttpStatus.FORBIDDEN);
    }

    return this.finalService.borrarFinal(parseInt(id));
  }

@UseGuards(JwtGuard)
  @Put(':id')
  async actualizarFinal(@Req() req: Request, @Param('id') id: string, @Body() body: any) {
    const user = req.user as { id: number; rol: string };
    if (user.rol !== 'docente') {
      throw new HttpException('Solo los docentes pueden actualizar finales', HttpStatus.FORBIDDEN);
    }

    // Validar que si el estado es "rechazado", debe incluir motivo_rechazo
    if (body.estado === 'rechazado' && !body.motivo_rechazo) {
      throw new HttpException('Debe proporcionar un motivo de rechazo', HttpStatus.BAD_REQUEST);
    }

    return this.finalService.actualizarFinal(parseInt(id), body);
  }

  // 🌍 Obtener todos los finales aprobados (sin auth)
  @Get()
  async obtenerFinales() {
    return this.finalService.obtenerFinalesAprobados();
  }

  // 🌍 Buscar finales por condiciones (sin auth)
  @Get('buscar')
  async buscarFinales(@Req() req: Request) {
    const { tag, carrera, año, titulo } = req.query;
    return this.finalService.buscarFinales({ tag, carrera, año, titulo });
  }

  @Post('get-doc')
  async getDoc(@Body('id') id: number, @Res() res: Response) {
    try {
      const { filePath, mimeType } = await this.finalService.getDoc(id);

      console.log('📄 Enviando archivo final:', filePath);
      console.log('📄 Tipo MIME:', mimeType);

      if (!fs.existsSync(filePath)) {
        console.error('❌ Archivo final no encontrado:', filePath);
        return res.status(404).json({
          success: false,
          error: 'Archivo no encontrado en el servidor'
        });
      }

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);

      if (path.isAbsolute(filePath)) {
        return res.sendFile(filePath);
      } else {
        return res.sendFile(filePath, { root: process.cwd() });
      }

    } catch (error) {
      console.error('❌ Error en getDoc (Final):', error);

      if (error instanceof NotFoundException) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      if (error instanceof BadRequestException) {
        return res.status(400).json({
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
}
