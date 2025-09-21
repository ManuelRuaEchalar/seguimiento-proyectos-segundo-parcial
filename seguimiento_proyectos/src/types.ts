export interface Documento {
  codigoDoc: number;
  titulo: string;
  version: number;
  file: string;
}

export interface ProyectoData {
  codigoProyecto: number;
  titulo: string;
  documentos: Documento[];
}

export interface Estudiante {
  user_id: string;
  nombre: string;
  apellido: string;
  carrera: string;
  cu: string;
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

export interface ObservacionArea {
  content: ContentArea;
  position: Position;
  comment: Comment;
  estado: string;
  codigoDoc: number;
  id: string; // Nota: es string, no number
}

