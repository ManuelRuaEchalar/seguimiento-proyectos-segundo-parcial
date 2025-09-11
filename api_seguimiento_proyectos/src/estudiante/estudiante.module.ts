import { Module } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { EstudianteController } from './estudiante.controller';

@Module({
  providers: [EstudianteService],
  controllers: [EstudianteController]
})
export class EstudianteModule {}
