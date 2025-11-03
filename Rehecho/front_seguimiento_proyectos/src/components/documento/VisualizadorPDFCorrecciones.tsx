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
  modoSeleccion?: boolean;
  observacionSeleccionada?: any;
  onSeleccionCompletada?: () => void;
  observacionesPendientes?: any[];
  observacionesCorregidas?: any[];
  onIniciarModoSeleccion?: (observacion: any) => void;
}

export function VisualizadorPDFCorrecciones({ 
  blob, 
  observaciones, 
  correcciones, 
  infoProyecto,
  modoSeleccion = false,
  observacionSeleccionada = null,
  onSeleccionCompletada,
  observacionesPendientes = [],
  observacionesCorregidas = [],
  onIniciarModoSeleccion
}: VisualizadorPDFProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  
  // Custom hooks
  const { currentPage, totalPages, setTotalPages } = usePageTracking();
  console.log(`cantidad de observaciones pendientes: ${observacionesPendientes.length}`);
  
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

  // Función para manejar la selección de texto en modo corrección
  const handleSelectionFinished = (
    position: any,
    content: any,
    hideTipAndSelection: () => void,
    transformSelection: () => void
  ) => {
    if (modoSeleccion && observacionSeleccionada) {
      // Crear corrección automáticamente sin TipCor
      const nuevaCorreccion = {
        content,
        position,
        comment: {
          text: `Corrección para observación #${observacionSeleccionada.id}`,
          emoji: "",
        },
        estado: "pendiente",
        documento_id: infoProyecto.codigoDoc,
        proyecto_id: infoProyecto.codigoProyecto,
        observacionId: observacionSeleccionada.id,
        isCorreccion: true
      };

      console.log('➕ Creando corrección automática:', nuevaCorreccion);
      
      addHighlight(nuevaCorreccion);
      hideTipAndSelection();
      
      // Notificar que la selección se completó
      if (onSeleccionCompletada) {
        onSeleccionCompletada();
      }
      
      return null;
    } else {
      // Comportamiento normal para otros roles
      return (
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
      );
    }
  };

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
      <div className={`${styles.pdfViewerContent} ${isSidebarCollapsed ? styles.sidebarHidden : ''} ${modoSeleccion ? styles.modoSeleccionActivo : ''}`} style={{ position: 'relative' }}>
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
                enableAreaSelection={(event) => !modoSeleccion && event.altKey} // Deshabilitar ALT en modo selección
                onScrollChange={() => {}}
                scrollRef={(scrollToFunction) => {
                  console.log("scrollRef asignado:", !!scrollToFunction);
                  scrollToHighlightRef.current = scrollToFunction;
                }}
                onSelectionFinished={handleSelectionFinished}
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
                      observacionId={highlight.observacionId}
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
        role="correccion"
        observacionesPendientes={observacionesPendientes}
        onIniciarModoSeleccion={onIniciarModoSeleccion}
        observacionSeleccionada={observacionSeleccionada}
        modoSeleccion={modoSeleccion}
      />
    </div>
  );
}