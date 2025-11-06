import React, { useState } from 'react';
import styles from './style/Observacion.module.css';

interface ObservacionProps {
  observacion: any;
  isSeleccionada?: boolean;
  onClick?: () => void;
  onCorregirClick?: (e: React.MouseEvent) => void;
  getEstadoClass: (estado: string) => string;
  showCorregirBtn?: boolean;
  variant?: 'pendiente' | 'corregida' | 'actual' | 'externa' | 'correccion-list';
  correccion?: any; // Para mostrar la corrección asociada en observaciones corregidas
  labelDoc?: string; // Etiqueta personalizada (ej: "Este documento", "Versión anterior")
}

export function Observacion({
  observacion,
  isSeleccionada = false,
  onClick,
  onCorregirClick,
  getEstadoClass,
  showCorregirBtn = false,
  variant = 'actual',
  correccion,
  labelDoc = 'Este documento',
}: ObservacionProps) {
  const [showModal, setShowModal] = useState(false);

  const MAX_COMMENT_LENGTH = 70;
  
  // Determinar qué campo usar para el comentario según la variante
  const commentText = observacion.comment?.text || observacion.comment_text;
  const contentText = observacion.content?.text || observacion.content_text;
  
  const isCommentLong = commentText && commentText.length > MAX_COMMENT_LENGTH;
  const truncatedComment = isCommentLong 
    ? commentText.slice(0, MAX_COMMENT_LENGTH).trim() + '...'
    : commentText;

  const handleVerMas = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Determinar clases según variante
  const getVariantClass = () => {
    if (variant === 'externa') return styles.externa;
    if (variant === 'corregida') return styles.observacionCorregida;
    return '';
  };

  const pageNumber = observacion.position?.pageNumber || observacion.bounding_page || 'N/A';

  return (
    <>
      <div
        className={`${styles.observacion} ${getVariantClass()} ${isSeleccionada ? styles.observacionSeleccionada : ''}`}
        onClick={onClick}
      >
        <div className={styles.observacionHeader}>
          <span className={styles.observacionDoc}>
            {variant === 'correccion-list' ? `Observación #${observacion.id}` : labelDoc}
          </span>
          <span className={styles.observacionPagina}>
            Pág. {pageNumber}
          </span>
        </div>

        {/* Mostrar texto señalado primero en modo corrección */}
        {variant === 'correccion-list' && contentText && (
          <div className={styles.observacionTexto}>
            "{contentText.slice(0, 120).trim()}{contentText.length > 120 ? '...' : ''}"
          </div>
        )}

        {/* Comentario */}
        {commentText && (
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

        {/* Mostrar texto señalado después del comentario en otros modos */}
        {variant !== 'correccion-list' && contentText && (
          <div className={styles.observacionTexto}>
            "{contentText.slice(0, 120).trim()}{contentText.length > 120 ? '...' : ''}"
          </div>
        )}

        {/* Preview de corrección (para observaciones corregidas) */}
        {variant === 'corregida' && correccion && (
          <div className={styles.correccionPreview}>
            <div className={styles.correccionHeader}>
              <span className={styles.correccionBadge}>✓ Corregido</span>
              <span className={styles.correccionPagina}>
                Pág. {correccion.position.pageNumber}
              </span>
            </div>
            {correccion.content?.text && (
              <div className={styles.correccionTexto}>
                "{correccion.content.text.slice(0, 100).trim()}{correccion.content.text.length > 100 ? '...' : ''}"
              </div>
            )}
          </div>
        )}

        {/* Estado y botón de corregir */}
        {showCorregirBtn ? (
          <div className={styles.observacionActions}>
            <span className={`${styles.observacionEstado} ${getEstadoClass(observacion.estado)}`}>
              {observacion.estado || 'Pendiente'}
            </span>
            {onCorregirClick && (
              <button 
                className={styles.corregirBtn}
                onClick={onCorregirClick}
              >
                Corregir
              </button>
            )}
          </div>
        ) : (
          <span className={`${styles.observacionEstado} ${getEstadoClass(observacion.estado)}`}>
            {observacion.estado || 'Pendiente'}
          </span>
        )}
      </div>

      {/* Modal para comentarios largos */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {variant === 'correccion-list' ? `Observación #${observacion.id}` : 'Detalle de Observación'}
              </h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>Comentario:</h4>
                <p className={styles.modalComment}>{commentText}</p>
              </div>
              {contentText && (
                <div className={styles.modalSection}>
                  <h4 className={styles.modalSectionTitle}>Texto señalado:</h4>
                  <p className={styles.modalText}>"{contentText}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}