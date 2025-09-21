import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import path from 'path';
import fs from 'fs/promises';

@Injectable()
export class ObservacionService {
  constructor(private prisma: PrismaService) { }

  async getObservaciones(codigoDoc: number) {
    const observaciones = await this.prisma.observacion.findMany({
      where: { codigoDoc },
    });

    console.log(observaciones);

    return observaciones;
  }

  async getProjectObservaciones(codigoProyecto: number, codigoDoc: number) {
    const observaciones = await this.prisma.observacion.findMany({
      where: {
        codigoProyecto,
        codigoDoc: {
          not: codigoDoc,
        },
      },
    });

    console.log(`Observaciones para codigoProyecto: ${codigoProyecto}, excluyendo codigoDoc: ${codigoDoc}`, observaciones);


    return observaciones;
  }

  async getObservacionesArea(codigoDoc: number) {
    const observaciones = await this.prisma.observacionArea.findMany({
      where: { codigoDoc },
    });

    console.log(observaciones);

    // Agregar un campo con la URL pública para la imagen
    return observaciones.map((obs) => ({
      ...obs,
      imageUrl: obs.contentImage
        ? `/observacion/area/${obs.id}/image`
        : null,
    }));
  }

  async getObservacionAreaById(id: string) {
    return this.prisma.observacionArea.findUnique({
      where: { id },
    });
  }

  async createObservacion(highlight: any) {
    return this.prisma.observacion.create({
      data: {
        id: highlight.id,
        contentText: highlight.content.text,
        commentText: highlight.comment?.text || null,
        commentEmoji: highlight.comment?.emoji || null,
        estado: highlight.estado,
        boundingX1: highlight.position.boundingRect.x1,
        boundingY1: highlight.position.boundingRect.y1,
        boundingX2: highlight.position.boundingRect.x2,
        boundingY2: highlight.position.boundingRect.y2,
        boundingPage: highlight.position.pageNumber,
        rects: highlight.position.rects,
        codigoDoc: highlight.codigoDoc,
        codigoProyecto: highlight.codigoProyecto,
      },
    });
  }



  // Agregar este método al ObservacionService
  async createObservacionArea(highlight: any) {
    return this.prisma.observacionArea.create({
      data: {
        id: highlight.id,
        contentImage: highlight.content.image || null, // aquí ya está el path final
        commentText: highlight.comment?.text || null,
        commentEmoji: highlight.comment?.emoji || null,
        estado: highlight.estado,
        boundingX1: highlight.position.boundingRect.x1,
        boundingY1: highlight.position.boundingRect.y1,
        boundingX2: highlight.position.boundingRect.x2,
        boundingY2: highlight.position.boundingRect.y2,
        boundingPage: highlight.position.pageNumber,
        rects: highlight.position.rects,
        codigoDoc: highlight.codigoDoc,
        codigoProyecto: highlight.codigoProyecto,
      },
    });
  }
}