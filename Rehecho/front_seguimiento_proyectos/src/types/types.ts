// src/types/types.ts

export interface Docente {
  nombre: string;
  correo: string;
  grupos: string[];
}

export interface Pendiente {
  id: number;
  titulo: string;
  tema: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  estudiante: string;
  carrera: string;
  cu: string;
}

export type VistaActual = 'pendientes' | 'estudiantes';
export type EstadoRevision = 'pendiente' | 'aprobado' | 'rechazado';