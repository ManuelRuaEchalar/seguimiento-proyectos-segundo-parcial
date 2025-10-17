// @/components/documento/DocumentoLayoutClientEstudiante.tsx
'use client';
import React from 'react';
import DocumentoNavbar from './DocumentoNavBar';
import SidebarDerecha from './SidebarDerecha';
import { VisualizadorPDFEstudiante } from './VisualizadorPDFEstudiante';
import styles from './style/DocumentoLayoutClientEstudiante.module.css';

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
  const handleObservationClick = (observacion: any) => {
    console.log('Observación seleccionada:', observacion);
    // Aquí puedes implementar la lógica para navegar al comentario
    // Por ejemplo, podrías hacer scroll al highlight correspondiente
  };

  return (
    <div className={styles.documentoPageLayout}>
      <DocumentoNavbar
        nombreDocumento={datosDocumento.titulo}
        version={datosDocumento.version}
        estado={datosDocumento.estado}
        fechaSubida={datosDocumento.fechaSubida}
      />

      <div className={styles.documentoBody}>
        {/* Contenedor del PDF con su sidebar izquierdo interno */}
        <div className={styles.pdfContainer}>
          <VisualizadorPDFEstudiante 
            blob={blob} 
            observaciones={observaciones} 
            correcciones={correcciones} 
            infoProyecto={infoProyecto}
          />
        </div>
        
        {/* Sidebar derecho independiente */}
        <aside className={styles.sidebarContainer}>
          <SidebarDerecha
            observaciones={observacionesProyecto} 
            onObservationClick={handleObservationClick}
          />
        </aside>
      </div>
    </div>
  );
}