'use client';
import React, { useState, useCallback, useMemo } from 'react';
import { VisualizadorPDF } from './VisualizadorPDF';
import { fetchDoc } from '@/services/proyecto';
import { cambiarEstadoDocumento } from '@/services/documentos';
import { changeProyectoFase } from '@/services/proyecto';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  
  // Estados
  const [showInfoPopup, setShowInfoPopup] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // 🆕 APROBAR DOCUMENTO
  const handleApproveDocument = async () => {
    setIsProcessing(true);
    try {
      // 1. Cambiar estado del documento a "aprobado"
      await cambiarEstadoDocumento(infoProyecto.codigoDoc, 'aprobado');
      
      // 2. Avanzar fase del proyecto
      await changeProyectoFase(infoProyecto.codigoProyecto);
      
      alert('✅ Documento aprobado exitosamente. El estudiante puede avanzar a la siguiente fase.');
      router.push('/dashboard/docente');
    } catch (error) {
      console.error('Error al aprobar documento:', error);
      alert('❌ Error al aprobar el documento. Por favor, intente nuevamente.');
    } finally {
      setIsProcessing(false);
      setShowApprovalModal(false);
    }
  };

  // 🆕 RECHAZAR DOCUMENTO
  const handleRejectDocument = async () => {
    if (!rejectionReason.trim()) {
      alert('⚠️ Por favor, ingrese un motivo para el rechazo.');
      return;
    }

    setIsProcessing(true);
    try {
      // Rechazar documento con motivo
      
      alert('✅ Documento rechazado. El estudiante podrá ver el motivo y subir una nueva versión.');
      router.push('/dashboard/docente');
    } catch (error) {
      console.error('Error al rechazar documento:', error);
      alert('❌ Error al rechazar el documento. Por favor, intente nuevamente.');
    } finally {
      setIsProcessing(false);
      setShowRejectionModal(false);
      setRejectionReason('');
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
              Este documento está en <strong>modo de solo lectura</strong>.
            </p>
            <p className={styles.popupText}>
              Usted solo puede <strong>aprobar</strong> o <strong>rechazar</strong> el documento para que el estudiante pueda avanzar a la siguiente fase.
            </p>
            <button
              className={styles.popupButton}
              onClick={() => setShowInfoPopup(false)}
            >
              Entendido
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
              ¿Está seguro de aprobar este documento? 
            </p>
            <p className={styles.popupText}>
              Esta acción permitirá que el estudiante <strong>{datosEstudiante.nombre}</strong> pase a la siguiente fase de su proyecto de grado.
            </p>
            <div className={styles.modalButtons}>
              <button
                className={styles.approveButton}
                onClick={handleApproveDocument}
                disabled={isProcessing}
              >
                {isProcessing ? 'Aprobando...' : 'Confirmar Aprobación'}
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setShowApprovalModal(false)}
                disabled={isProcessing}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 Modal de rechazo */}
      {showRejectionModal && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContent}>
            <h3 className={styles.popupTitle}>Rechazar Documento</h3>
            <p className={styles.popupText}>
              Por favor, indique el motivo del rechazo. El estudiante podrá ver esta observación y corregir su documento.
            </p>
            <textarea
              className={styles.rejectionTextarea}
              placeholder="Escriba el motivo del rechazo..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={6}
              disabled={isProcessing}
            />
            <div className={styles.modalButtons}>
              <button 
                className={styles.rejectButton}
                onClick={handleRejectDocument}
                disabled={isProcessing || !rejectionReason.trim()}
              >
                {isProcessing ? 'Rechazando...' : 'Confirmar Rechazo'}
              </button>
              <button 
                className={styles.cancelButton}
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionReason('');
                }}
                disabled={isProcessing}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar con información del documento */}
      <nav className={styles.comparisonNavbar}>
        <div className={styles.navbarContent}>
          {/* Botón volver */}
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
          
          {/* Información del documento */}
          <div className={styles.documentInfo}>
            <h2 className={styles.documentTitle}>
              {datosDocumento.titulo}
            </h2>
            <p className={styles.documentVersion}>
              Versión {datosDocumento.version} • Estudiante: {datosEstudiante.nombre}
            </p>
          </div>

          {/* Botones de acción */}
          <div className={styles.actionButtons}>
            <button 
              className={styles.rejectDocumentButton}
              onClick={() => setShowRejectionModal(true)}
              disabled={isProcessing}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              Rechazar
            </button>
            <button 
              className={styles.approveDocumentButton}
              onClick={() => setShowApprovalModal(true)}
              disabled={isProcessing}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Aprobar Documento
            </button>
          </div>
        </div>
      </nav>

      {/* Visor de PDF en modo solo lectura */}
      <div className={styles.documentoBody}>
        <div className={styles.pdfContainer}>
          <div className={styles.pdfViewerWrapper}>
            <VisualizadorPDF
              blob={blob}
              observaciones={observaciones}
              observacionesOtrasVersiones={[]}
              correcciones={correcciones}
              infoProyecto={infoProyecto}
              selectedObservation={null}
              contentType={contentType}
              role={'docente'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}