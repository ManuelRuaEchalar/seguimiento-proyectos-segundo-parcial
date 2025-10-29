import React, { useState, useEffect } from "react";
import { Observacion } from '@/types';
import {
  Highlight,
  PdfHighlighter,
  PdfLoader,
  Popup,
  TipCor,
} from "./react-pdf-highlighter";
import type { IHighlight } from "./react-pdf-highlighter";
import { Sidebar } from "./Sidebar";
import { Spinner } from "./Spinner";
import { HighlightPopupCorrecciones } from "./HighlightPopupCorrecciones";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useHighlightManagementCorrecciones } from "@/hooks/useHighlightManagementCorrecciones";
import { useScrollToHighlight } from "@/hooks/useScrollToHighlight";
import styles from "./style/VisualizadorPDFCorrecciones.module.css";

interface infoProyecto {
  codigoProyecto: number;
  codigoDoc: number;
}

interface VisualizadorPDFProps {
  blob: Blob | null;
  observaciones: Observacion[] | null;
  correcciones: any[] | null;
  infoProyecto: infoProyecto;
}

export function VisualizadorPDFCorrecciones({ 
  blob, 
  observaciones, 
  correcciones, 
  infoProyecto 
}: VisualizadorPDFProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  
  // Custom hooks
  const { currentPage, totalPages, setTotalPages } = usePageTracking();
  
  const {
    highlights,
    addHighlight,
    resetHighlights
  } = useHighlightManagementCorrecciones({ correcciones });

  const {
    isPdfReady,
    setIsPdfReady,
    scrollToHighlightRef,
    handleHighlightClick
  } = useScrollToHighlight({
    selectedObservation: undefined,
    highlights,
    infoProyecto
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

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
      if (event.message?.includes("Extension context invalidated") ||
          event.message?.includes("message port closed")) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

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

            return (
              <PdfHighlighter
                pdfDocument={pdfDocument}
                enableAreaSelection={(event) => event.altKey}
                onScrollChange={() => {}}
                scrollRef={(scrollToFunction) => {
                  console.log("scrollRef asignado:", !!scrollToFunction);
                  scrollToHighlightRef.current = scrollToFunction;
                }}
                onSelectionFinished={(
                  position,
                  content,
                  hideTipAndSelection,
                  transformSelection
                ) => (
                  <TipCor
                    onOpen={transformSelection}
                    onConfirm={(comment: { text: string; observacionId: string }) => {
                      addHighlight({ 
                        content, 
                        position, 
                        comment: {
                          text: comment.text,
                          emoji: "",
                        },
                        estado: "pendiente", 
                        documento_id: infoProyecto.codigoDoc, 
                        proyecto_id: infoProyecto.codigoProyecto,
                        observacionId: comment.observacionId
                      });
                      hideTipAndSelection();
                    }}
                    observaciones={observaciones}
                  />
                )}
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
                      popupContent={<HighlightPopupCorrecciones comment={highlight.comment} />}
                      onMouseOver={(popupContent) => setTip(highlight, (highlight) => popupContent)}
                      onMouseOut={hideTip}
                      key={index}
                    >
                      {component}
                    </Popup>
                  );
                }}
                highlights={highlights}
              />
            );
          }}
        </PdfLoader>
      </div>

      <Sidebar
        resetHighlights={resetHighlights}
        onHighlightClick={handleHighlightClick} 
        highlights={highlights}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />
    </div>
  );
}