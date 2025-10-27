import React, { useState } from 'react';
import type { IHighlight } from "./react-pdf-highlighter";
import styles from './style/Sidebar.module.css';

interface Props {
  highlights: Array<IHighlight>;
  observacionesOtrasVersiones?: Array<any>;
  resetHighlights: () => void;
  onHighlightClick?: (highlight: IHighlight) => void;
  onObservationClick?: (observacion: any) => void;
  showApprovalForm?: { id: string };
  onApprove?: () => void;
  onReject?: (commentText?: string) => void;
}

const updateHash = (highlight: IHighlight) => {
  document.location.hash = `highlight-${highlight.id}`;
};

export function Sidebar({
  highlights,
  observacionesOtrasVersiones = [],
  resetHighlights,
  onHighlightClick,
  onObservationClick,
  showApprovalForm,
  onApprove,
  onReject,
}: Props) {
  const [rejectionComment, setRejectionComment] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  const handleHighlightClick = (highlight: IHighlight) => {
    updateHash(highlight);
    if (onHighlightClick) {
      onHighlightClick(highlight);
    }
  };

  const handleObservationClick = (observacion: any) => {
    if (onObservationClick) {
      onObservationClick(observacion);
    }
  };

  const handleRejectConfirm = () => {
    if (rejectionComment.trim() && onReject) {
      onReject(rejectionComment.trim());
      setRejectionComment('');
      setShowRejectionForm(false);
    }
  };

  const handleRejectCancel = () => {
    setRejectionComment('');
    setShowRejectionForm(false);
  };

  const getEstadoClass = (estado: string) => {
    const estadoLower = estado?.toLowerCase();
    if (estadoLower === 'pendiente') return styles.estadoPendiente;
    if (estadoLower === 'rechazado') return styles.estadoRechazado;
    if (estadoLower === 'aprobado') return styles.estadoAprobado;
    return styles.estadoPendiente;
  };

  // Formulario de aprobación
  if (showApprovalForm) {
    return (
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarTitle}>¿Aprobar corrección?</div>
        </div>
        <div className={styles.sidebarContent}>
          {!showRejectionForm ? (
            <div className={styles.approvalButtons}>
              <button onClick={onApprove} className={styles.approveBtn}>
                Aprobar
              </button>
              <button onClick={() => setShowRejectionForm(true)} className={styles.rejectBtn}>
                Rechazar
              </button>
            </div>
          ) : (
            <div className={styles.rejectionForm}>
              <h3 className={styles.rejectionTitle}>Motivo del rechazo</h3>
              <textarea
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                placeholder="Describe el motivo del rechazo..."
                className={styles.rejectionTextarea}
                rows={4}
              />
              <div className={styles.rejectionButtons}>
                <button onClick={handleRejectCancel} className={styles.cancelBtn}>
                  Cancelar
                </button>
                <button
                  onClick={handleRejectConfirm}
                  className={styles.confirmRejectBtn}
                  disabled={!rejectionComment.trim()}
                >
                  Confirmar Rechazo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarTitle}>Observaciones</div>
      </div>

      <div className={styles.sidebarContent}>
        {/* Observaciones actuales */}
        {highlights.length > 0 && (
          <div className={styles.observacionesSection}>
            <h3 className={styles.sectionHeader}>Observaciones actuales</h3>
            <div className={styles.observacionesLista}>
              {highlights.map((highlight, index) => (
                <div
                  key={index}
                  className={styles.observacion}
                  onClick={() => handleHighlightClick(highlight)}
                >
                  <div className={styles.observacionHeader}>
                    <span className={styles.observacionDoc}>Este documento</span>
                    <span className={styles.observacionPagina}>
                      Pág. {highlight.position.pageNumber}
                    </span>
                  </div>
                  <div className={styles.observacionComentario}> <b>{highlight.comment.text}</b>

                  </div>
                  {highlight.content.text && (
                    <div className={styles.observacionTexto}>
                      "{highlight.content.text.slice(0, 120).trim()}..."
                    </div>
                  )}



                  <span className={`${styles.observacionEstado} ${getEstadoClass(highlight.estado)}`}>
                    {highlight.estado || 'Pendiente'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Observaciones de otras versiones */}
        {observacionesOtrasVersiones.filter(obs => obs.estado?.toLowerCase() === 'pendiente').length > 0 && (
          <div className={styles.observacionesSection}>
            <h3 className={styles.sectionHeader}>Observaciones a revisar</h3>
            <div className={styles.observacionesLista}>
              {observacionesOtrasVersiones
                .filter(obs => obs.estado?.toLowerCase() === 'pendiente')
                .map((observacion, index) => (
                  <div
                    key={index}
                    className={`${styles.observacion} ${styles.externa}`}
                    onClick={() => handleObservationClick(observacion)}
                  >
                    <div className={styles.observacionHeader}>
                      <span className={styles.observacionDoc}>Versión anterior</span>
                      <span className={styles.observacionPagina}>
                        Pág. {observacion.position?.pageNumber || observacion.boundingPage}
                      </span>
                    </div>

                    {observacion.content_text && (
                      <div className={styles.observacionTexto}>
                        "{observacion.content_text.slice(0, 120).trim()}..."
                      </div>
                    )}

                    {observacion.comment_text && (
                      <div className={styles.observacionComentario}>
                        {observacion.comment_text}
                      </div>
                    )}

                    <span className={`${styles.observacionEstado} ${getEstadoClass(observacion.estado)}`}>
                      {observacion.estado}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {highlights.length === 0 && observacionesOtrasVersiones.length === 0 && (
          <div className={styles.emptyState}>
            <p>No hay observaciones aún</p>
            <p className={styles.emptyStateSubtext}>
              Selecciona texto en el documento para agregar una observación
            </p>
          </div>
        )}
      </div>

      {highlights.length > 0 && (
        <div className={styles.sidebarFooter}>
          <button onClick={resetHighlights} className={styles.resetBtn}>
            Limpiar observaciones
          </button>
        </div>
      )}
    </div>
  );
}