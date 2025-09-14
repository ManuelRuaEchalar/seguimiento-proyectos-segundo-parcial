import { Body, Controller, Post } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';

@Controller('estudiante')
export class EstudianteController {
  constructor(private estudianteService: EstudianteService) {}

  @Post('view-project')
  async viewProyect(@Body('id') id: number) {
    console.log("id ingresado: ", id);
    return this.estudianteService.viewProyect(id);
  }
}