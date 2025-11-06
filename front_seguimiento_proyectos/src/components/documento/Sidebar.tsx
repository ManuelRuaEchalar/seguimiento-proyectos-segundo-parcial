import React, { useState } from 'react';
import type { IHighlight } from "./react-pdf-highlighter";
import { Observacion } from './Observacion';
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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  role?: 'docente' | 'estudiante' | 'correccion';
  // Nuevas props para modo corrección
  observacionesPendientes?: any[];
  observacionesCorregidas?: any[];
  onIniciarModoSeleccion?: (observacion: any) => void;
  observacionSeleccionada?: any;
  modoSeleccion?: boolean;
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
  isCollapsed = false,
  onToggleCollapse,
  role = 'docente',
  // Nuevas props
  observacionesPendientes = [],
  observacionesCorregidas = [],
  onIniciarModoSeleccion,
  observacionSeleccionada,
  modoSeleccion = false,
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
    if (estadoLower === 'corregida') return styles.estadoAprobado;
    return styles.estadoPendiente;
  };

  // 🔹 VISTA ESPECIAL PARA MODO CORRECCIÓN
  if (role === 'correccion') {
    return (
      <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Correcciones
          </h2>
          {onToggleCollapse && (
            <button onClick={onToggleCollapse} className={styles.toggleBtn} aria-label="Cerrar sidebar">
              →
            </button>
          )}
        </div>

        <div className={styles.sidebarContent}>
          {/* Banner de modo selección */}
          {modoSeleccion && observacionSeleccionada && (
            <div className={styles.modoSeleccionBanner}>
              <div className={styles.modoSeleccionHeader}>
                <strong>Observación seleccionada</strong>
              </div>
              <div className={styles.modoSeleccionText}>
                Selecciona en el documento el texto corregido para:
              </div>
              <div className={styles.observacionSeleccionadaPreview}>
                "{observacionSeleccionada.content_text?.slice(0, 100)}..."
              </div>
              <button 
                className={styles.cancelarSeleccionBtn}
                onClick={() => onIniciarModoSeleccion?.(null)}
              >
                Cancelar
              </button>
            </div>
          )}

          {/* Observaciones Pendientes */}
          {observacionesPendientes.length > 0 && (
            <div className={styles.observacionesSection}>
              <h3 className={styles.sectionHeader}>
                Observaciones Pendientes
                <span className={styles.badge}>{observacionesPendientes.length}</span>
              </h3>
              <div className={styles.observacionesLista}>
                {observacionesPendientes.map((observacion, index) => (
                  <Observacion
                    key={observacion.id || index}
                    observacion={observacion}
                    isSeleccionada={observacionSeleccionada?.id === observacion.id}
                    onClick={() => onIniciarModoSeleccion?.(observacion)}
                    onCorregirClick={(e) => {
                      e.stopPropagation();
                      onIniciarModoSeleccion?.(observacion);
                    }}
                    getEstadoClass={getEstadoClass}
                    showCorregirBtn={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Observaciones Corregidas */}
          {observacionesCorregidas.length > 0 && (
            <div className={styles.observacionesSection}>
              <h3 className={styles.sectionHeader}>
                Observaciones Corregidas
                <span className={styles.badge}>{observacionesCorregidas.length}</span>
              </h3>
              <div className={styles.observacionesLista}>
                {observacionesCorregidas.map((observacion, index) => {
                  const correccion = highlights.find(h => 
                    h.observacionId === observacion.id && h.isCorreccion
                  );
                  
                  return (
                    <div
                      key={observacion.id || index}
                      className={`${styles.observacion} ${styles.observacionCorregida}`}
                    >
                      <div className={styles.observacionHeader}>
                        <span className={styles.observacionDoc}>Observación #{observacion.id}</span>
                        <span className={styles.observacionPagina}>
                          Pág. {observacion.position?.pageNumber || observacion.bounding_page || 'N/A'}
                        </span>
                      </div>
                      {observacion.content_text && (
                        <div className={styles.observacionTexto}>
                          "{observacion.content_text.slice(0, 80).trim()}{observacion.content_text.length > 80 ? '...' : ''}"
                        </div>
                      )}
                      
                      {correccion && (
                        <div className={styles.correccionPreview}>
                          <div className={styles.correccionHeader}>
                            <span className={styles.correccionBadge}>✓ Corregido</span>
                            <span className={styles.correccionPagina}>
                              Pág. {correccion.position.pageNumber}
                            </span>
                          </div>
                          {correccion.content.text && (
                            <div className={styles.correccionTexto}>
                              "{correccion.content.text.slice(0, 100).trim()}{correccion.content.text.length > 100 ? '...' : ''}"
                            </div>
                          )}
                        </div>
                      )}
                      
                      <span className={`${styles.observacionEstado} ${getEstadoClass(observacion.estado)}`}>
                        {observacion.estado || 'Corregida'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Estado vacío */}
          {observacionesPendientes.length === 0 && observacionesCorregidas.length === 0 && (
            <div className={styles.emptyState}>
              <p>No hay observaciones pendientes</p>
              <p className={styles.emptyStateSubtext}>
                Todas las observaciones han sido atendidas
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Separar observaciones y correcciones de los highlights
  const observacionesHighlights = highlights.filter(h => !h.isCorreccion);
  const correccionesHighlights = highlights.filter(h => h.isCorreccion);

  // Filtrar solo observaciones pendientes
  const observacionesPendientesOtrasVersiones = observacionesOtrasVersiones.filter(
    obs => obs.estado?.toLowerCase() === 'pendiente'
  );

  // Formulario de aprobación (solo para docentes)
  if (showApprovalForm && role === 'docente') {
    return (
      <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarTitle}>¿Aprobar corrección?</div>
          <button onClick={onToggleCollapse} className={styles.toggleBtn} aria-label="Cerrar sidebar">
            →
          </button>
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
    <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          {role === 'docente' ? 'Observaciones' : 'Correcciones y Observaciones'}
        </h2>
        {onToggleCollapse && (
          <button onClick={onToggleCollapse} className={styles.toggleBtn} aria-label="Cerrar sidebar">
            →
          </button>
        )}
      </div>

      <div className={styles.sidebarContent}>
        {/* Observaciones del documento actual */}
        {observacionesHighlights.length > 0 && (
          <div className={styles.observacionesSection}>
            <h3 className={styles.sectionHeader}>
              Observaciones actuales
            </h3>
            <div className={styles.observacionesLista}>
              {observacionesHighlights.map((highlight, index) => (
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
                  <div className={styles.observacionComentario}>
                    <b>{highlight.comment.text}</b>
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

        {/* Correcciones del documento actual */}
        {correccionesHighlights.length > 0 && (
          <div className={styles.observacionesSection}>
            <h3 className={styles.sectionHeader}>
              Correcciones
            </h3>
            <div className={styles.observacionesLista}>
              {correccionesHighlights.map((highlight, index) => (
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
                  <div className={styles.observacionComentario}>
                    <b>{highlight.comment.text}</b>
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

        {/* Observaciones pendientes del proyecto */}
        {observacionesPendientesOtrasVersiones.length > 0 && (
          <div className={styles.observacionesSection}>
            <h3 className={styles.sectionHeader}>
              Observaciones a revisar
            </h3>
            <div className={styles.observacionesLista}>
              {observacionesPendientesOtrasVersiones.map((observacion, index) => (
                <div
                  key={index}
                  className={`${styles.observacion} ${styles.externa}`}
                  onClick={() => handleObservationClick(observacion)}
                >
                  <div className={styles.observacionHeader}>
                    <span className={styles.observacionDoc}>Versión anterior</span>
                    <span className={styles.observacionPagina}>
                      Pág. {observacion.position?.pageNumber || observacion.bounding_page || 'N/A'}
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
        {observacionesHighlights.length === 0 && correccionesHighlights.length === 0 && observacionesPendientesOtrasVersiones.length === 0 && (
          <div className={styles.emptyState}>
            {role === 'estudiante' ? (
              <>
                <p>No hay observaciones ni correcciones</p>
                <p className={styles.emptyStateSubtext}>
                  Tu documento no tiene observaciones pendientes
                </p>
              </>
            ) : (
              <>
                <p>No hay observaciones aún</p>
                <p className={styles.emptyStateSubtext}>
                  Selecciona texto en el documento para agregar una observación
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {(observacionesHighlights.length > 0 || correccionesHighlights.length > 0) && (
        <div className={styles.sidebarFooter}>
          <button onClick={resetHighlights} className={styles.resetBtn}>
            {role === 'estudiante' ? 'Limpiar vista' : 'Limpiar observaciones'}
          </button>
        </div>
      )}
    </div>
  );
}