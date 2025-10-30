import { 
  Controller, 
  Post, 
  Get,
  Put,
  Body, 
  Param,
  Query,
  UseGuards, 
  Req,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { SolicitudService } from './solicitud.service';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { Request } from 'express';

@Controller('solicitud')
@UseGuards(JwtGuard)
export class SolicitudController {
  constructor(private readonly solicitudService: SolicitudService) {}

  @Post()
  async crearSolicitud(@Req() req: Request, @Body() body: any) {
    const user = req.user as { id: number; email: string; rol: string };

    // Solo estudiantes pueden crear solicitudes
    if (user.rol !== 'estudiante') {
      throw new HttpException(
        'Solo los estudiantes pueden crear solicitudes',
        HttpStatus.FORBIDDEN
      );
    }

    return this.solicitudService.crearSolicitud(body);
  }

  @Put(':id/responder')
  async responderSolicitud(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { respuesta: 'aceptado' | 'rechazado' }
  ) {
    const user = req.user as { id: number; email: string; rol: string };

    // Tanto estudiantes como docentes pueden responder
    if (user.rol !== 'estudiante' && user.rol !== 'docente') {
      throw new HttpException(
        'No tienes permiso para responder solicitudes',
        HttpStatus.FORBIDDEN
      );
    }

    return this.solicitudService.responderSolicitud(
      parseInt(id),
      user.id,
      user.rol,
      body.respuesta
    );
  }

  @Get('estudiante/:id')
  async obtenerSolicitudesPorEstudiante(
    @Req() req: Request,
    @Param('id') id: string
  ) {
    const user = req.user as { id: number; email: string; rol: string };

    // Verificar que el estudiante solo pueda ver sus propias solicitudes
    // o que sea docente
    if (user.rol === 'estudiante' && user.id !== parseInt(id)) {
      throw new HttpException(
        'Solo puedes ver tus propias solicitudes',
        HttpStatus.FORBIDDEN
      );
    }

    return this.solicitudService.obtenerSolicitudesPorEstudiante(parseInt(id));
  }

  @Get('pendientes-docente')
  async obtenerSolicitudesPendientesDocente(
    @Req() req: Request,
    @Query('grupo_id') grupoId?: string
  ) {
    const user = req.user as { id: number; email: string; rol: string };

    if (user.rol !== 'docente') {
      throw new HttpException(
        'Solo los docentes pueden ver solicitudes pendientes',
        HttpStatus.FORBIDDEN
      );
    }

    return this.solicitudService.obtenerSolicitudesPendientesDocente(
      grupoId ? parseInt(grupoId) : undefined
    );
  }
}