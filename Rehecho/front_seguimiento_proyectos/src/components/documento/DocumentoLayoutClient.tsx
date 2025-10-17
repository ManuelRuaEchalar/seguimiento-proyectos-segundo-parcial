'use client';
import React, { useState, useCallback, useMemo } from 'react';
// Eliminar importación de SidebarDerecha
import { VisualizadorPDF } from './VisualizadorPDF';
import { fetchDoc } from '@/services/proyecto';
import { fetchObservaciones } from '@/services/observaciones';
import { fetchCorrecciones } from '@/services/correcciones';
import { createObservacion } from '@/services/observaciones';
import styles from './style/DocumentoLayoutClient.module.css';

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

export default function DocumentoLayoutClient({
  datosDocumento,
  datosEstudiante,
  datosProyecto,
  observaciones,
  observacionesProyecto,
  correcciones,
  blob,
  infoProyecto,
  contentType,
}: DocumentoLayoutClientProps) {
  const [secondBlob, setSecondBlob] = useState<Blob | null>(null);
  const [secondContentType, setSecondContentType] = useState<string | null>(null);
  const [selectedObservation, setSelectedObservation] = useState<any | null>(null);
  const [secondInfoProyecto, setSecondInfoProyecto] = useState<infoProyecto | null>(null);
  const [secondObservaciones, setSecondObservaciones] = useState<any[] | null>(null);
  const [secondCorrecciones, setSecondCorrecciones] = useState<any[] | null>(null);

  console.log('📦 DocumentoLayoutClient - observacionesProyecto original:', {
  total: observacionesProyecto?.length || 0,
  datos: observacionesProyecto,
  primeraObservacion: observacionesProyecto?.[0]
});

  // Modificar correcciones del primer visualizador para convertir observacion_id a string
  const modifiedCorrecciones = useMemo(() => {
    return correcciones.map(c => ({ ...c, observacion_id: String(c.observacion_id) }));
  }, [correcciones]);

  // Preparar observaciones locales (del documento actual)
  const observacionesLocales = useMemo(() => {
    return observaciones || [];
  }, [observaciones]);

  // Preparar observaciones de otras versiones
const observacionesOtrasVersiones = useMemo(() => {
  const result = (observacionesProyecto || [])
    .filter(obs => obs.documento_id !== infoProyecto.codigoDoc)
    .map(obs => ({
      ...obs,
      // Normalizar la estructura para que coincida con el Sidebar
      comment: { text: obs.commentText || obs.comment?.text || '' },
      content: { text: obs.contentText || obs.content?.text || '' },
      position: { 
        pageNumber: obs.boundingPage || obs.position?.pageNumber || 1 
      },
      // Marcar como observación de otra versión
      esDeOtraVersion: true
    }));
  
  console.log('📋 DocumentoLayoutClient - observacionesOtrasVersiones:', {
    total: result.length,
    datos: result,
    primeraObservacion: result[0] // Ver estructura completa de la primera
  });
  
  return result;
}, [observacionesProyecto, infoProyecto.codigoDoc]);
  const handleObservationClick = useCallback(async (observacion: any) => {
    console.log("Clicked observation:", observacion);
    
    try {
      // Si es una observación de otra versión, cargar comparación
      if (observacion.esDeOtraVersion) {
        const { blob: newBlob, contentType: newContentType } = await fetchDoc(observacion.documento_id);
        const newObs = await fetchObservaciones(observacion.documento_id);
        const newCorr = await fetchCorrecciones(observacion.documento_id);

        const newCorrWithString = newCorr.map((c: { observacion_id: any; }) => ({ 
          ...c, 
          observacion_id: String(c.observacion_id) 
        }));

        setSecondBlob(newBlob);
        setSecondContentType(newContentType);
        setSecondObservaciones(newObs);
        setSecondCorrecciones(newCorrWithString);
        setSecondInfoProyecto({
          codigoProyecto: infoProyecto.codigoProyecto,
          codigoDoc: observacion.documento_id,
        });
        setSelectedObservation({ 
          ...observacion, 
          codigoDoc: observacion.documento_id 
        });
      } else {
        // Si es una observación local, solo navegar a ella
        setSelectedObservation({ 
          ...observacion, 
          codigoDoc: infoProyecto.codigoDoc 
        });
        setSecondBlob(null);
        setSecondContentType(null);
        setSecondObservaciones(null);
        setSecondCorrecciones(null);
        setSecondInfoProyecto(null);
      }
    } catch (error) {
      console.error('Error fetching second document:', error);
    }
  }, [infoProyecto.codigoDoc, infoProyecto.codigoProyecto]);

  const handleApprovalComplete = useCallback(() => {
    setSelectedObservation(null);
    setSecondBlob(null);
    setSecondContentType(null);
    setSecondObservaciones(null);
    setSecondCorrecciones(null);
    setSecondInfoProyecto(null);
  }, []);

  const handleRejectionWithNewObservation = useCallback(async (rejectedCorrection: any, commentText: string) => {
    try {
      const newHighlight = {
        content: rejectedCorrection.content,
        position: rejectedCorrection.position,
        comment: { text: commentText, emoji: "❌" },
        estado: "pendiente",
        documento_id: infoProyecto.codigoDoc,
        proyecto_id: infoProyecto.codigoProyecto,
        observacionId: ""
      };
      
      await createObservacion(newHighlight);
      handleApprovalComplete();
    } catch (error) {
      console.error('Error al crear nueva observación:', error);
    }
  }, [infoProyecto, handleApprovalComplete]);

  return (
    <div className={styles.documentoPageLayout}>
      <nav className={styles.comparisonNavbar}>
        <div className={styles.infoContainer}>
          <span className={styles.infoText}>
            En la parte superior esta el documento nuevo, en la parte inferior el documento viejo, la corrección del estudiante está resaltada de color <span className={styles.highlightStudent}>celeste</span> y la del docente color <span className={styles.highlightTeacher}>piel</span>.
          </span>
        </div>
      </nav>

      <div className={styles.documentoBody}>
        <div className={`${styles.pdfContainer} ${secondBlob ? styles.dual : styles.single}`}>
          <div className={styles.pdfViewerWrapper}>
            <VisualizadorPDF
              blob={blob}
              observaciones={observacionesLocales}
              observacionesOtrasVersiones={observacionesOtrasVersiones}
              correcciones={modifiedCorrecciones}
              infoProyecto={infoProyecto}
              selectedObservation={selectedObservation}
              contentType={contentType}
              onObservationClick={handleObservationClick}
            />
          </div>
          {secondBlob && secondInfoProyecto && (
            <div className={styles.pdfViewerWrapper}>
              <VisualizadorPDF
                blob={secondBlob}
                observaciones={secondObservaciones ?? []}
                correcciones={secondCorrecciones ?? []}
                infoProyecto={secondInfoProyecto}
                selectedObservation={selectedObservation}
                contentType={secondContentType || 'application/pdf'}
                onApprovalComplete={handleApprovalComplete}
                onRejectionWithNewObservation={handleRejectionWithNewObservation}
              />
            </div>
          )}
        </div>
        {/* ELIMINADO: SidebarDerecha */}
      </div>
    </div>
  );
}