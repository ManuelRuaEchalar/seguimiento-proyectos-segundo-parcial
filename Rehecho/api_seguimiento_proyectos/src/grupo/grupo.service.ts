import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GrupoService {
  constructor(private prisma: PrismaService) {}

  async actualizarElementos(grupoId: number, elementos: any): Promise<{ message: string; grupo: any }> {
    try {
      // Verificar que el grupo existe
      const grupo = await this.prisma.grupo.findUnique({
        where: { id: grupoId }
      });

      if (!grupo) {
        throw new HttpException(
          'El grupo especificado no existe',
          HttpStatus.NOT_FOUND
        );
      }

      // Actualizar los elementos del grupo
      const grupoActualizado = await this.prisma.grupo.update({
        where: { id: grupoId },
        data: {
          elementos: elementos
        },
        include: {
          docente: {
            include: {
              usuario: {
                select: {
                  nombre: true,
                  apellido: true,
                  email: true
                }
              }
            }
          }
        }
      });

      return {
        message: 'Elementos del grupo actualizados exitosamente',
        grupo: grupoActualizado
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error al actualizar los elementos del grupo',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }


async create(data: {
  nombre: string;
  grado: string;
  docente_id?: number;
}): Promise<any> {
  // Determinar la fase según el grado
  let fase = "tema";
  if (data.grado === "grado2") {
    fase = "proyecto";
  }

  return this.prisma.grupo.create({
    data: {
      nombre: data.nombre,
      grado: data.grado as any as import('../../node_modules/.prisma/client').$Enums.Grado,
      docente_id: data.docente_id,
      fase,
    },
    include: {
      docente: true,
    },
  });
}


  async findAll(): Promise<any[]> {
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

  async findOne(id: number): Promise<any> {
    return this.prisma.grupo.findUnique({
      where: { id },
      include: {
        docente: true, // Relación correcta
      },
    });
  }
}
