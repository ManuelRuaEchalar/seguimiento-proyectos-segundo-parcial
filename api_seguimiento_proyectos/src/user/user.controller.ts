import { Body, Controller, Get, UnauthorizedException, UseGuards, Req, Inject, Patch, BadRequestException, Post } from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { Request as ExpressRequest } from 'express';
import { PrismaService } from 'src/prisma/prisma.service'; // Ajusta la ruta según tu estructura

interface RequestWithCookies extends ExpressRequest {
  cookies: { [key: string]: string };
}

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private prisma: PrismaService) { }

  @Get('me')
  async getMe(@Req() req: RequestWithCookies, @GetUser() user: any) {
    if (!req.cookies?.access_token) {
      throw new UnauthorizedException();
    }

    let extraData = {};

    if (user.rol === 'estudiante') {
      const estudiante = await this.prisma.estudiante.findUnique({
        where: { id: user.id },
        select: { cu: true, carrera: true, grupo_id: true }
      });
      if (estudiante) {
        extraData = {
          cu: estudiante.cu,
          carrera: estudiante.carrera,
          grupo_id: estudiante.grupo_id
        };
      }
    } else if (user.rol === 'docente') {
      const docente = await this.prisma.docente.findUnique({
        where: { id: user.id },
        select: { grupo_id: true }
      });
      if (docente) {
        extraData = { grupo_id: docente.grupo_id };
      }
    }

    return {
      user_id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      rol: user.rol,
      ...extraData
    };
  }

  @Patch()
  editUser() { }

  @Patch('change-group')
  async changeGroup(
    @Req() req: RequestWithCookies,
    @Body() body: { user_id: number; rol: string; grupo_id: number },
  ) {

    console.log("cambio de grupo solicitado");
    
    console.log(body.grupo_id);
    // Verificar token de acceso
    if (!req.cookies?.access_token) {
      throw new UnauthorizedException('Token de acceso requerido');
    }

    // Validar que el rol sea estudiante
    if (body.rol !== 'estudiante') {
      throw new BadRequestException('Solo los estudiantes pueden cambiar de grupo');
    }

    try {
      // Actualizar el grupo del estudiante
      const updatedEstudiante = await this.prisma.estudiante.update({
        where: { id: body.user_id },
        data: { grupo_id: body.grupo_id },
      });

      return {
        message: 'Grupo actualizado exitosamente',
        data: updatedEstudiante,
      };
    } catch (error) {
      // Manejar errores de prisma
      if (error.code === 'P2025') {
        throw new BadRequestException('Estudiante no encontrado');
      }
      throw new BadRequestException('Error al actualizar el grupo');
    }
  }

  @Post('mis-estudiantes')
  async getMisEstudiantes(
    @Req() req: RequestWithCookies,
    @Body() body: { grupo_id: number },
  ) {
    if (!req.cookies?.access_token) {
      throw new UnauthorizedException();
    }

    const estudiantes = await this.prisma.estudiante.findMany({
      where: {
        grupo_id: body.grupo_id,
      },
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    return estudiantes.map((estudiante) => ({
      user_id: estudiante.id,
      nombre: estudiante.usuario.nombre,
      apellido: estudiante.usuario.apellido,
      carrera: estudiante.carrera,
      cu: estudiante.cu,
    }));
  }
}