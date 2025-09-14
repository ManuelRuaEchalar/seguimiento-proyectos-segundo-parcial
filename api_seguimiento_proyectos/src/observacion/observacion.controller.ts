import { Body, Controller, Post } from '@nestjs/common';
import { ObservacionService } from './observacion.service';

@Controller('observacion')
export class ObservacionController {
  constructor(private observacionService: ObservacionService) {}

  @Post('get-obs')
  async getObservaciones(@Body('codigoDoc') codigoDoc: number) {
    console.log("enviando observaciones para documento con id: ", codigoDoc)
    return this.observacionService.getObservaciones(codigoDoc);
  }

  @Post('create-obs')
  async createObservacion(@Body() highlight: any) {
    return this.observacionService.createObservacion(highlight);
  }
}
