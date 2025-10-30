import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { Request } from 'express';

@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @UseGuards(JwtGuard)
  @Post()
  async crearTag(@Req() req: Request, @Body() body: any) {
    const user = req.user as { rol: string };
    if (user.rol !== 'docente') {
      throw new HttpException('Solo los docentes pueden crear tags', HttpStatus.FORBIDDEN);
    }

    return this.tagService.crearTag(body);
  }

  @Get()
  async obtenerTags() {
    return this.tagService.obtenerTags();
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async borrarTag(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { rol: string };
    if (user.rol !== 'docente') {
      throw new HttpException('Solo los docentes pueden borrar tags', HttpStatus.FORBIDDEN);
    }

    return this.tagService.borrarTag(parseInt(id));
  }
}
