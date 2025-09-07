import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { GrupoService } from './grupo.service';
import { JwtGuard } from '../auth/guard';
import { GetUser } from 'src/auth/decorator';

@UseGuards(JwtGuard)
@Controller('grupos')
export class GrupoController {
    constructor(private readonly grupoService: GrupoService) {}

    @Post()
    create(@Body('nombre') nombre: string) {
        return this.grupoService.create(nombre);
    }

    @Get()
    findAll() {
        return this.grupoService.findAll();
    }

    @Get('disponibles')
    getGruposDisponibles() {
        return this.grupoService.getGruposDisponibles();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.grupoService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body('nombre') nombre: string,
    ) {
        return this.grupoService.update(id, nombre);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.grupoService.remove(id);
    }
}