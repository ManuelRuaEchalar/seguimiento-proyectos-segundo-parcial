import { Controller, Get, Put, Body, UseGuards, Post, Req } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { Param } from '@nestjs/common';
import { Request } from 'express';


import { EstudianteService } from './estudiante.service';

@UseGuards(JwtGuard)
@Controller('estudiante')
export class EstudianteController {
  constructor(private readonly estudianteService: EstudianteService) {}

  @UseGuards(JwtGuard)
  @Get('info')
  async getInfo(@Req() req: Request) {
    const user = req.user as { id: number; email: string; rol: string };

    if (user.rol !== 'estudiante') {
      return { message: 'El usuario no es un estudiante' };
    }

    return this.estudianteService.getInfoByUserId(user.id);
  }

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

  // Asignar un proyecto al estudiante logueado
  @Post('asignar-proyecto/:idProyecto')
  async asignarProyecto(
    @GetUser('id') userId: number,
    @Param('idProyecto') idProyecto: number,
  ) {
    return this.estudianteService.asignarProyecto(userId, Number(idProyecto));
  }

  // Ver proyecto de un estudiante (por id)
  @Post('view-project')
  async viewProyect(@Body('id') id: number) {
    console.log('id estudiante ingresado: ', id);
    return this.estudianteService.viewProyect(id);
  }

  @Post('get-by-id')
async getEstudianteById(
  @GetUser('id') requesterId: number,
  @Body('id') id: number,
) {
  console.log(`Usuario autenticado: ${requesterId}, consulta por estudiante: ${id}`);
  return this.estudianteService.getEstudianteById(requesterId, id);
}
}
