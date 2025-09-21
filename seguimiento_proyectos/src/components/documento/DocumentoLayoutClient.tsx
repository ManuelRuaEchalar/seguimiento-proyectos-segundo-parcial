// @/components/documento/DocumentoLayoutClient.tsx
'use client';
import React from 'react';
import DocumentoNavbar from './DocumentoNavBar';
import SidebarDerecha from './SidebarDerecha';
import { VisualizadorPDF } from './VisualizadorPDF';

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


interface DocumentoLayoutClientProps {
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

export default function DocumentoLayoutClient({
  datosDocumento,
  datosEstudiante,
  datosProyecto,
  observaciones,
  observacionesArea,
  blob,
  infoProyecto,
  observacionesProyecto,
  contentType
}: DocumentoLayoutClientProps) {
  console.log("observaciones recibidas del padre: ", observaciones);
  return (
    <div className="documento-page-layout">
      <DocumentoNavbar
        nombreDocumento={datosDocumento.titulo}
        version={datosDocumento.version}
        estado={datosDocumento.estado}
        fechaSubida={datosDocumento.fechaSubida}
      />

      <div className="documento-body">
        <div className="pdf-container">
          <VisualizadorPDF blob={blob} observaciones={observaciones} observacionesArea={observacionesArea} infoProyecto={infoProyecto}/>
        </div>
        <SidebarDerecha
          observaciones={observacionesProyecto}
        />
      </div>
    </div>
  );
}