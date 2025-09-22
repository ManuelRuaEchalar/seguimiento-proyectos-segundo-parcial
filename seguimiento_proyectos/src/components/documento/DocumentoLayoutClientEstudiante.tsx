// @/components/documento/DocumentoLayoutClientEstudiante.tsx
'use client';
import React from 'react';
import DocumentoNavbarEstudiante from './DocumentoNavbarEstudiante';
// Make sure the file exists at the specified path or update the path if necessary
import { VisualizadorPDFEstudiante } from './VisualizadorPDFEstudiante';

interface DatosDocumento {
  titulo: string;
  version: string;
  estado: string;
  fechaSubida: string;
  file: string;
}

interface DatosEstudiante {
  nombre: string;
  carrera: string;
  semestre: string;
}

interface DatosProyecto {
  titulo: string;
  descripcion: string;
  fechaEntrega: string;
}

interface infoProyecto {
  codigoProyecto: number;
  codigoDoc: number;
}

interface DocumentoLayoutClientEstudianteProps {
  datosDocumento: DatosDocumento;
  datosEstudiante: DatosEstudiante;
  datosProyecto: DatosProyecto;
  observaciones: any[];
  observacionesArea: any[];
  observacionesProyecto: any[];
  blob: Blob;
  infoProyecto: infoProyecto;
  contentType: string;
}

export default function DocumentoLayoutClientEstudiante({
  datosDocumento,
  datosEstudiante,
  datosProyecto,
  observaciones,
  observacionesArea,
  blob,
  infoProyecto,
  observacionesProyecto,
  contentType
}: DocumentoLayoutClientEstudianteProps) {
  return (
    <div className="documento-page-layout">
      <DocumentoNavbarEstudiante
        nombreDocumento={datosDocumento.titulo}
        version={datosDocumento.version}
        estado={datosDocumento.estado}
        fechaSubida={datosDocumento.fechaSubida}
      />

      <div className="documento-body">
        <div className="pdf-container">
          <VisualizadorPDFEstudiante 
            blob={blob} 
            observaciones={observaciones} 
            observacionesArea={observacionesArea} 
            infoProyecto={infoProyecto}
          />
        </div>
        {/* Espacio vacío en la derecha */}
        <aside className="sidebar-derecha"></aside>
      </div>
    </div>
  );
}