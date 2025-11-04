import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async updateUser(userId: number, body: any) {
    const { nombre, email } = body;
    if (email && typeof email !== 'string') {
      throw new BadRequestException('Email inválido');
    }
    if (nombre && typeof nombre !== 'string') {
      throw new BadRequestException('Nombre inválido');
    }
    return this.prisma.usuario.update({
      where: { id: userId },
      data: {
        ...(nombre && { nombre }),
        ...(email && { email }),
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
      },
    });
  }

  async getProfile(userId: number) {
    return this.prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
      },
    });
  }

async joinGroup(userId: number, groupId: number) {
  const user = await this.prisma.usuario.findUnique({
    where: { id: userId },
  });

  if (!user || user.rol !== 'estudiante') {
    throw new ForbiddenException('Solo los estudiantes pueden unirse a un grupo');
  }

  const group = await this.prisma.grupo.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    throw new BadRequestException('Grupo no encontrado');
  }

  // Verificar si el estudiante ya está en el grupo
  const existingMembership = await this.prisma.grupo.findFirst({
    where: {
      id: groupId,
      estudiantes: { some: { usuario: { id: userId } } },
    },
  });

  if (existingMembership) {
    throw new BadRequestException('Ya estás en este grupo');
  }

  // 🧠 Buscar al estudiante vinculado al usuario
  const estudiante = await this.prisma.estudiante.findUnique({
    where: { id: userId },
  });

  if (!estudiante) {
    throw new BadRequestException('No se encontró el registro del estudiante');
  }

  // 🧩 Iniciamos una transacción para mantener coherencia
  return this.prisma.$transaction(async (tx) => {
    // 1️⃣ Actualizar grupo: conectar estudiante y aumentar contador
    const updatedGroup = await tx.grupo.update({
      where: { id: groupId },
      data: {
        estudiantes: {
          connect: { id: userId },
        },
        total_estudiantes: {
          increment: 1,
        },
      },
      include: {
        estudiantes: true,
      },
    });

    // 2️⃣ Si el grupo es de grado1 → crear un proyecto y asignarlo al estudiante
    if (group.grado === 'grado1') {
      const nuevoProyecto = await tx.proyecto.create({
        data: {
          titulo: null, // sin título
          fase_actual: 'tema',
          grado_actual: 'grado1',
          estudiantes: {
            connect: { id: userId },
          },
        },
      });

      // 3️⃣ Actualizar el estudiante para vincular el nuevo proyecto
      await tx.estudiante.update({
        where: { id: userId },
        data: {
          proyecto_id: nuevoProyecto.id,
        },
      });
    }

    return updatedGroup;
  });
}


}
