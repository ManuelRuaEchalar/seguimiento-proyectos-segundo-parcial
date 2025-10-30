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
}