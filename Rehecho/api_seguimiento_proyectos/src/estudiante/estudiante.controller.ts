import { Controller, Get, Put, Body, UseGuards, Post } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { Param } from '@nestjs/common';

import { EstudianteService } from './estudiante.service';

@UseGuards(JwtGuard)
@Controller('estudiante')
export class EstudianteController {
  constructor(private readonly estudianteService: EstudianteService) {}

  // Obtener perfil completo del estudiante logueado
  @Get('me')
  async getProfile(@GetUser('id') userId: number) {
    return this.estudianteService.getProfile(userId);
  }

  // Obtener el proyecto asociado al estudiante logueado
  @Get('proyecto')
  async getProyecto(@GetUser('id') userId: number) {
    return this.estudianteService.getProyecto(userId);
  }

  // Actualizar datos propios del estudiante
  @Put()
  async updateEstudiante(@GetUser('id') userId: number, @Body() body: any) {
    return this.estudianteService.updateEstudiante(userId, body);
  }

  @Post('asignar-proyecto/:idProyecto')
async asignarProyecto(
  @GetUser('id') userId: number,
  @Param('idProyecto') idProyecto: number,
) {
  return this.estudianteService.asignarProyecto(userId, Number(idProyecto));
}
}
