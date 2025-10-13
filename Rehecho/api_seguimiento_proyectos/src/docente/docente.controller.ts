import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { DocenteService } from './docente.service';

@Controller('docente')
export class DocenteController {
  constructor(private readonly docenteService: DocenteService) {}

  @Get()
  findAll() {
    return this.docenteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.docenteService.findOne(id);
  }
}
