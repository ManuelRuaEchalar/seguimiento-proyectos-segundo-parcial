'use client';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { VisualizadorPDF } from './VisualizadorPDF';
import { fetchDoc, fetchProjectObservaciones } from '@/services/proyecto';
import { fetchObservaciones } from '@/services/observaciones';
import { fetchCorrecciones } from '@/services/correcciones';
import { createObservacion } from '@/services/observaciones';
import { changeProyectoFase } from '@/services/proyecto';
import { useRouter } from 'next/navigation'; // <- AÑADIR ESTA LÍNEA
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
  const [showInfoPopup, setShowInfoPopup] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [isApprovingDocument, setIsApprovingDocument] = useState(false);
  const router = useRouter();
  // Después de los estados existentes
  const [observacionesProyectoState, setObservacionesProyectoState] = useState<any[]>(observacionesProyecto);

  // REEMPLAZAR la función recargarObservacionesProyecto por esta:
  const recargarObservacionesProyecto = useCallback(async () => {
    try {
      // Opción 1: Recargar desde la API y filtrar manualmente
      const nuevasObs = await fetchProjectObservaciones(
        infoProyecto.codigoProyecto,
        infoProyecto.codigoDoc
      );
      console.log('🔄 Observaciones recargadas desde API:', nuevasObs);

      // Asegurarse de incluir TODAS las observaciones, no solo pendientes
      setObservacionesProyectoState(nuevasObs);

    } catch (error) {
      console.error('Error al recargar observaciones del proyecto:', error);
    }
  }, [infoProyecto.codigoProyecto, infoProyecto.codigoDoc]);

  // AGREGAR esta nueva función
  const actualizarEstadoObservacion = useCallback((observacionId: number, nuevoEstado: string) => {
    setObservacionesProyectoState(prevObs =>
      prevObs.map(obs =>
        obs.id === observacionId
          ? { ...obs, estado: nuevoEstado }
          : obs
      )
    );
    console.log(`✅ Estado de observación ${observacionId} actualizado a: ${nuevoEstado}`);
  }, []);

  console.log('📦 DocumentoLayoutClient - observacionesProyecto original:', {
    total: observacionesProyecto?.length || 0,
    datos: observacionesProyecto,
    primeraObservacion: observacionesProyecto?.[0]
  });

  // Calcular estadísticas de correcciones
  const estadisticasCorrecciones = useMemo(() => {
    const total = correcciones.length;
    const aprobadas = correcciones.filter(c => c.estado === 'aprobado').length;
    const rechazadas = correcciones.filter(c => c.estado === 'rechazado').length;
    const pendientes = correcciones.filter(c => c.estado === 'pendiente').length;

    return { total, aprobadas, rechazadas, pendientes };
  }, [correcciones]);

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
    const result = (observacionesProyectoState || []) // CAMBIAR observacionesProyecto por observacionesProyectoState
      .filter(obs => obs.documento_id !== infoProyecto.codigoDoc)
      .map(obs => ({
        ...obs,
        comment: { text: obs.commentText || obs.comment?.text || '' },
        content: { text: obs.contentText || obs.content?.text || '' },
        position: {
          pageNumber: obs.boundingPage || obs.position?.pageNumber || 1
        },
        esDeOtraVersion: true
      }));

    console.log('📋 DocumentoLayoutClient - observacionesOtrasVersiones:', {
      total: result.length,
      datos: result,
      primeraObservacion: result[0]
    });

    return result;
  }, [observacionesProyectoState, infoProyecto.codigoDoc]); // CAMBIAR dependencia

  const handleObservationClick = useCallback(async (observacion: any) => {
    console.log("Clicked observation:", observacion);

    try {
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
    // QUITAR la línea: await recargarObservacionesProyecto();
    setSelectedObservation(null);
    setSecondBlob(null);
    setSecondContentType(null);
    setSecondObservaciones(null);
    setSecondCorrecciones(null);
    setSecondInfoProyecto(null);
  }, []); // QUITAR dependencia recargarObservacionesProyecto

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

  const handleApproveDocument = async () => {
    setIsApprovingDocument(true);
    try {
      await changeProyectoFase(infoProyecto.codigoProyecto);
      alert('Documento aprobado exitosamente. El estudiante puede avanzar a la siguiente fase.');
      window.location.href = '/dashboard/docente';
    } catch (error) {
      console.error('Error al aprobar documento:', error);
      alert('Error al aprobar el documento. Por favor, intente nuevamente.');
    } finally {
      setIsApprovingDocument(false);
      setShowApprovalModal(false);
    }
  };

  return (
    <div className={styles.documentoPageLayout}>
      {/* Popup informativo inicial */}
      {showInfoPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContent}>
            <h3 className={styles.popupTitle}>Información de Visualización</h3>
            <p className={styles.popupText}>
              En la parte superior está el documento nuevo, en la parte inferior el documento viejo.
            </p>
            <p className={styles.popupText}>
              La corrección del estudiante está resaltada de color <span className={styles.highlightStudent}>celeste</span> y la del docente de color <span className={styles.highlightTeacher}>piel</span>.
            </p>
            <button
              className={styles.popupButton}
              onClick={() => setShowInfoPopup(false)}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmación de aprobación */}
      {showApprovalModal && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContent}>
            <h3 className={styles.popupTitle}>Confirmar Aprobación</h3>
            <p className={styles.popupText}>
              ¿Está seguro de aprobar este documento? Esta acción permitirá que el estudiante pase a la siguiente fase de su proyecto de grado.
            </p>
            <div className={styles.modalButtons}>
              <button
                className={styles.approveButton}
                onClick={handleApproveDocument}
                disabled={isApprovingDocument}
              >
                {isApprovingDocument ? 'Aprobando...' : 'Aprobar'}
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setShowApprovalModal(false)}
                disabled={isApprovingDocument}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar con estadísticas */}
      <nav className={styles.comparisonNavbar}>
        <div className={styles.navbarContent}>
          {/* AÑADIR ESTE BLOQUE COMPLETO */}
          <button
            onClick={() => router.back()}
            className={styles.backButton}
            aria-label="Volver atrás"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          {/* FIN DEL BLOQUE */}

          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Total:</span>
              <span className={styles.statValue}>{estadisticasCorrecciones.total}</span>
            </div>
            <div className={`${styles.statItem} ${styles.statApproved}`}>
              <span className={styles.statLabel}>Aprobadas:</span>
              <span className={styles.statValue}>{estadisticasCorrecciones.aprobadas}</span>
            </div>
            <div className={`${styles.statItem} ${styles.statRejected}`}>
              <span className={styles.statLabel}>Rechazadas:</span>
              <span className={styles.statValue}>{estadisticasCorrecciones.rechazadas}</span>
            </div>
            <div className={`${styles.statItem} ${styles.statPending}`}>
              <span className={styles.statLabel}>Pendientes:</span>
              <span className={styles.statValue}>{estadisticasCorrecciones.pendientes}</span>
            </div>
          </div>
          <button
            className={styles.approveDocumentButton}
            onClick={() => setShowApprovalModal(true)}
          >
            Aprobar Documento
          </button>
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
      </div>
    </div>
  );
}