import { Body, Controller, Post, Res } from '@nestjs/common';
import { DocumentoService } from './documento.service';
import { Response } from 'express';

@Controller('documento')
export class DocumentoController {
  constructor(private documentoService: DocumentoService) {}

  @Post('get-doc')
  async getDoc(@Body('codigoDoc') codigoDoc: number, @Res() res: Response) {
    const { filePath, mimeType } = await this.documentoService.getDoc(codigoDoc);

    res.setHeader('Content-Type', mimeType);
    return res.sendFile(filePath, { root: './' }); // se envía como binario, el cliente lo procesa
  }
}
