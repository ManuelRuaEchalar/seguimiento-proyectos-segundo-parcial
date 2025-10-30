import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import * as argon from 'argon2';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}
  async deleteGroup(id: number) {
    // Elimina el grupo y sus relaciones
    return this.prisma.grupo.delete({ where: { id } });
  }

  async createUser(createUserDto: CreateUserDto) {
    const hash = await argon.hash(createUserDto.password);
    if (createUserDto.rol === 'estudiante') {
      return this.prisma.usuario.create({
        data: {
          nombre: createUserDto.nombre,
          apellido: createUserDto.apellido,
          email: createUserDto.email,
          hash,
          rol: createUserDto.rol,
          estudiante: {
            create: {
              cu: createUserDto.cu,
              carrera: createUserDto.carrera,
            },
          },
        },
      });
    } else if (createUserDto.rol === 'docente') {
      return this.prisma.usuario.create({
        data: {
          nombre: createUserDto.nombre,
          apellido: createUserDto.apellido,
          email: createUserDto.email,
          hash,
          rol: createUserDto.rol,
          docente: {
            create: {
              especialidad: createUserDto.especialidad,
            },
          },
        },
      });
    } else {
      return this.prisma.usuario.create({
        data: {
          nombre: createUserDto.nombre,
          apellido: createUserDto.apellido,
          email: createUserDto.email,
          hash,
          rol: createUserDto.rol,
        },
      });
    }
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const hash = updateUserDto.password
      ? await argon.hash(updateUserDto.password)
      : undefined;
    return this.prisma.usuario.update({
      where: { id },
      data: {
        nombre: updateUserDto.nombre,
        apellido: updateUserDto.apellido,
        email: updateUserDto.email,
        hash,
        rol: updateUserDto.rol,
        estudiante:
          updateUserDto.cu || updateUserDto.carrera
            ? {
                update: {
                  cu: updateUserDto.cu,
                  carrera: updateUserDto.carrera,
                },
              }
            : undefined,
        docente: updateUserDto.especialidad
          ? {
              update: {
                especialidad: updateUserDto.especialidad,
              },
            }
          : undefined,
      },
    });
  }

  async deleteUser(id: number) {
    // Eliminar relación estudiante si existe
    await this.prisma.estudiante.deleteMany({ where: { id } });
    // Eliminar relación docente si existe
    await this.prisma.docente.deleteMany({ where: { id } });
    // Ahora sí eliminar el usuario
    return this.prisma.usuario.delete({ where: { id } });
  }

async createGroup(createGroupDto: CreateGroupDto) {
  // Validar docente si se envía el ID
  if (createGroupDto.docente_id) {
    const docente = await this.prisma.docente.findUnique({
      where: { id: +createGroupDto.docente_id },
    });
    if (!docente) throw new BadRequestException('Docente no encontrado');
  }

  // Determinar fase según el grado
  let fase: 'tema' | 'proyecto' = 'tema';
  if (createGroupDto.grado === 'grado2') {
    fase = 'proyecto';
  }

  // Crear el grupo
  const nuevoGrupo = await this.prisma.grupo.create({
    data: {
      nombre: createGroupDto.nombre,
      grado: createGroupDto.grado,
      docente_id: createGroupDto.docente_id
        ? +createGroupDto.docente_id
        : null,
      fase, // fase dinámica
    },
  });

  // 👇 Crear actividad inicial automáticamente si es grado1 (fase tema)
  if (createGroupDto.grado === 'grado1' && fase === 'tema') {
    await this.prisma.actividad.create({
      data: {
        nombre: 'Propuesta de tema',
        descripcion:
          'En este apartado el estudiante puede subir sus propuestas de temas',
        fase: 'tema',
        grupo_id: nuevoGrupo.id,
        elementos: [], // puedes poner [] o elementos requeridos por defecto
      },
    });
  }

  return nuevoGrupo;
}


  async getUsers() {
    return this.prisma.usuario.findMany({
      include: {
        estudiante: true,
        docente: true,
      },
    });
  }

  async getGroups() {
    return this.prisma.grupo.findMany({
      include: {
        docente: {
          include: {
            usuario: {
              select: {
                nombre: true,
                apellido: true,
              },
            },
          },
        },
        estudiantes: {
          include: {
            usuario: {
              select: {
                nombre: true,
                apellido: true,
              },
            },
          },
        },
      },
    });
  }

  async getDocentes() {
    return this.prisma.docente.findMany({
      include: {
        usuario: true,
        grupos: true,
      },
    });
  }

  async assignDocenteToGroup(groupId: number, docenteId: number) {
    const docente = await this.prisma.docente.findUnique({
      where: { id: docenteId },
    });
    if (!docente) throw new BadRequestException('Docente no encontrado');

    return this.prisma.grupo.update({
      where: { id: groupId },
      data: { docente_id: docenteId },
    });
  }

  async getEstudiantes() {
    return this.prisma.estudiante.findMany({
      include: {
        usuario: true,
        grupo: true,
        proyecto: true,
      },
    });
  }
  async assignEstudianteToGroup(groupId: number, estudianteId: number) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
    });
    if (!estudiante) throw new BadRequestException('Estudiante no encontrado');

    const group = await this.prisma.grupo.findUnique({
      where: { id: groupId },
    });
    if (!group) throw new BadRequestException('Grupo no encontrado');

    // Verificar si el estudiante ya está en el grupo
    const existingMembership = await this.prisma.grupo.findFirst({
      where: {
        id: groupId,
        estudiantes: { some: { id: estudianteId } },
      },
    });

    if (existingMembership) {
      throw new BadRequestException('El estudiante ya está en este grupo');
    }

    return this.prisma.grupo.update({
      where: { id: groupId },
      data: {
        estudiantes: {
          connect: { id: estudianteId },
        },
      },
      include: {
        estudiantes: true,
      },
    });
  }
}
