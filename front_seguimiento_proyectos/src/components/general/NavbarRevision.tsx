// NavbarRevision.tsx
import React, { useState } from 'react';
import styles from './styles/NavbarRevision.module.css';
import { cambiarEstadoDocumento } from '@/services/documentos';
import { actualizarFinal } from '@/services/finales';
import { useRouter } from 'next/navigation';
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
  fase_proyecto: string;
  es_final: boolean;
  es_documento_final?: boolean;
  // Nuevas props para corrección
  onFinalizarCorreccion?: () => void;
  hayObservacionesPendientes?: boolean;
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
  fase_proyecto,
  es_final,
  es_documento_final = false,
  // Nuevas props
  onFinalizarCorreccion,
  hayObservacionesPendientes = false,
}) => {
  const router = useRouter();
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoBack = () => {
    console.log('Botón Atrás presionado');
    if (role === 'estudiante' || role === 'estudiante_correccion') {
      router.push('/dashboard/estudiante/actividad');
    } else {
      router.push('/dashboard/docente/actividad');
    }
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
      console.log('Es documento final en el navbar?', es_documento_final);
      if (es_documento_final) {
        // ✅ Flujo para documentos FINALES
        console.log('📄 Aprobando documento FINAL con ID:', documento_id);
        
        // 1. Actualizar estado del documento final a "aprobado"
        const resultFinal = await actualizarFinal(documento_id, {
          estado: 'aprobado'
        });
        
        console.log('✅ Documento final aprobado:', resultFinal);

        // 2. Cambiar fase del proyecto (siempre para documentos finales)
        console.log('🔄 Cambiando fase del proyecto con ID:', proyecto_id);
        const resultProyecto = await changeProyectoFase(proyecto_id);
        console.log('✅ Fase del proyecto cambiada:', resultProyecto);
        console.log('Fase cambiada PERO NO EN TU CONDICION CRACK')
        // Cerrar modal y redirigir
        setShowApprovalModal(false);
        window.location.href = '/dashboard/docente/actividad';
        
      } else {
        // ✅ Flujo para documentos NORMALES (sin cambios)
        console.log('📄 Aprobando documento NORMAL con ID:', documento_id);
        
        // 1. Cambiar estado del documento a "aprobado"
        const resultDoc = await cambiarEstadoDocumento(documento_id, 'aprobado');
        if (!resultDoc.success) {
          setErrorMessage(resultDoc.error || 'Error al aprobar el documento');
          setIsProcessing(false);
          return;
        }

        console.log(`fase del proyecto es ${fase_proyecto} y fase de la actividad es: ${fase}`);
        console.log(`valor de es_final: ${es_final}`);

        // 2. Verificar si se debe cambiar la fase del proyecto
        const debeCambiarFase = (fase_proyecto === 'tema' && fase ==='tema') || es_final === true;
        
        if (debeCambiarFase) {
          const resultProyecto = await changeProyectoFase(proyecto_id);
          console.log('✅ Fase del proyecto cambiada EN TU CONDICION TRUCHA:', resultProyecto);
        }

        // Cerrar modal y recargar o redirigir
        setShowApprovalModal(false);
        router.push('/dashboard/docente/actividad');
      }
      
    } catch (error) {
      console.error('❌ Error al aprobar documento:', error);
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
      if (es_documento_final) {
        // ✅ Flujo para documentos FINALES
        console.log('📄 Rechazando documento FINAL con ID:', documento_id);
        
        // Actualizar estado del documento final a "rechazado" con motivo
        const resultFinal = await actualizarFinal(documento_id, {
          estado: 'rechazado',
          motivo_rechazo: rejectionNote.trim()
        });
        
        console.log('✅ Documento final rechazado:', resultFinal);

        // Cerrar modal y redirigir
        setShowRejectionModal(false);
        window.location.href = '/dashboard/docente/actividad';
        
      } else {
        // ✅ Flujo para documentos NORMALES (sin cambios)
        console.log('📄 Rechazando documento NORMAL con ID:', documento_id);
        
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
        router.push('/dashboard/docente/actividad');
      }
      
    } catch (error) {
      console.error('❌ Error al rechazar documento:', error);
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
    if (onFinalizarCorreccion) {
      onFinalizarCorreccion();
    }
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
            {es_documento_final && (
              <span className={styles.finalBadge}>FINAL</span>
            )}
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
              className={`${styles.finishButton} ${hayObservacionesPendientes ? styles.finishButtonDisabled : ''}`}
              onClick={handleFinishCorrection}
              disabled={hayObservacionesPendientes}
            >
              {hayObservacionesPendientes ? 'Observaciones Pendientes' : 'Terminar Corrección'}
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
              <p>
                ¿Está seguro de que desea aprobar este {es_documento_final ? 'documento final' : 'documento'}?
              </p>
              {es_documento_final && (
                <p className={styles.warningText}>
                  <strong>Nota:</strong> Al aprobar este documento final, el proyecto avanzará automáticamente a la siguiente fase.
                </p>
              )}
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
              {es_documento_final && (
                <p className={styles.infoText}>
                  El estudiante será notificado del rechazo de su documento final.
                </p>
              )}
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