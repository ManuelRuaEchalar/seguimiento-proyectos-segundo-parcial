'use client';
import React from 'react';
import { VisualizadorPDFCorrecciones } from './VisualizadorPDFCorrecciones';
import styles from './style/DocumentoLayoutClientCorrecciones.module.css';

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

export default function DocumentoLayoutClientCorrecciones({
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
  console.log("observaciones recibidas del padre: ", observaciones);
  
  return (
    <div className={styles.documentoPageLayout}>
      <nav className={styles.simpleNavbar}>
        <div className={styles.instructionContainer}>
          <span className={styles.instructionText}>
            En tu documento selecciona las partes que modificaste y guárdalas para que tu docente las pueda ver.
          </span>
        </div>
      </nav>

      <div className={styles.documentoBody}>
        <div className={styles.pdfContainer}>
          <VisualizadorPDFCorrecciones 
            blob={blob} 
            observaciones={observacionesProyecto} 
            correcciones={correcciones} 
            infoProyecto={infoProyecto}
          />
        </div>
      </div>
    </div>
  );
}