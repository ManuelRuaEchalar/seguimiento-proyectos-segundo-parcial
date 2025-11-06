import React, { useState } from 'react';
import styles from './style/Observacion.module.css';

interface ObservacionProps {
  observacion: any;
  isSeleccionada?: boolean;
  onClick?: () => void;
  onCorregirClick?: (e: React.MouseEvent) => void;
  getEstadoClass: (estado: string) => string;
  showCorregirBtn?: boolean;
}

export function Observacion({
  observacion,
  isSeleccionada = false,
  onClick,
  onCorregirClick,
  getEstadoClass,
  showCorregirBtn = true,
}: ObservacionProps) {
  const [showModal, setShowModal] = useState(false);

  const MAX_COMMENT_LENGTH = 150;
  const isCommentLong = observacion.comment_text && observacion.comment_text.length > MAX_COMMENT_LENGTH;
  const truncatedComment = isCommentLong 
    ? observacion.comment_text.slice(0, MAX_COMMENT_LENGTH).trim() + '...'
    : observacion.comment_text;

  const handleVerMas = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div
        className={`${styles.observacion} ${isSeleccionada ? styles.observacionSeleccionada : ''}`}
        onClick={onClick}
      >
        <div className={styles.observacionHeader}>
          <span className={styles.observacionDoc}>Observación #{observacion.id}</span>
          <span className={styles.observacionPagina}>
            Pág. {observacion.position?.pageNumber || observacion.bounding_page || 'N/A'}
          </span>
        </div>
        {observacion.content_text && (
          <div className={styles.observacionTexto}>
            "{observacion.content_text.slice(0, 120).trim()}{observacion.content_text.length > 120 ? '...' : ''}"
          </div>
        )}
        {observacion.comment_text && (
          <div className={styles.observacionComentario}>
            <b>{truncatedComment}</b>
            {isCommentLong && (
              <button 
                className={styles.verMasBtn}
                onClick={handleVerMas}
              >
                Ver más
              </button>
            )}
          </div>
        )}
        <div className={styles.observacionActions}>
          <span className={`${styles.observacionEstado} ${getEstadoClass(observacion.estado)}`}>
            {observacion.estado || 'Pendiente'}
          </span>
          {showCorregirBtn && onCorregirClick && (
            <button 
              className={styles.corregirBtn}
              onClick={onCorregirClick}
            >
              Corregir
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Observación #{observacion.id}</h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>Comentario:</h4>
                <p className={styles.modalComment}>{observacion.comment_text}</p>
              </div>
              {observacion.content_text && (
                <div className={styles.modalSection}>
                  <h4 className={styles.modalSectionTitle}>Texto señalado:</h4>
                  <p className={styles.modalText}>"{observacion.content_text}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}