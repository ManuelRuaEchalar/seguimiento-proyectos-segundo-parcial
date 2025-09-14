// @/components/documento/DocumentoLayoutClient.tsx
'use client';
import React from 'react';
import DocumentoNavbar from './DocumentoNavBar';
import SidebarDerecha from './SidebarDerecha';
import { VisualizadorPDF } from './VisualizadorPDF';

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



interface DocumentoLayoutClientProps {
  datosDocumento: DatosDocumento;
  datosEstudiante: DatosEstudiante;
  datosProyecto: DatosProyecto;
  observaciones: any[];
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
  console.log("observaciones recibidas del padre: ", observaciones);
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
          <VisualizadorPDF blob={blob} observaciones={observaciones}/>
        </div>
        <SidebarDerecha
          estudiante={datosEstudiante}
          proyecto={datosProyecto}
        />
      </div>
    </div>
  );
}