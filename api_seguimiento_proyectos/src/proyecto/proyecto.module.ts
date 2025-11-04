import { Module } from '@nestjs/common';
import { ProyectoService } from './proyecto.service';
import { ProyectoController } from './proyecto.controller';
import { PrismaModule } from '../prisma/prisma.module'; // 👈 IMPORTANTE

@Module({
  imports: [PrismaModule], // 👈 esto habilita PrismaService en este módulo
  providers: [ProyectoService],
  controllers: [ProyectoController],
})
export class ProyectoModule {}
