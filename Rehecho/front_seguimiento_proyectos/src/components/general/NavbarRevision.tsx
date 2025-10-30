// NavbarRevision.tsx
import React, { useState } from 'react';
import styles from './styles/NavbarRevision.module.css';
import { cambiarEstadoDocumento } from '@/services/documentos';
import { changeProyectoFase } from '@/services/proyecto';

interface NavbarRevisionProps {
  role: 'docente' | 'estudiante' | 'estudiante_correccion' | 'docente_final';
  version: number;
  titulo: string;
  nombreEstudiante: string;
  codigoUniversitario: string;
  carrera: string;
  documento_id: number;
  proyecto_id: number;
  fase: string;
  es_final: boolean;
}

const NavbarRevision: React.FC<NavbarRevisionProps> = ({
  role,
  version,
  titulo,
  nombreEstudiante,
  codigoUniversitario,
  carrera,
  documento_id,
  proyecto_id,
  fase,
  es_final,
}) => {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoBack = () => {
    console.log('Botón Atrás presionado');
    window.history.back();
  };

  const handleApproveClick = () => {
    setShowApprovalModal(true);
    setErrorMessage('');
  };

  const handleRejectClick = () => {
    setShowRejectionModal(true);
    setRejectionNote('');
    setErrorMessage('');
  };

  const handleConfirmApproval = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Cambiar estado del documento a "aprobado"
      const resultDoc = await cambiarEstadoDocumento(documento_id, 'aprobado');
      
      if (!resultDoc.success) {
        setErrorMessage(resultDoc.error || 'Error al aprobar el documento');
        setIsProcessing(false);
        return;
      }

      // Verificar si se debe cambiar la fase del proyecto
      const debeCambiarFase = fase === 'tema' || es_final === true;
      
      if (debeCambiarFase) {
        const resultProyecto = await changeProyectoFase(proyecto_id);
        console.log('Fase del proyecto cambiada:', resultProyecto);
      }

      // Cerrar modal y recargar o redirigir
      setShowApprovalModal(false);
      alert('Documento aprobado exitosamente');
      window.location.reload(); // O redirigir a otra página
      
    } catch (error) {
      console.error('Error al aprobar documento:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error al aprobar documento');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmRejection = async () => {
    if (!rejectionNote.trim()) {
      setErrorMessage('Debe proporcionar una justificación para el rechazo');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Cambiar estado del documento a "rechazado" con justificación
      const result = await cambiarEstadoDocumento(
        documento_id, 
        'rechazado', 
        rejectionNote.trim()
      );
      
      if (!result.success) {
        setErrorMessage(result.error || 'Error al rechazar el documento');
        setIsProcessing(false);
        return;
      }

      // Cerrar modal y recargar o redirigir
      setShowRejectionModal(false);
      alert('Documento rechazado exitosamente');
      window.location.reload(); // O redirigir a otra página
      
    } catch (error) {
      console.error('Error al rechazar documento:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error al rechazar documento');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelModal = () => {
    setShowApprovalModal(false);
    setShowRejectionModal(false);
    setRejectionNote('');
    setErrorMessage('');
  };

  const handleFinishCorrection = () => {
    console.log('Botón Terminar Corrección presionado');
  };

  return (
    <>
      <div className={styles.navbar}>
        {/* Navbar Left - Solo para docente, docente_final y estudiante */}
        {(role === 'docente' || role === 'docente_final' || role === 'estudiante') && (
          <div className={styles.navbarLeft}>
            <button className={styles.backButton} onClick={handleGoBack}>
              ← Atrás
            </button>
          </div>
        )}

        {/* Navbar Center - Para todos los roles */}
        <div className={styles.navbarCenter}>
          <div className={styles.activityTitle}>
            <span className={styles.documentVersion}>Versión {version}</span>
            {titulo}
          </div>
          <div className={styles.activityMeta}>
            <span className={styles.activityDate}>
              {nombreEstudiante} • CU: {codigoUniversitario}
            </span>
            <span className={styles.tag}>{carrera}</span>
          </div>
        </div>

        {/* Navbar Right - Según el rol */}
        <div className={styles.navbarRight}>
          {(role === 'docente' || role === 'docente_final') && (
            <>
              <button
                className={styles.approveButton}
                onClick={handleApproveClick}
                disabled={isProcessing}
              >
                Aprobar Documento
              </button>
              {role === 'docente_final' && (
                <button
                  className={styles.rejectButton}
                  onClick={handleRejectClick}
                  disabled={isProcessing}
                >
                  Rechazar
                </button>
              )}
            </>
          )}
          {role === 'estudiante_correccion' && (
            <button
              className={styles.finishButton}
              onClick={handleFinishCorrection}
            >
              Terminar Corrección
            </button>
          )}
        </div>
      </div>

      {/* Modal de Confirmación de Aprobación */}
      {showApprovalModal && (
        <div className={styles.modalOverlay} onClick={handleCancelModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Confirmar Aprobación</h3>
            </div>
            <div className={styles.modalBody}>
              <p>¿Está seguro de que desea aprobar este documento?</p>
              {errorMessage && (
                <div className={styles.errorMessage}>{errorMessage}</div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.modalCancelButton}
                onClick={handleCancelModal}
                disabled={isProcessing}
              >
                Cancelar
              </button>
              <button
                className={styles.modalConfirmButton}
                onClick={handleConfirmApproval}
                disabled={isProcessing}
              >
                {isProcessing ? 'Procesando...' : 'Confirmar Aprobación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Rechazo */}
      {showRejectionModal && (
        <div className={styles.modalOverlay} onClick={handleCancelModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Confirmar Rechazo</h3>
            </div>
            <div className={styles.modalBody}>
              <p>Por favor, proporcione una justificación para el rechazo:</p>
              <textarea
                className={styles.rejectionTextarea}
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                placeholder="Escriba aquí la justificación del rechazo..."
                rows={5}
                disabled={isProcessing}
              />
              {errorMessage && (
                <div className={styles.errorMessage}>{errorMessage}</div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.modalCancelButton}
                onClick={handleCancelModal}
                disabled={isProcessing}
              >
                Cancelar
              </button>
              <button
                className={styles.modalRejectButton}
                onClick={handleConfirmRejection}
                disabled={isProcessing}
              >
                {isProcessing ? 'Procesando...' : 'Confirmar Rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavbarRevision;