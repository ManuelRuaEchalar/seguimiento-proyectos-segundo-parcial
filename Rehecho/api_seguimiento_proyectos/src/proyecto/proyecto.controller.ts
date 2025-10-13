import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { ProyectoService } from './proyecto.service';

@UseGuards(JwtGuard)
@Controller('proyecto')
export class ProyectoController {
  constructor(private readonly proyectoService: ProyectoService) {}

  @Post('crear')
  async createProyecto(@Body('titulo') titulo: string) {
    return this.proyectoService.createProyecto(titulo);
  }

  
}
