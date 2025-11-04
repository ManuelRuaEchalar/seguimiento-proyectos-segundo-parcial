// @/components/documento/DocumentoLayoutClientEstudiante.tsx
'use client';
import React from 'react';
import DocumentoNavbar from './DocumentoNavBar';
import { VisualizadorPDFEstudiante } from './VisualizadorPDFEstudiante';
import styles from './style/DocumentoLayoutClientEstudiante.module.css';

interface DatosDocumento {
  titulo: string;
  version: string;
  estado: string;
  fechaSubida: string;
  file: string;
  fase: string;
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
  observacionesProyecto: any[];
  correcciones: any[];
  blob: Blob;
  infoProyecto: infoProyecto;
  contentType: string;
}

export default function DocumentoLayoutClientEstudiante({
  datosDocumento,
  datosEstudiante,
  datosProyecto,
  observaciones,
  correcciones,
  blob,
  infoProyecto,
  observacionesProyecto,
  contentType
}: DocumentoLayoutClientProps) {
  return (
    <div className={styles.documentoPageLayout}>
      <DocumentoNavbar
        nombreDocumento={datosDocumento.titulo}
        version={datosDocumento.version}
        estado={datosDocumento.estado}
        fechaSubida={datosDocumento.fechaSubida}
        fase={datosDocumento.fase}
      />

      <div className={styles.documentoBody}>
        <div className={styles.pdfContainer}>
          <VisualizadorPDFEstudiante 
            blob={blob} 
            observaciones={observaciones} 
            correcciones={correcciones} 
            infoProyecto={infoProyecto}
            observacionesProyecto={observacionesProyecto}
          />
        </div>
      </div>
    </div>
  );
}