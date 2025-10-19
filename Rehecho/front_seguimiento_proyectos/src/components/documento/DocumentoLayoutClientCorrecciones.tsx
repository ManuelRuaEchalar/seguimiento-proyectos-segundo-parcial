'use client';
import React from 'react';
import { VisualizadorPDFCorrecciones } from './VisualizadorPDFCorrecciones';
import { useRouter } from 'next/navigation'; // <- AÑADIR ESTA LÍNEA
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
  const router = useRouter(); // <- AÑADIR ESTA LÍNEA
  
  return (
    <div className={styles.documentoPageLayout}>
      <nav className={styles.simpleNavbar}>
        <div className={styles.instructionContainer}>
          <span className={styles.instructionText}>
            En tu documento selecciona las partes que modificaste y guárdalas para que tu docente las pueda ver.
          </span>
        </div>
        
        {/* AÑADIR ESTE BLOQUE COMPLETO */}
        <button 
          onClick={() => router.back()} 
          className={styles.finishButton}
          aria-label="Finalizar corrección"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Corrección Terminada</span>
        </button>
        {/* FIN DEL BLOQUE */}
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