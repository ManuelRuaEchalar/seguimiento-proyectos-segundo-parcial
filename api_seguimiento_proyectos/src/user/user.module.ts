// user.module.ts
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Ajusta la ruta según tu estructura

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
})
export class UserModule {}