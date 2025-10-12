import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { GrupoService } from './grupo.service';
import { JwtGuard } from '../auth/guard/jwt.guard';

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
}
