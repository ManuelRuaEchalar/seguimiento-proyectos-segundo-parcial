import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { GrupoModule } from '../grupo/grupo.module';
import { JwtStrategy } from './strategy';

@Module({
    imports: [
        JwtModule.register({}),
        PrismaModule,
        GrupoModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
})
export class AuthModule {}