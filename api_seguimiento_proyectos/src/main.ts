import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as argon from 'argon2';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4000',
    credentials: true,
  });

  app.use(cookieParser());

  const prismaService = app.get(PrismaService);
  const configService = app.get(ConfigService);

  const adminEmail = configService.get<string>('ADMIN_EMAIL');
  const adminPassword = configService.get<string>('ADMIN_PASSWORD');
  const adminName = configService.get<string>('ADMIN_NAME');
  const adminLastname = configService.get<string>('ADMIN_LASTNAME');
  const adminRole = configService.get<string>('ADMIN_ROLE', 'admin'); // Valor por defecto 'admin'

  if (adminEmail && adminPassword && adminName && adminLastname) {
    const existingAdmin = await prismaService.usuario.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hash = await argon.hash(adminPassword);
      await prismaService.usuario.create({
        data: {
          nombre: adminName,
          apellido: adminLastname,
          email: adminEmail,
          hash,
          rol: adminRole as any, // Rol configurable desde .env
        },
      });
      console.log('Usuario admin creado por defecto');
    }
  }

  await app.listen(3000);
}
bootstrap();
