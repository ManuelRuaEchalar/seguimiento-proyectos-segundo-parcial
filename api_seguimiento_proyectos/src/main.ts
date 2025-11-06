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
  origin: [process.env.FRONTEND_URL || 'http://localhost:4000'],
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept',
});


  app.use(cookieParser());

  const prismaService = app.get(PrismaService);
  const configService = app.get(ConfigService);

  // Agregar lógica de reintentos para la conexión de base de datos
  let retries = 10;
  while (retries > 0) {
    try {
      await prismaService.$connect();
      console.log('✅ Base de datos conectada exitosamente');
      break;
    } catch (error) {
      retries--;
      console.log(`❌ Conexión a la base de datos falló. Reintentos restantes: ${retries}`);
      if (retries === 0) {
        console.error('No se pudo conectar a la base de datos después de varios intentos');
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  const adminEmail = configService.get<string>('ADMIN_EMAIL');
  const adminPassword = configService.get<string>('ADMIN_PASSWORD');
  const adminName = configService.get<string>('ADMIN_NAME');
  const adminLastname = configService.get<string>('ADMIN_LASTNAME');
  const adminRole = configService.get<string>('ADMIN_ROLE', 'admin');

  if (adminEmail && adminPassword && adminName && adminLastname) {
    try {
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
            rol: adminRole as any,
          },
        });
        console.log('✅ Usuario admin creado por defecto');
      } else {
        console.log('ℹ️ Usuario admin ya existe');
      }
    } catch (error) {
      console.error('❌ Error al crear usuario admin:', error);
    }
  }

  await app.listen(3000);
  console.log('🚀 Aplicación corriendo en el puerto 3000');
}
bootstrap();