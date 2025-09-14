import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EstudianteService {
  constructor(private prisma: PrismaService) {}

  async viewProyect(id: number) {
    console.log(`id recibido: ${id}`);
    // Obtener el estudiante con su proyectoId
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id },
      select: { proyectoId: true }
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    if (!estudiante.proyectoId) {
      throw new NotFoundException('El estudiante no tiene un proyecto asignado');
    }

    // Obtener el proyecto con sus documentos
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { codigoProyecto: estudiante.proyectoId },
      include: {
        documentos: {
          select: {
            codigoDoc: true,
            titulo: true,
            version: true,
            file: true
          }
        }
      }
    });

    if (!proyecto) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Formatear la respuesta
    return {
      codigoProyecto: proyecto.codigoProyecto,
      titulo: proyecto.titulo,
      documentos: proyecto.documentos
    };
  }
}