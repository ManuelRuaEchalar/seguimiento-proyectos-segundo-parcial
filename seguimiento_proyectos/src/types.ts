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
