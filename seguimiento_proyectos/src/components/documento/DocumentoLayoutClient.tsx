// @/components/documento/DocumentoLayoutClient.tsx
'use client';
import React from 'react';
import DocumentoNavbar from './DocumentoNavBar';
import SidebarDerecha from './SidebarDerecha';
import { VisualizadorPDF } from './VisualizadorPDF';
import VisualizadorDocumento from './VisualizadorDocumento';
import SidebarObservaciones from './SidebarObservaciones';

interface DatosDocumento {
  nombreDocumento: string;
  version: string;
  estado: string;
  fechaSubida: string;
  numObservaciones: number;
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

interface Observacion {
  id: number;
  titulo: string;
  autor: string;
  fecha: string;
  hora: string;
  comentario: string;
}

interface DocumentoLayoutClientProps {
  datosDocumento: DatosDocumento;
  datosEstudiante: DatosEstudiante;
  datosProyecto: DatosProyecto;
  observaciones: Observacion[];
  blob: Blob;
  contentType: string;
}

export default function DocumentoLayoutClient({
  datosDocumento,
  datosEstudiante,
  datosProyecto,
  observaciones,
  blob,
  contentType
}: DocumentoLayoutClientProps) {
  return (
    <div className="documento-page-layout">
      <DocumentoNavbar
        nombreDocumento={datosDocumento.nombreDocumento}
        version={datosDocumento.version}
        estado={datosDocumento.estado}
        fechaSubida={datosDocumento.fechaSubida}
        numObservaciones={datosDocumento.numObservaciones}
      />

      <div className="documento-body">
        <div className="pdf-container">
          <VisualizadorPDF blob={blob} />
        </div>
        <SidebarDerecha
          estudiante={datosEstudiante}
          proyecto={datosProyecto}
        />
      </div>
    </div>
  );
}