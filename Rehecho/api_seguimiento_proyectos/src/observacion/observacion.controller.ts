import {
  Body,
  Controller,
  Post,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  Param,
  Res,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path, { extname } from 'path';
import { ObservacionService } from './observacion.service';
import { File as MulterFile } from 'multer';
import { Response } from 'express';
import * as fs from 'fs';

@Controller('observacion')
export class ObservacionController {
  constructor(private readonly observacionService: ObservacionService) { }

  // =====================
  // 📌 Obtener observaciones de un documento
  // =====================
  @Post('get-obs')
  async getObservaciones(@Body('codigoDoc', ParseIntPipe) codigoDoc: number) {
    console.log('enviando observaciones para documento con id:', codigoDoc);
    return this.observacionService.getObservaciones(codigoDoc);
  }


  
  @Post('get-project-obs')
  async getProjectObservaciones(
    @Body('codigoProyecto', ParseIntPipe) codigoProyecto: number,
    @Body('codigoDoc', ParseIntPipe) codigoDoc: number,
  ) {
    console.log(
      `enviando observaciones para proyecto con id: ${codigoProyecto}, excluyendo documento con id: ${codigoDoc}`,
    );
    return this.observacionService.getProjectObservaciones(
      codigoProyecto,
      codigoDoc,
    );
  }

  // =====================
  // 📌 Crear observación simple (sin imagen)
  // =====================
 // observacion.controller.ts
@Post('create-obs')
async createObservacion(@Body() highlight: any) {
  console.log('📥 CREATE-OBS: Datos recibidos del frontend');
  console.log('ID:', highlight.id);
  console.log('Proyecto ID:', highlight.proyecto_id, 'CodigoProyecto:', highlight.codigoProyecto);
  console.log('Documento ID:', highlight.documento_id, 'CodigoDoc:', highlight.codigoDoc);
  console.log('Contenido:', highlight.content?.text);
  console.log('Comentario:', highlight.comment?.text);
  console.log('Estado:', highlight.estado);
  
  return this.observacionService.createObservacion(highlight);
}
  
@Post('cambiar-estado-obs')
async cambiarEstadoObs(
  @Body('id') id: number,
  @Body('estado') estado: string,
  @Body('comentario') comentario?: string,
) {
  return this.observacionService.updateEstadoObservacion(id, estado, comentario);
}

}
