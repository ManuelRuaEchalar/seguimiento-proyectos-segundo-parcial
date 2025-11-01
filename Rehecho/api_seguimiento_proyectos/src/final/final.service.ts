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
      tags:
        tags && tags.length > 0
          ? {
              connect: tags.map((tagId) => ({ id: tagId })),
            }
          : undefined,
      // 🔗 Conectar el proyecto por su id en lugar de usar proyecto_id en el objeto raíz
      proyecto: proyecto_id ? { connect: { id: proyecto_id } } : undefined,
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

    // Build a base where clause that avoids database-specific 'mode' options
    const whereBase: any = { estado: 'aprobado' };
    if (carrera) {
      // simple contains (case-sensitivity depends on DB collation)
      whereBase.carrera = { contains: String(carrera) };
    }
    if (año) {
      whereBase.año = parseInt(String(año));
    }

    // Fetch candidates from DB (tags and proyecto included) then apply robust JS filtering
    const candidates = await this.prisma.final.findMany({
      where: whereBase,
      include: { tags: true, proyecto: true },
    });

    // If no titulo filter provided, optionally filter by tag if given and return
    let results = candidates;

    if (tag) {
      const tagLower = String(tag).toLowerCase();
      results = results.filter((f) =>
        (f.tags || []).some((t) =>
          String((t as any).nombre || '')
            .toLowerCase()
            .includes(tagLower),
        ),
      );
    }

    if (titulo) {
      const q = String(titulo).toLowerCase();
      results = results.filter((f) => {
        const t1 = String(f.titulo || '').toLowerCase();
        const t2 = String((f.proyecto as any)?.titulo || '').toLowerCase();
        return t1.includes(q) || t2.includes(q);
      });
    }

    return results;
  }
}
