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
  const [charCount, setCharCount] = useState(0);
  const maxChars = 300;

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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= maxChars) {
      setRejectionComment(text);
      setCharCount(text.length);
    }
  };

  const handleRejectConfirm = () => {
    if (rejectionComment.trim() && onReject) {
      onReject(rejectionComment.trim());
      setRejectionComment('');
      setCharCount(0);
      setShowRejectionForm(false);
    }
  };

  const handleRejectCancel = () => {
    setRejectionComment('');
    setCharCount(0);
    setShowRejectionForm(false);
  };

  const getEstadoClass = (estado: string) => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower === 'pendiente') return styles.estadoPendiente;
    if (estadoLower === 'rechazado') return styles.estadoRechazado;
    if (estadoLower === 'aprobado') return styles.estadoAprobado;
    return styles.estadoDefault;
  };

  // Función para obtener el estilo de estado (similar a SidebarDerecha)
  const getEstadoBadgeClass = (estado: string) => {
    const baseClass = styles.estadoBadge;
    switch (estado?.toLowerCase()) {
      case 'aprobado':
        return `${baseClass} ${styles.estadoBadgeAprobado}`;
      case 'rechazado':
        return `${baseClass} ${styles.estadoBadgeRechazado}`;
      case 'pendiente':
        return `${baseClass} ${styles.estadoBadgePendiente}`;
      default:
        return baseClass;
    }
  };

  if (showApprovalForm) {
    return (
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.approvalIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <h2 className={styles.approvalTitle}>¿Aprobar corrección?</h2>
          <p className={styles.approvalSubtitle}>
            Revisa la corrección y decide si aprobarla o rechazarla
          </p>
        </div>

        <div className={styles.approvalForm}>
          {!showRejectionForm ? (
            <div className={styles.approvalButtons}>
              <button onClick={onApprove} className={styles.approveBtn}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Aprobar</span>
              </button>
              <button onClick={() => setShowRejectionForm(true)} className={styles.rejectBtn}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span>Rechazar</span>
              </button>
            </div>
          ) : (
            <div className={styles.rejectionFormContainer}>
              <h3 className={styles.rejectionTitle}>Motivo del rechazo</h3>
              <div className={styles.textareaWrapper}>
                <textarea
                  value={rejectionComment}
                  onChange={handleTextChange}
                  placeholder="Describe el motivo del rechazo..."
                  className={styles.rejectionTextarea}
                  rows={4}
                />
                <div className={styles.charCounter}>
                  <span className={charCount > maxChars * 0.9 ? styles.charWarning : ''}>
                    {charCount}
                  </span>
                  <span className={styles.charMax}> / {maxChars}</span>
                </div>
              </div>
              <div className={styles.rejectionButtons}>
                <button onClick={handleRejectCancel} className={styles.cancelBtn}>
                  Cancelar
                </button>
                <button onClick={handleRejectConfirm} className={styles.confirmRejectBtn} disabled={!rejectionComment.trim()}>
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
        <h2 className={styles.sidebarTitle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Observaciones
        </h2>
        <p className={styles.sidebarInstructions}>
          Para añadir una observación selecciona el texto y agrega una nota
        </p>
      </div>

      <div className={styles.sidebarContent}>
        {/* Observaciones locales */}
        {highlights.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Observaciones actuales</h3>
            <ul className={styles.highlightsList}>
              {highlights.map((highlight, index) => (
                <li
                  key={index}
                  className={styles.highlightItem}
                  onClick={() => handleHighlightClick(highlight)}
                >
                  <div className={styles.highlightContent}>
                    <span className={`${styles.highlightEstado} ${getEstadoClass(highlight.estado)}`}>
                      {highlight.estado}
                    </span>
                    <strong className={styles.highlightComment}>
                      {highlight.comment.text}
                    </strong>
                    {highlight.content.text ? (
                      <blockquote className={styles.highlightBlockquote}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={styles.quoteIcon}>
                          <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
                        </svg>
                        {`${highlight.content.text.slice(0, 90).trim()}…`}
                      </blockquote>
                    ) : null}
                  </div>
                  <div className={styles.highlightLocation}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    Página {highlight.position.pageNumber}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Observaciones de otras versiones */}
{observacionesOtrasVersiones.length > 0 && (
  <div className={styles.section}>
    <h3 className={styles.sectionTitle}>Observaciones a revisar</h3>
    <p className={styles.sectionDescription}>
      Lista de observaciones asociadas al proyecto.
    </p>
    <ul className={styles.observacionesList}>
      {observacionesOtrasVersiones.map((observacion, index) => (
        <li
          key={index}
          className={`${styles.observacionItem} ${styles.observacionOtraVersion}`}
          onClick={() => handleObservationClick(observacion)}
        >
          <div className={styles.observacionContent}>
            <span className={getEstadoBadgeClass(observacion.estado)}>
              {observacion.estado}
            </span>
            {/* CORREGIDO: usar comment_text en lugar de comment.text */}
            {observacion.comment_text && (
              <strong className={styles.observacionComment}>
                {observacion.comment_text}
              </strong>
            )}
            {/* CORREGIDO: usar content_text en lugar de content.text */}
            {observacion.content_text && (
              <blockquote className={styles.observacionBlockquote}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={styles.quoteIcon}>
                  <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
                </svg>
                {`${observacion.content_text.slice(0, 90).trim()}…`}
              </blockquote>
            )}
          </div>
          <div className={styles.observacionLocation}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Página {observacion.position?.pageNumber || observacion.boundingPage}
          </div>
        </li>
      ))}
    </ul>
  </div>
)}

        {/* Estado vacío */}
        {highlights.length === 0 && observacionesOtrasVersiones.length === 0 && (
          <div className={styles.emptyState}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p className={styles.emptyStateText}>
              No hay observaciones aún
            </p>
            <p className={styles.emptyStateSubtext}>
              Selecciona texto en el documento para agregar una observación
            </p>
          </div>
        )}
      </div>

      {highlights.length > 0 && (
        <div className={styles.sidebarFooter}>
          <button type="button" onClick={resetHighlights} className={styles.resetBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10" />
              <polyline points="23 20 23 14 17 14" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
            Limpiar observaciones
          </button>
        </div>
      )}
    </div>
  );
}