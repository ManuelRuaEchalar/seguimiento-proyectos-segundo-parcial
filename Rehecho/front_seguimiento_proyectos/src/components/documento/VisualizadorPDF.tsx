import React, { useState, useEffect, useMemo } from "react";
import { Observacion } from '@/types';
import {
  PdfHighlighter,
  PdfLoader,
  Popup,
  Tip,
  Highlight,
} from "./react-pdf-highlighter";
import type { IHighlight } from "./react-pdf-highlighter";
import { PdfHighlighterEstudiante } from "./react-pdf-highlighter/components/PdfHighlighterEstudiante";
import { Sidebar } from "./Sidebar";
import { Spinner } from "./Spinner";
import { HighlightPopup } from "@/components/documento/HighlightPopup";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useHighlightManagement } from "@/hooks/useHighlightManagement";
import { useScrollToHighlight } from "@/hooks/useScrollToHighlight";
import { useApprovalActions } from "@/hooks/useApprovalActions";
import styles from './style/VisualizadorPDF.module.css';

interface infoProyecto {
  codigoProyecto: number;
  codigoDoc: number;
}

interface VisualizadorPDFProps {
  blob: Blob | null;
  observaciones: Observacion[] | null;
  observacionesOtrasVersiones?: any[];
  observacionesProyecto?: any[];
  correcciones: any[] | null;
  infoProyecto: infoProyecto;
  selectedObservation?: any;
  contentType?: string;
  role: 'docente' | 'estudiante';
  onObservationClick?: (observacion: any) => void;
  onApprovalComplete?: () => void;
  onRejectionWithNewObservation?: (rejectedCorrection: any, nuevaObservacionAPI: any) => void;
  onActualizarEstadoObservacion?: (observacionId: number, nuevoEstado: string) => void;
}

