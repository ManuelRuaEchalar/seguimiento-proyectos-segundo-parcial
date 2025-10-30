import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaClient, TipoSolicitud, EstadoSolicitud } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class SolicitudService {
  
  async crearSolicitud(data: {
    tipo: TipoSolicitud;
    proyecto_id: number;
    emisor_id: number;
    receptor_id: number;
  }) {
    try {
      // Validar que tipo sea válido
      if (!Object.values(TipoSolicitud).includes(data.tipo)) {
        throw new HttpException(
          'El tipo debe ser "unirse" o "invitar"',
          HttpStatus.BAD_REQUEST
        );
      }

      // Verificar que el proyecto existe
      const proyecto = await prisma.proyecto.findUnique({
        where: { id: data.proyecto_id }
      });

      if (!proyecto) {
        throw new HttpException('El proyecto especificado no existe', HttpStatus.NOT_FOUND);
      }

      // Verificar que los estudiantes existen
      const emisor = await prisma.estudiante.findUnique({
        where: { id: data.emisor_id }
      });

      const receptor = await prisma.estudiante.findUnique({
        where: { id: data.receptor_id }
      });

      if (!emisor || !receptor) {
        throw new HttpException('Uno o ambos estudiantes no existen', HttpStatus.NOT_FOUND);
      }

      // Verificar que no exista una solicitud pendiente similar
      const solicitudExistente = await prisma.solicitud.findFirst({
        where: {
          tipo: data.tipo,
          proyecto_id: data.proyecto_id,
          emisor_id: data.emisor_id,
          receptor_id: data.receptor_id,
          OR: [
            { aprobacion_receptor: 'pendiente' },
            { aprobacion_docente: 'pendiente' }
          ]
        }
      });

      if (solicitudExistente) {
        throw new HttpException(
          'Ya existe una solicitud pendiente con estos datos',
          HttpStatus.CONFLICT
        );
      }

      // Crear la solicitud
      const solicitud = await prisma.solicitud.create({
        data: {
          tipo: data.tipo,
          proyecto_id: data.proyecto_id,
          emisor_id: data.emisor_id,
          receptor_id: data.receptor_id
        },
        include: {
          proyecto: {
            select: {
              id: true,
              titulo: true
            }
          },
          emisor: {
            select: {
              id: true,
              cu: true,
              usuario: {
                select: {
                  nombre: true,
                  apellido: true
                }
              }
            }
          },
          receptor: {
            select: {
              id: true,
              cu: true,
              usuario: {
                select: {
                  nombre: true,
                  apellido: true
                }
              }
            }
          }
        }
      });

      return {
        message: 'Solicitud creada exitosamente',
        solicitud
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error al crear solicitud:', error);
      throw new HttpException(
        'Error al crear la solicitud',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async responderSolicitud(
    solicitudId: number,
    usuarioId: number,
    rol: string,
    respuesta: 'aceptado' | 'rechazado'
  ) {
    try {
      // Validar respuesta
      if (respuesta !== 'aceptado' && respuesta !== 'rechazado') {
        throw new HttpException(
          'La respuesta debe ser "aceptado" o "rechazado"',
          HttpStatus.BAD_REQUEST
        );
      }

      // Buscar la solicitud
      const solicitud = await prisma.solicitud.findUnique({
        where: { id: solicitudId },
        include: {
          emisor: true,
          receptor: true,
          proyecto: true
        }
      });

      if (!solicitud) {
        throw new HttpException('Solicitud no encontrada', HttpStatus.NOT_FOUND);
      }

      // Determinar qué campo actualizar según el rol
      let campoActualizar: 'aprobacion_receptor' | 'aprobacion_docente';
      
      if (rol === 'estudiante') {
        // Verificar que el estudiante sea el receptor
        if (solicitud.receptor_id !== usuarioId) {
          throw new HttpException(
            'Solo el receptor puede responder esta solicitud',
            HttpStatus.FORBIDDEN
          );
        }
        campoActualizar = 'aprobacion_receptor';
      } else if (rol === 'docente') {
        campoActualizar = 'aprobacion_docente';
      } else {
        throw new HttpException('Rol no autorizado', HttpStatus.FORBIDDEN);
      }

      // Actualizar la solicitud
      const solicitudActualizada = await prisma.solicitud.update({
        where: { id: solicitudId },
        data: {
          [campoActualizar]: respuesta
        },
        include: {
          emisor: true,
          receptor: true,
          proyecto: true
        }
      });

      // Verificar si ambas aprobaciones están aceptadas
      const ambasAceptadas = 
        solicitudActualizada.aprobacion_receptor === 'aceptado' && 
        solicitudActualizada.aprobacion_docente === 'aceptado';

      // Si alguna fue rechazada, no hacer nada más
      const algunaRechazada = 
        solicitudActualizada.aprobacion_receptor === 'rechazado' || 
        solicitudActualizada.aprobacion_docente === 'rechazado';

      if (ambasAceptadas && !algunaRechazada) {
        // Actualizar proyecto_id del estudiante según el tipo de solicitud
        if (solicitudActualizada.tipo === 'unirse') {
          // El emisor se une al proyecto
          await prisma.estudiante.update({
            where: { id: solicitudActualizada.emisor_id },
            data: { proyecto_id: solicitudActualizada.proyecto_id }
          });
        } else if (solicitudActualizada.tipo === 'invitar') {
          // El receptor se une al proyecto
          await prisma.estudiante.update({
            where: { id: solicitudActualizada.receptor_id },
            data: { proyecto_id: solicitudActualizada.proyecto_id }
          });
        }

        return {
          message: 'Solicitud aceptada y estudiante agregado al proyecto',
          solicitud: solicitudActualizada,
          estudianteActualizado: true
        };
      }

      return {
        message: `Solicitud ${respuesta === 'aceptado' ? 'aceptada' : 'rechazada'} por ${rol}`,
        solicitud: solicitudActualizada,
        estudianteActualizado: false
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error al responder solicitud:', error);
      throw new HttpException(
        'Error al procesar la respuesta',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async obtenerSolicitudesPorEstudiante(estudianteId: number) {
    try {
      const [enviadas, recibidas] = await Promise.all([
        prisma.solicitud.findMany({
          where: { emisor_id: estudianteId },
          include: {
            receptor: {
              select: {
                id: true,
                cu: true,
                usuario: {
                  select: {
                    nombre: true,
                    apellido: true
                  }
                }
              }
            },
            proyecto: {
              select: {
                id: true,
                titulo: true
              }
            }
          },
          orderBy: { fecha_envio: 'desc' }
        }),
        prisma.solicitud.findMany({
          where: { receptor_id: estudianteId },
          include: {
            emisor: {
              select: {
                id: true,
                cu: true,
                usuario: {
                  select: {
                    nombre: true,
                    apellido: true
                  }
                }
              }
            },
            proyecto: {
              select: {
                id: true,
                titulo: true
              }
            }
          },
          orderBy: { fecha_envio: 'desc' }
        })
      ]);

      return {
        enviadas,
        recibidas
      };
    } catch (error) {
      console.error('Error al obtener solicitudes:', error);
      throw new HttpException(
        'Error al obtener solicitudes',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async obtenerSolicitudesPendientesDocente(grupoId?: number) {
    try {
      const where: any = {
        aprobacion_docente: 'pendiente'
      };

      // Si se especifica grupo, filtrar por estudiantes de ese grupo
      if (grupoId) {
        where.OR = [
          {
            emisor: {
              grupo_id: grupoId
            }
          },
          {
            receptor: {
              grupo_id: grupoId
            }
          }
        ];
      }

      const solicitudes = await prisma.solicitud.findMany({
        where,
        include: {
          emisor: {
            select: {
              id: true,
              cu: true,
              grupo_id: true,
              usuario: {
                select: {
                  nombre: true,
                  apellido: true
                }
              }
            }
          },
          receptor: {
            select: {
              id: true,
              cu: true,
              grupo_id: true,
              usuario: {
                select: {
                  nombre: true,
                  apellido: true
                }
              }
            }
          },
          proyecto: {
            select: {
              id: true,
              titulo: true
            }
          }
        },
        orderBy: { fecha_envio: 'desc' }
      });

      return solicitudes;
    } catch (error) {
      console.error('Error al obtener solicitudes pendientes:', error);
      throw new HttpException(
        'Error al obtener solicitudes pendientes',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}