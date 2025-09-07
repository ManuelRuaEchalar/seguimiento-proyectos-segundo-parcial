import { Module } from '@nestjs/common';
import { GrupoService } from './grupo.service';
import { GrupoController } from './grupo.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [GrupoController],
    providers: [GrupoService],
    exports: [GrupoService], // Exportamos para usarlo en otros módulos
})
export class GrupoModule {}