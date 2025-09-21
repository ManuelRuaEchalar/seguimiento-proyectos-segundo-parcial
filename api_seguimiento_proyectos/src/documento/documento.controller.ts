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
    const { filePath, mimeType } = await this.documentoService.getDoc(codigoDoc);

    res.setHeader('Content-Type', mimeType);
    return res.sendFile(filePath, { root: './' });
  }

  @Post('doc-info')
  async getDocInfo(@Body('codigoDoc') codigoDoc: number) {
    const docInfo = await this.documentoService.getDocInfo(codigoDoc);
    console.log("enviando info de doc ", codigoDoc);
    return docInfo; // Nest automáticamente lo serializa como JSON
  }
}
