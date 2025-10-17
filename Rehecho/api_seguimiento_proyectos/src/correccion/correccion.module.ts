import { Module } from '@nestjs/common';
import { CorreccionController } from './correccion.controller';
import { CorreccionService } from './correccion.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CorreccionController],
  providers: [CorreccionService],
})
export class CorreccionModule {}
