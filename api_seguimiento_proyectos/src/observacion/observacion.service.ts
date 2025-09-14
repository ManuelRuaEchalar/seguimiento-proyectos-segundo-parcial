import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ObservacionService {
  constructor(private prisma: PrismaService) {}

  async getObservaciones(codigoDoc: number) {
    const observaciones = await this.prisma.observacion.findMany({
      where: { codigoDoc },
    });

    if (!observaciones || observaciones.length === 0) {
      throw new NotFoundException('No se encontraron observaciones para este documento');
    }

    console.log(observaciones);

    return observaciones;
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
        codigoDoc: highlight.codigoDoc // ⚠️ aquí tú decides
      },
    });
  }
}
