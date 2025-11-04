// src/types/types.ts
// types.ts
export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
}

export interface Grupo {
  id: number;
  nombre: string;
  grado: string;
  total_actividades: number;
  total_estudiantes: number;
  fase: string;
  fecha_ultima_actividad: string | null;
  fecha_inicio_tema?: string | null;
  fecha_fin_tema?: string | null;
  fecha_inicio_perfil?: string | null;
  fecha_fin_perfil?: string | null;
  fecha_inicio_proyecto?: string | null;
  fecha_fin_proyecto?: string | null;
}

export interface DocenteData {
  id: number;
  especialidad: string;
  usuario: Usuario;
  grupos: Grupo[];
}

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
  fase: string;
  version: number;
  carrera: string;
  cu: string;
}

export type VistaActual = 'pendientes' | 'estudiantes';
export type EstadoRevision = 'pendiente' | 'aprobado' | 'rechazado';