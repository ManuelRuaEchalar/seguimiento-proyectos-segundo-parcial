import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GrupoService } from './grupo.service';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { Request } from 'express';

@Controller('grupos')
export class GrupoController {
  constructor(private readonly grupoService: GrupoService) {}

  @Get()
  findAll() {
    return this.grupoService.findAll();
  }

@Patch('asignar-fechas')
@UseGuards(JwtGuard)
asignarFechasGrupo(@Body() body: any) {
  return this.grupoService.asignarFechasGrupo(body);
}

  @Get('grupo-final')
  @UseGuards(JwtGuard)
  obtenerGruposFinal() {
    return this.grupoService.obtenerGruposFinal();
  }

  @Post()
  @UseGuards(JwtGuard)
  create(@Body() createGrupoDto: any) {
    return this.grupoService.create(createGrupoDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.grupoService.findOne(id);
  }

  @Patch(':id/elementos')
  @UseGuards(JwtGuard)
  actualizarElementos(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { elementos: any }
  ) {
    const user = req.user as { id: number; email: string; rol: string };

    if (user.rol !== 'docente') {
      throw new HttpException(
        'Solo los docentes pueden actualizar elementos del grupo',
        HttpStatus.FORBIDDEN
      );
    }

    return this.grupoService.actualizarElementos(id, body.elementos);
  }

  @Post(':id/unirse-grado2')
@UseGuards(JwtGuard)
async unirseAGrupoGrado2(
  @Req() req: Request,
  @Param('id', ParseIntPipe) grupoId: number,
) {
  const user = req.user as { id: number; email: string; rol: string };

  // Verificar rol
  if (user.rol !== 'estudiante') {
    throw new HttpException(
      'Solo los estudiantes pueden unirse a un segundo grupo',
      HttpStatus.FORBIDDEN,
    );
  }

  return this.grupoService.unirseAGrupoGrado2(user.id, grupoId);
}

}