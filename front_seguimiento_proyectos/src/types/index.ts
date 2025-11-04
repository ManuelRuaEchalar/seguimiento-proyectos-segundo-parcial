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

export interface StudentProfile {
  id: number;
  cu: string;
  carrera: string;
  proyecto_id: number | null;
  usuario: {
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
  };
  grupo: {
    id: number;
    nombre: string;
    grado: string;
  } | null;
  proyecto?: {
    id: number;
    titulo: string;
    fase_actual: string;
    grado_actual: string;
  } | null;
}

export interface BoundingRect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
  pageNumber: number;
}

export interface Rect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
  pageNumber: number;
}

export interface Position {
  boundingRect: BoundingRect;
  rects: Rect[];
  pageNumber: number;
}

export interface Content {
  text: string;
}

export interface ContentArea {
  image: string;
}

export interface Comment {
  text: string;
  emoji: string;
}

export interface Observacion {
  content: Content;
  position: Position;
  comment: Comment;
  estado: string;
  codigoDoc: number;
  id: string; // Nota: es string, no number
}