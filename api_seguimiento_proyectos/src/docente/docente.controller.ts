import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { DocenteService } from './docente.service';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { Request } from 'express';

@Controller('docente')
export class DocenteController {
  constructor(private readonly docenteService: DocenteService) {}

  @UseGuards(JwtGuard)
  @Get('info')
  async getInfo(@Req() req: Request) {
    const user = req.user as { id: number; email: string; rol: string };

    if (user.rol !== 'docente') {
      return { message: 'El usuario no es un docente' };
    }

    return this.docenteService.getInfoByUserId(user.id);
  }

  // Rutas existentes
  @Get()
  findAll() {
    return this.docenteService.findAll();
  }

  @Get(':id')
  findOne(@Req() req) {
    return this.docenteService.findOne(parseInt(req.params.id));
  }
}
