export interface User {
  id: number;
  nombre?: string;
  apellido?: string;
  email: string;
  rol: string;
  hash?: string;
  estudiante?: { id: number; cu: string; carrera: string; grupo?: Group };
  docente?: { id: number; especialidad: string; grupos?: Group[] };
}

export interface Group {
  id: number;
  nombre: string;
  grado: string;
  docente_id?: number;
  docente?: {
    id: number;
    especialidad: string;
    usuario: { nombre: string; apellido: string };
  } | null;
  estudiantes?: {
    id: number;
    cu: string;
    carrera: string;
    usuario: { nombre: string; apellido: string };
  }[];
}
