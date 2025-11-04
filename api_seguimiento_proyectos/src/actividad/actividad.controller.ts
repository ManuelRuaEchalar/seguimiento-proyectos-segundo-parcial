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
  HttpStatus
} from '@nestjs/common';
import { ActividadService } from './actividad.service';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { Request } from 'express';

@Controller('actividad')
@UseGuards(JwtGuard)
export class ActividadController {
  constructor(private readonly actividadService: ActividadService) {}

  @Post()
  async crearActividad(@Req() req: Request, @Body() body: any) {
    const user = req.user as { id: number; email: string; rol: string };

    if (user.rol !== 'docente') {
      throw new HttpException('Solo los docentes pueden crear actividades', HttpStatus.FORBIDDEN);
    }

    return this.actividadService.crearActividad(body);
  }

  @Delete(':id')
  async borrarActividad(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { id: number; email: string; rol: string };

    if (user.rol !== 'docente') {
      throw new HttpException('Solo los docentes pueden borrar actividades', HttpStatus.FORBIDDEN);
    }

    return this.actividadService.borrarActividad(parseInt(id));
  }

  @Put(':id')
  async editarActividad(
    @Req() req: Request, 
    @Param('id') id: string, 
    @Body() body: any
  ) {
    const user = req.user as { id: number; email: string; rol: string };

    if (user.rol !== 'docente') {
      throw new HttpException('Solo los docentes pueden editar actividades', HttpStatus.FORBIDDEN);
    }

    return this.actividadService.editarActividad(parseInt(id), body);
  }

  @Get('grupo/:grupoId')
  async obtenerActividadesPorGrupo(
    @Req() req: Request, 
    @Param('grupoId') grupoId: string
  ) {
    const user = req.user as { id: number; email: string; rol: string };

    // Tanto docentes como estudiantes pueden ver las actividades de un grupo
    if (user.rol !== 'docente' && user.rol !== 'estudiante') {
      throw new HttpException('No tienes permiso para ver estas actividades', HttpStatus.FORBIDDEN);
    }

    return this.actividadService.obtenerActividadesPorGrupo(parseInt(grupoId));
  }
}