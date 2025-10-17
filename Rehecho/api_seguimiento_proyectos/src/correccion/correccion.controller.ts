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
import { CorreccionService } from './correccion.service';
import { File as MulterFile } from 'multer';
import { Response } from 'express';
import * as fs from 'fs';

@Controller('correccion')
export class CorreccionController {
  constructor(private readonly correccionService: CorreccionService) {}

  // =====================
  // 📌 Obtener correcciones de un documento
  // =====================
  @Post('get-corr')
  async getCorrecciones(@Body('codigoDoc', ParseIntPipe) codigoDoc: number) {
    console.log('Enviando correcciones para documento con id:', codigoDoc);
    return this.correccionService.getCorrecciones(codigoDoc);
  }

  @Get(':id')
  async getCorreccionById(@Param('id') id: string) {
    console.log('Buscando corrección con id:', id);
    return this.correccionService.getCorreccionById(id);
  }

  // =====================
  // 📌 Crear corrección simple
  // =====================
  @Post('create-corr')
  async createCorreccion(@Body() highlight: any) {
    return this.correccionService.createCorreccion(highlight);
  }

  // =====================
  // 📌 Borrar corrección por observacionId
  // =====================
  @Post('borrar-correccion')
  async borrarCorreccion(@Body('observacionId') observacionId: string) {
    console.log('Eliminando corrección con observacionId:', observacionId);
    return this.correccionService.deleteCorreccionByObservacionId(observacionId);
  }
}