import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EstudianteModule } from './estudiante/estudiante.module';
import { DocenteModule } from './docente/docente.module';
import { PrismaModule } from './prisma/prisma.module';
import { GrupoModule } from './grupo/grupo.module';
import { ProyectoModule } from './proyecto/proyecto.module';
import { DocumentoModule } from './documento/documento.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
AuthModule, 
UserModule, 
EstudianteModule, 
DocenteModule, 
PrismaModule, GrupoModule, ProyectoModule, DocumentoModule],
})
export class AppModule {}