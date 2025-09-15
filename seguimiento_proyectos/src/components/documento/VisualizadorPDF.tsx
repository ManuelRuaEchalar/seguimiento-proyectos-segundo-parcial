import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Observacion } from '@/types';
import { createObservacion } from '@/services/observaciones';

import {
  AreaHighlight,
  Highlight,
  PdfHighlighter,
  PdfLoader,
  Popup,
  Tip,
} from "./react-pdf-highlighter";
import type {
  Content,
  IHighlight,
  NewHighlight,
  ScaledPosition,
} from "./react-pdf-highlighter";

import { Sidebar } from "./Sidebar";
import { Spinner } from "./Spinner";

interface VisualizadorPDFProps {
  blob: Blob | null;
  observaciones: Observacion[] | null;
}

// Hook personalizado para el seguimiento de páginas (sin cambios)
const usePageTracking = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const mutationObserverRef = useRef<MutationObserver | null>(null);

  const setupPageObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visiblePages = entries
          .filter(entry => entry.isIntersecting)
          .map(entry => ({
            pageNumber: parseInt(entry.target.getAttribute('data-page-number') || '1'),
            intersectionRatio: entry.intersectionRatio
          }))
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visiblePages.length > 0) {
          setCurrentPage(visiblePages[0].pageNumber);
        }
      },
      {
        root: null,
        rootMargin: '-20% 0px -20% 0px',
        threshold: [0.1, 0.25, 0.5, 0.75]
      }
    );
  }, []);

  const observePageElements = useCallback(() => {
    const possibleSelectors = [
      '.react-pdf__Page',
      '[data-page-number]',
      '.page',
      '.pdf-page',
      '.PdfHighlighter__page'
    ];

    let pageElements: NodeListOf<Element> | null = null;

    for (const selector of possibleSelectors) {
      pageElements = document.querySelectorAll(selector);
      if (pageElements.length > 0) break;
    }

    if (pageElements && pageElements.length > 0) {
      pageElements.forEach((element, index) => {
        if (!element.getAttribute('data-page-number')) {
          element.setAttribute('data-page-number', (index + 1).toString());
        }
        
        if (observerRef.current) {
          observerRef.current.observe(element);
        }
      });

      if (totalPages !== pageElements.length) {
        setTotalPages(pageElements.length);
      }
    }
  }, [totalPages]);

  useEffect(() => {
    setupPageObserver();

    mutationObserverRef.current = new MutationObserver((mutations) => {
      let shouldReobserve = false;

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.classList.contains('react-pdf__Page') || 
                element.querySelector('.react-pdf__Page') ||
                element.classList.contains('page') ||
                element.querySelector('.page') ||
                element.classList.contains('PdfHighlighter__page') ||
                element.querySelector('.PdfHighlighter__page')) {
              shouldReobserve = true;
            }
          }
        });
      });

      if (shouldReobserve) {
        setTimeout(observePageElements, 100);
      }
    });

    mutationObserverRef.current.observe(document.body, {
      childList: true,
      subtree: true
    });

    const initialObserveTimer = setTimeout(observePageElements, 500);
    const secondAttempt = setTimeout(observePageElements, 1000);
    const thirdAttempt = setTimeout(observePageElements, 2000);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
      }
      clearTimeout(initialObserveTimer);
      clearTimeout(secondAttempt);
      clearTimeout(thirdAttempt);
    };
  }, [setupPageObserver, observePageElements]);

  const setTotalPagesManually = useCallback((pages: number) => {
    setTotalPages(pages);
  }, []);

  return { currentPage, totalPages, setTotalPages: setTotalPagesManually };
};

const getNextId = () => String(Math.random()).slice(2);

const HighlightPopup = ({
  comment,
}: {
  comment: { text: string; emoji: string };
}) =>
  comment.text ? (
    <div className="highlight-popup">
      {comment.emoji} {comment.text}
    </div>
  ) : null;