export function VisualizadorPDF({
  blob,
  observaciones,
  observacionesOtrasVersiones = [],
  observacionesProyecto = [],
  correcciones,
  infoProyecto,
  selectedObservation,
  role,
  onObservationClick,
  onRejectionWithNewObservation,
  contentType = 'application/pdf',
  onApprovalComplete,
  onActualizarEstadoObservacion
}: VisualizadorPDFProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Custom hooks
  const { currentPage, totalPages, setTotalPages } = usePageTracking();
  
  const {
    highlights,
    setHighlights,
    addHighlight,
    updateHighlight,
    resetHighlights
  } = useHighlightManagement({
    observaciones,
    correcciones,
    infoProyecto
  });

  const {
    isPdfReady,
    setIsPdfReady,
    scrollToHighlightRef,
    handleHighlightClick
  } = useScrollToHighlight({
    selectedObservation,
    highlights,
    infoProyecto
  });

  const {
    showApprovalForm,
    handleApprove,
    handleReject
  } = useApprovalActions({
    selectedObservation,
    highlights,
    infoProyecto,
    onApprovalComplete,
    onRejectionWithNewObservation,
    onActualizarEstadoObservacion,
    setHighlights
  });

  const memoizedHighlights = useMemo(() => highlights, [highlights]);

  // Logs de debug
  useEffect(() => {
    if (role === 'docente') {
      console.log('🎯 VisualizadorPDF - observacionesOtrasVersiones recibidas:', {
        total: observacionesOtrasVersiones.length,
        datos: observacionesOtrasVersiones,
        estructuraPrimera: observacionesOtrasVersiones[0]
      });
    }
  }, [observacionesOtrasVersiones, role]);

  useEffect(() => {
    console.log('🔍 INFO PROYECTO RECIBIDA:', {
      codigoProyecto: infoProyecto.codigoProyecto,
      codigoDoc: infoProyecto.codigoDoc,
      infoProyectoCompleto: infoProyecto,
      role
    });

    if (!infoProyecto.codigoProyecto) {
      console.error('⚠️ ADVERTENCIA: codigoProyecto es undefined o null');
    }

    if (!infoProyecto.codigoDoc) {
      console.error('⚠️ ADVERTENCIA: codigoDoc es undefined o null');
    }
  }, [infoProyecto, role]);

  // Manejo del Blob URL
  useEffect(() => {
    if (blob) {
      const objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else {
      setUrl(null);
    }
  }, [blob]);

  // Manejo de errores de extensiones
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (
        event.message?.includes("Extension context invalidated") ||
        event.message?.includes("message port closed")
      ) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  if (!blob || !url) {
    return (
      <div className={styles.pdfViewerLoading}>
        <div>No hay documento para mostrar</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pdfViewerError}>
        <h2 className={styles.errorTitle}>Error loading PDF</h2>
        <p className={styles.errorMessage}>{error}</p>
        <button className={styles.errorButton} onClick={() => setError(null)}>Try Again</button>
      </div>
    );
  }

  return (
    <div className={styles.pdfViewerContainer}>
      <div className={`${styles.pdfViewerContent} ${isSidebarCollapsed ? styles.sidebarHidden : ''}`} style={{ position: 'relative' }}>
        <div className={styles.pageIndicator}>
          Página {currentPage} {totalPages > 0 && `de ${totalPages}`}
        </div>

        {isSidebarCollapsed && (
          <button 
            className={styles.sidebarToggleFloat} 
            onClick={handleToggleSidebar}
            aria-label="Abrir sidebar"
          >
            ←
          </button>
        )}

        <PdfLoader
          url={url}
          beforeLoad={<Spinner />}
          onError={(error) => {
            console.error("PDF loading error:", error);
            setError("Failed to load PDF. Please check if the file exists.");
          }}
        >
          {(pdfDocument) => {
            const updatePages = () => {
              if (pdfDocument.numPages && totalPages !== pdfDocument.numPages) {
                setTotalPages(pdfDocument.numPages);
              }
              setIsPdfReady(true);
            };

            setTimeout(updatePages, 0);

            // Renderizar PdfHighlighter según el rol
            if (role === 'estudiante') {
              return (
                <PdfHighlighterEstudiante
                  pdfDocument={pdfDocument}
                  onScrollChange={() => {}}
                  scrollRef={(scrollToFunction) => {
                    console.log("scrollRef asignado:", !!scrollToFunction);
                    scrollToHighlightRef.current = scrollToFunction;
                  }}
                  highlightTransform={(
                    highlight,
                    index,
                    setTip,
                    hideTip,
                    viewportToScaled,
                    screenshot,
                    isScrolledTo
                  ) => {
                    const isCorreccion = highlight.isCorreccion || false;
                    const component = (
                      <Highlight
                        isScrolledTo={isScrolledTo}
                        position={highlight.position}
                        comment={highlight.comment}
                        estado={highlight.estado || "pendiente"}
                        documento_id={highlight.documento_id || 2}
                        proyecto_id={highlight.proyecto_id || 1}
                        isCorreccion={isCorreccion}
                      />
                    );

                    return (
                      <Popup
                        popupContent={<HighlightPopup {...highlight} />}
                        onMouseOver={(popupContent) => setTip(highlight, (highlight) => popupContent)}
                        onMouseOut={hideTip}
                        key={index}
                      >
                        {component}
                      </Popup>
                    );
                  }}
                  highlights={memoizedHighlights}
                />
              );
            }

            // Rol docente - PdfHighlighter normal
            return (
              <PdfHighlighter
                pdfDocument={pdfDocument}
                enableAreaSelection={(event) => event.altKey}
                onScrollChange={() => {}}
                scrollRef={(scrollToFunction) => {
                  console.log("scrollRef asignado:", !!scrollToFunction);
                  scrollToHighlightRef.current = scrollToFunction;
                }}
                onSelectionFinished={(position, content, hideTipAndSelection, transformSelection) => (
                  <Tip
                    onOpen={transformSelection}
                    onConfirm={(comment) => {
                      addHighlight({
                        content,
                        position,
                        comment,
                        estado: "pendiente",
                        observacionId: ""
                      });
                      hideTipAndSelection();
                    }}
                  />
                )}
                highlightTransform={(highlight, index, setTip, hideTip, viewportToScaled, screenshot, isScrolledTo) => {
                  const isCorreccion = highlight.isCorreccion || false;
                  const component = (
                    <Highlight
                      isScrolledTo={isScrolledTo}
                      position={highlight.position}
                      comment={highlight.comment}
                      estado={highlight.estado || "pendiente"}
                      documento_id={highlight.documento_id || 2}
                      proyecto_id={highlight.proyecto_id || 1}
                      isCorreccion={isCorreccion}
                    />
                  );

                  return (
                    <Popup
                      popupContent={<HighlightPopup {...highlight} />}
                      onMouseOver={(popupContent) => setTip(highlight, (highlight) => popupContent)}
                      onMouseOut={hideTip}
                      key={index}
                    >
                      {component}
                    </Popup>
                  );
                }}
                highlights={memoizedHighlights}
              />
            );
          }}
        </PdfLoader>
      </div>
      
      <Sidebar
        highlights={highlights.filter((h) => !h.isCorreccion)}
        observacionesOtrasVersiones={observacionesOtrasVersiones}
        resetHighlights={resetHighlights}
        onHighlightClick={handleHighlightClick}
        onObservationClick={onObservationClick}
        showApprovalForm={showApprovalForm}
        onApprove={handleApprove}
        onReject={handleReject}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        role={role}
      />
    </div>
  );
}