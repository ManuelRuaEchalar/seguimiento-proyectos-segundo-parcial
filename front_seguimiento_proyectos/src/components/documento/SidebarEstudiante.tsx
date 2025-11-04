import React from 'react';
import type { IHighlight } from "./react-pdf-highlighter";
import styles from './style/SidebarEstudiante.module.css';

interface Props {
  highlights: Array<IHighlight>;
  observacionesProyecto?: Array<any>;
  resetHighlights: () => void;
  onHighlightClick?: (highlight: IHighlight) => void;
}

const updateHash = (highlight: IHighlight) => {
  document.location.hash = `highlight-${highlight.id}`;
};

export function SidebarEstudiante({
  highlights,
  observacionesProyecto = [],
  resetHighlights,
  onHighlightClick,
}: Props) {

  const handleHighlightClick = (highlight: IHighlight) => {
    updateHash(highlight);
    if (onHighlightClick) {
      onHighlightClick(highlight);
    }
  };

  const getEstadoClass = (estado: string) => {
    const estadoLower = estado?.toLowerCase() || 'pendiente';
    if (estadoLower === 'pendiente') return styles.estadoPendiente;
    if (estadoLower === 'rechazado') return styles.estadoRechazado;
    if (estadoLower === 'aprobado') return styles.estadoAprobado;
    return styles.estadoDefault;
  };

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

  // Separar observaciones y correcciones de los highlights
  const observacionesHighlights = highlights.filter(h => !h.isCorreccion);
  const correccionesHighlights = highlights.filter(h => h.isCorreccion);

  // Filtrar solo observaciones pendientes del proyecto
  const observacionesPendientes = observacionesProyecto.filter(
    obs => obs.estado?.toLowerCase() === 'pendiente'
  );

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
          Documento
        </h2>
        <p className={styles.sidebarInstructions}>
          Observaciones y correcciones de tu documento
        </p>
      </div>

      <div className={styles.sidebarContent}>
        {/* Observaciones del documento actual */}
        {observacionesHighlights.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Observaciones
              </h3>
              <span className={styles.badge}>{observacionesHighlights.length}</span>
            </div>
            <ul className={styles.highlightsList}>
              {observacionesHighlights.map((highlight, index) => (
                <li
                  key={index}
                  className={styles.highlightItem}
                  onClick={() => handleHighlightClick(highlight)}
                >
                  <div className={styles.highlightContent}>
                    <span className={`${styles.highlightEstado} ${getEstadoClass(highlight.estado)}`}>
                      {highlight.estado}
                    </span>
                    {highlight.comment?.text && (
                      <strong className={styles.highlightComment}>
                        {highlight.comment.text}
                      </strong>
                    )}
                    {highlight.content?.text && (
                      <blockquote className={styles.highlightBlockquote}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={styles.quoteIcon}>
                          <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
                        </svg>
                        {`${highlight.content.text.slice(0, 90).trim()}…`}
                      </blockquote>
                    )}
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

        {/* Correcciones del documento actual */}
        {correccionesHighlights.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Correcciones
              </h3>
              <span className={styles.badge}>{correccionesHighlights.length}</span>
            </div>
            <ul className={styles.highlightsList}>
              {correccionesHighlights.map((highlight, index) => (
                <li
                  key={index}
                  className={`${styles.highlightItem} ${styles.correccionItem}`}
                  onClick={() => handleHighlightClick(highlight)}
                >
                  <div className={styles.highlightContent}>
                    <span className={`${styles.highlightEstado} ${getEstadoClass(highlight.estado)}`}>
                      {highlight.estado}
                    </span>
                    {highlight.comment?.text && (
                      <strong className={styles.highlightComment}>
                        {highlight.comment.text}
                      </strong>
                    )}
                    {highlight.content?.text && (
                      <blockquote className={styles.highlightBlockquote}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={styles.quoteIcon}>
                          <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
                        </svg>
                        {`${highlight.content.text.slice(0, 90).trim()}…`}
                      </blockquote>
                    )}
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

        {/* Observaciones pendientes del proyecto */}
        {observacionesPendientes.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                Observaciones pendientes
              </h3>
              <span className={styles.badge}>{observacionesPendientes.length}</span>
            </div>
            <p className={styles.sectionDescription}>
              Observaciones que requieren corrección
            </p>
            <ul className={styles.observacionesList}>
              {observacionesPendientes.map((observacion, index) => (
                <li
                  key={index}
                  className={`${styles.observacionItem} ${styles.observacionPendiente}`}
                >
                  <div className={styles.observacionContent}>
                    <span className={getEstadoBadgeClass(observacion.estado)}>
                      {observacion.estado}
                    </span>
                    {observacion.comment_text && (
                      <strong className={styles.observacionComment}>
                        {observacion.comment_text}
                      </strong>
                    )}
                    {observacion.content_text && (
                      <blockquote className={styles.observacionBlockquote}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={styles.quoteIcon}>
                          <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
                        </svg>
                        {`${observacion.content_text.slice(0, 90).trim()}…`}
                      </blockquote>
                    )}
                  </div>
                  <div className={styles.observacionMeta}>
                    <div className={styles.observacionLocation}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      Página {observacion.position?.pageNumber || observacion.bounding_page || 'N/A'}
                    </div>
                    <div className={styles.observacionVersion}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      Versión anterior
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Estado vacío */}
        {observacionesHighlights.length === 0 && 
         correccionesHighlights.length === 0 && 
         observacionesPendientes.length === 0 && (
          <div className={styles.emptyState}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <p className={styles.emptyStateText}>
              Sin observaciones ni correcciones
            </p>
            <p className={styles.emptyStateSubtext}>
              Tu documento no tiene observaciones pendientes
            </p>
          </div>
        )}
      </div>

      {(observacionesHighlights.length > 0 || correccionesHighlights.length > 0) && (
        <div className={styles.sidebarFooter}>
          <button type="button" onClick={resetHighlights} className={styles.resetBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10" />
              <polyline points="23 20 23 14 17 14" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
            Limpiar vista
          </button>
        </div>
      )}
    </div>
  );
}