// Función para convertir Observacion a IHighlight (sin cambios)
const convertObservacionToHighlight = (observacion: any): IHighlight => {
  let position;
  
  if (observacion.position) {
    position = observacion.position;
  } else if (observacion.boundingX1 !== undefined && observacion.boundingY1 !== undefined) {
    const pageNumber = observacion.boundingPage || 1;
    const width = 1020;
    const height = 1320;
    
    position = {
      boundingRect: {
        x1: observacion.boundingX1,
        y1: observacion.boundingY1,
        x2: observacion.boundingX2,
        y2: observacion.boundingY2,
        width: width,
        height: height,
        pageNumber: pageNumber
      },
      rects: observacion.rects && Array.isArray(observacion.rects) ? 
        observacion.rects.map((rect: any) => ({
          x1: rect.x1 || rect.boundingX1 || observacion.boundingX1,
          y1: rect.y1 || rect.boundingY1 || observacion.boundingY1,
          x2: rect.x2 || rect.boundingX2 || observacion.boundingX2,
          y2: rect.y2 || rect.boundingY2 || observacion.boundingY2,
          width: rect.width || width,
          height: rect.height || height,
          pageNumber: rect.pageNumber || pageNumber
        })) : [{
          x1: observacion.boundingX1,
          y1: observacion.boundingY1,
          x2: observacion.boundingX2,
          y2: observacion.boundingY2,
          width: width,
          height: height,
          pageNumber: pageNumber
        }],
      pageNumber: pageNumber
    };
  } else {
    position = {
      boundingRect: {
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 20,
        width: 1020,
        height: 1320,
        pageNumber: 1
      },
      rects: [{
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 20,
        width: 1020,
        height: 1320,
        pageNumber: 1
      }],
      pageNumber: 1
    };
  }

  return {
    id: observacion.id?.toString() || getNextId(),
    content: {
      text: observacion.contentText || observacion.content?.text || ""
    },
    position: position,
    comment: {
      text: observacion.commentText || observacion.comment?.text || "",
      emoji: observacion.commentEmoji || observacion.comment?.emoji || ""
    },
    estado: observacion.estado || "pendiente",
    codigoDoc: observacion.codigoDoc || 2
  };
};

