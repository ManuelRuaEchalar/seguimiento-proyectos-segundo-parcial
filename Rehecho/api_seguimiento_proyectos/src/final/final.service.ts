import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinalService {
  constructor(private prisma: PrismaService) {}

async crearFinal(data: {
  titulo: string;
  carrera: string;
  año: number;
  estado?: string;
  archivo: string;
  fase: string;
  proyecto_id: number;
  tags?: number[];
}) {
  const { tags, proyecto_id, ...finalData } = data;

  // Crear el final con las relaciones de tags y la relación con proyecto
  const createData: any = {
    ...finalData,
    // 🏷️ Conectar tags existentes usando su ID
    tags: tags && tags.length > 0
      ? {
          connect: tags.map(tagId => ({ id: tagId }))
        }
      : undefined,
    // 🔗 Conectar el proyecto por su id en lugar de usar proyecto_id en el objeto raíz
    proyecto: proyecto_id
      ? { connect: { id: proyecto_id } }
      : undefined,
  };

  const nuevoFinal = await this.prisma.final.create({
    data: createData,
    include: {
      tags: true, // Incluir los tags en la respuesta
      proyecto: true,
    },
  });

  return nuevoFinal;
}

  async borrarFinal(id: number) {
    return this.prisma.final.delete({ where: { id } });
  }

  async actualizarFinal(id: number, data: any) {
    return this.prisma.final.update({ where: { id }, data });
  }

  async obtenerFinalesAprobados() {
    return this.prisma.final.findMany({
      where: { estado: 'aprobado' },
      include: { tags: true, proyecto: true },
    });
  }

async buscarFinales(filtros: any) {
  const { tag, carrera, año, titulo } = filtros;

  return this.prisma.final.findMany({
    where: {
      AND: [
        carrera ? { carrera: { contains: String(carrera), mode: 'insensitive' } } : {},
        año ? { año: parseInt(String(año)) } : {},
        titulo ? { titulo: { contains: String(titulo), mode: 'insensitive' } } : {},
        tag
          ? {
              tags: {
                some: { 
                  nombre: { contains: String(tag) } // Remove mode here
                },
              },
            }
          : {},
      ].filter(condition => Object.keys(condition).length > 0), // Filter out empty objects
      estado: 'aprobado',
    },
    include: { tags: true, proyecto: true },
  });
}
}
