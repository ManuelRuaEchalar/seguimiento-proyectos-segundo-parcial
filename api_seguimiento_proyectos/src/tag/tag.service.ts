import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  async crearTag(data: any) {
    return this.prisma.tag.create({ data });
  }

  async obtenerTags() {
    return this.prisma.tag.findMany();
  }

  async borrarTag(id: number) {
    return this.prisma.tag.delete({ where: { id } });
  }
}