export function VisualizadorPDF({ blob, observaciones }: VisualizadorPDFProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<Array<IHighlight>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPdfReady, setIsPdfReady] = useState<boolean>(false); // Nuevo estado

  const scrollToHighlightRef = useRef<((highlight: IHighlight) => void) | null>(null);
  const loadedObservacionesRef = useRef<string>("");
  const initializingRef = useRef<boolean>(false);
  const { currentPage, totalPages, setTotalPages } = usePageTracking();
  
  // Crear URL del blob cuando cambie
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

  // Memorizar las observaciones convertidas para evitar recalculos
  const convertedHighlights = useMemo(() => {
    if (!observaciones || observaciones.length === 0) {
      return [];
    }

    try {
      console.log("Convirtiendo observaciones:", observaciones.length);
      return observaciones.map(convertObservacionToHighlight);
    } catch (error) {
      console.error("Error al convertir observaciones:", error);
      return [];
    }
  }, [observaciones]);

  // Efecto optimizado para cargar observaciones - SOLO se ejecuta cuando cambian las observaciones
  useEffect(() => {
    // Crear un identificador único para este conjunto de observaciones
    const currentObservacionesId = observaciones 
      ? JSON.stringify(observaciones.map(obs => obs.id).sort())
      : "empty";

    // Si ya cargamos estas observaciones o estamos inicializando, salir
    if (loadedObservacionesRef.current === currentObservacionesId || initializingRef.current) {
      return;
    }

    // Si no hay observaciones, limpiar highlights
    if (!observaciones || observaciones.length === 0) {
      console.log("No hay observaciones, limpiando highlights");
      setHighlights([]);
      loadedObservacionesRef.current = currentObservacionesId;
      return;
    }

    // Marcar que estamos inicializando para evitar ejecuciones concurrentes
    initializingRef.current = true;

    console.log("Cargando observaciones únicas:", observaciones.length);
    
    // Usar un timeout para asegurar que el estado se actualiza correctamente
    const loadTimer = setTimeout(() => {
      setHighlights(convertedHighlights);
      loadedObservacionesRef.current = currentObservacionesId;
      initializingRef.current = false;
      console.log("Highlights cargados exitosamente:", convertedHighlights.length);
    }, 0);

    return () => {
      clearTimeout(loadTimer);
      initializingRef.current = false;
    };
  }, [convertedHighlights, observaciones]);

  // Función optimizada para reset que también actualiza la referencia
  const resetHighlights = useCallback(() => {
    setHighlights([]);
    loadedObservacionesRef.current = "";
    initializingRef.current = false;
  }, []);

  // Función para manejar el click en un highlight del sidebar
  const handleHighlightClick = useCallback((highlight: IHighlight) => {
    if (scrollToHighlightRef.current && isPdfReady) {
      console.log("Navegando al highlight:", highlight.id);
      scrollToHighlightRef.current(highlight);
    } else {
      console.warn("Función de scroll no disponible todavía o PDF no está listo");
    }
  }, [isPdfReady]);

  // Suprimir errores de extensiones del navegador
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

  // Callback optimizado para agregar highlights
  const addHighlight = useCallback(async (highlight: NewHighlight) => {
    console.log("Saving highlight", highlight);

    const newHighlight = { ...highlight, id: getNextId() };
    setHighlights((prevHighlights) => [newHighlight, ...prevHighlights]);

    console.log("Nuevo highlight:", newHighlight);

    try {
      const saved = await createObservacion(newHighlight);
      console.log("Highlight guardado en BD:", saved);
    } catch (error) {
      console.error("Error al guardar el highlight en BD:", error);
    }
  }, []);

  // Callback optimizado para actualizar highlights
  const updateHighlight = useCallback((
    highlightId: string,
    position: Partial<ScaledPosition>,
    content: Partial<Content>,
  ) => {
    console.log("Updating highlight", highlightId, position, content);
    setHighlights((prevHighlights) =>
      prevHighlights.map((h) => {
        const {
          id,
          position: originalPosition,
          content: originalContent,
          ...rest
        } = h;
        return id === highlightId
          ? {
              id,
              position: { ...originalPosition, ...position },
              content: { ...originalContent, ...content },
              ...rest,
            }
          : h;
      }),
    );
  }, []);

  if (!blob || !url) {
    return (
      <div className="pdf-viewer-loading">
        <div>No hay documento para mostrar</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pdf-viewer-error">
        <h2>Error loading PDF</h2>
        <p>{error}</p>
        <button onClick={() => setError(null)}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="pdf-viewer-container">
      <Sidebar
        highlights={highlights}
        resetHighlights={resetHighlights}
        onHighlightClick={handleHighlightClick}
      />
      <div className="pdf-viewer-content" style={{ position: 'relative' }}>
        <div className="page-indicator">
          Página {currentPage} {totalPages > 0 && `de ${totalPages}`}
        </div>
        
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
              setIsPdfReady(true); // Marcar el PDF como listo cuando se carga pdfDocument
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
                  <Tip
                    onOpen={transformSelection}
                    onConfirm={(comment) => {
                      addHighlight({ content, position, comment, estado:"pendiente", codigoDoc:2 });
                      hideTipAndSelection();
                    }} 
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
                  const isTextHighlight = !highlight.content?.image;

                  const component = isTextHighlight ? (
                    <Highlight
                      isScrolledTo={isScrolledTo}
                      position={highlight.position}
                      comment={highlight.comment}
                      estado={highlight.estado || "pendiente"} 
                      codigoDoc={highlight.codigoDoc || 2}
                    />
                  ) : (
                    <AreaHighlight
                      isScrolledTo={isScrolledTo}
                      highlight={highlight}
                      onChange={(boundingRect) => {
                        updateHighlight(
                          highlight.id,
                          { boundingRect: viewportToScaled(boundingRect) },
                          { image: screenshot(boundingRect) }
                        );
                      }} 
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
                highlights={highlights}
              />
            );
          }}
        </PdfLoader>
      </div>
    </div>
  );
}