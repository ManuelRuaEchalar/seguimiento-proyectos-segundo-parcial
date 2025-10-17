import React, { useState, useEffect, useCallback, useRef } from "react";
import { Observacion } from '@/types';
import { createCorreccion } from "@/services/correcciones";
import {
  Highlight,
  PdfHighlighter,
  PdfLoader,
  Popup,
  TipCor,
} from "./react-pdf-highlighter";
import type {
  Content,
  IHighlight,
  NewHighlight,
  ScaledPosition,
} from "./react-pdf-highlighter";
import { Sidebar } from "./Sidebar";
import { Spinner } from "./Spinner";
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

      setTotalPages((prev) => {
        if (prev !== pageElements!.length) {
          return pageElements!.length;
        }
        return prev;
      });
    }
  }, []);

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
    <div className={styles['highlight-popup']}>
      {comment.emoji} {comment.text}
    </div>
  ) : null;

const convertObservacionToHighlight = (observacion: any): IHighlight => {
  let position;

  if (observacion.position) {
    position = observacion.position;
  } else if (
    // ✅ Corregir: usar snake_case que viene de la BD
    observacion.bounding_x1 !== undefined &&
    observacion.bounding_y1 !== undefined
  ) {
    const pageNumber = observacion.bounding_page || 1;
    const width = 1020;
    const height = 1320;

    position = {
      boundingRect: {
        x1: observacion.bounding_x1,
        y1: observacion.bounding_y1,
        x2: observacion.bounding_x2,
        y2: observacion.bounding_y2,
        width,
        height,
        pageNumber,
      },
      rects:
        observacion.rects && Array.isArray(observacion.rects)
          ? observacion.rects.map((rect: any) => ({
              x1: rect.x1 || observacion.bounding_x1,
              y1: rect.y1 || observacion.bounding_y1,
              x2: rect.x2 || observacion.bounding_x2,
              y2: rect.y2 || observacion.bounding_y2,
              width: rect.width || width,
              height: rect.height || height,
              pageNumber: rect.pageNumber || pageNumber,
            }))
          : [
              {
                x1: observacion.bounding_x1,
                y1: observacion.bounding_y1,
                x2: observacion.bounding_x2,
                y2: observacion.bounding_y2,
                width,
                height,
                pageNumber,
              },
            ],
      pageNumber,
    };
  } else {
    // Posición por defecto solo si no hay datos
    position = {
      boundingRect: {
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 20,
        width: 1020,
        height: 1320,
        pageNumber: 1,
      },
      rects: [
        {
          x1: 0,
          y1: 0,
          x2: 100,
          y2: 20,
          width: 1020,
          height: 1320,
          pageNumber: 1,
        },
      ],
      pageNumber: 1,
    };
  }

  const content: any = {
    // ✅ Corregir: usar snake_case que viene de la BD
    text: observacion.content_text || observacion.content?.text || "",
  };

  const highlight: IHighlight = {
    id: observacion.id?.toString() || getNextId(),
    content,
    position,
    comment: {
      // ✅ Corregir: usar snake_case que viene de la BD
      text: observacion.comment_text || observacion.comment?.text || "",
      emoji: observacion.comment_emoji || observacion.comment?.emoji || "",
    },
    estado: observacion.estado || "pendiente",
    // ✅ Corregir: usar snake_case que viene de la BD
    documento_id: observacion.documento_id || 0,
    proyecto_id: observacion.proyecto_id || 1,
    observacionId: ""
  };

  return highlight;
};

const convertCorreccionToHighlight = (correccion: any): IHighlight => {
  let position;

  if (correccion.position) {
    position = correccion.position;
  } else if (
    // ✅ Corregir: usar snake_case que viene de la BD
    correccion.bounding_x1 !== undefined &&
    correccion.bounding_y1 !== undefined
  ) {
    const pageNumber = correccion.bounding_page || 1;
    const width = 1020;
    const height = 1320;

    position = {
      boundingRect: {
        x1: correccion.bounding_x1,
        y1: correccion.bounding_y1,
        x2: correccion.bounding_x2,
        y2: correccion.bounding_y2,
        width,
        height,
        pageNumber,
      },
      rects:
        correccion.rects && Array.isArray(correccion.rects)
          ? correccion.rects.map((rect: any) => ({
              x1: rect.x1 || correccion.bounding_x1,
              y1: rect.y1 || correccion.bounding_y1,
              x2: rect.x2 || correccion.bounding_x2,
              y2: rect.y2 || correccion.bounding_y2,
              width: rect.width || width,
              height: rect.height || height,
              pageNumber: rect.pageNumber || pageNumber,
            }))
          : [
              {
                x1: correccion.bounding_x1,
                y1: correccion.bounding_y1,
                x2: correccion.bounding_x2,
                y2: correccion.bounding_y2,
                width,
                height,
                pageNumber,
              },
            ],
      pageNumber,
    };
  } else {
    // Posición por defecto solo si no hay datos
    position = {
      boundingRect: {
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 20,
        width: 1020,
        height: 1320,
        pageNumber: 1,
      },
      rects: [
        {
          x1: 0,
          y1: 0,
          x2: 100,
          y2: 20,
          width: 1020,
          height: 1320,
          pageNumber: 1,
        },
      ],
      pageNumber: 1,
    };
  }

  const content: any = {
    // ✅ Corregir: usar snake_case que viene de la BD
    text: correccion.content_text || correccion.content?.text || "",
  };

  const highlight: IHighlight = {
    id: correccion.id?.toString() || getNextId(),
    content,
    position,
    comment: {
      // ✅ Corregir: usar snake_case que viene de la BD
      text: correccion.comment_text || correccion.comment?.text || "",
      emoji: correccion.comment_emoji || correccion.comment?.emoji || "",
    },
    estado: correccion.estado || "pendiente",
    // ✅ Corregir: usar snake_case que viene de la BD
    documento_id: correccion.documento_id || 0,
    proyecto_id: correccion.proyecto_id || 1,
    isCorreccion: true,
    observacionId: correccion.observacion_id || correccion.observacionId || ""
  };

  return highlight;
};

export function VisualizadorPDFCorrecciones({ blob, observaciones, correcciones, infoProyecto }: VisualizadorPDFProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<Array<IHighlight>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPdfReady, setIsPdfReady] = useState<boolean>(false);
  
  const scrollToHighlightRef = useRef<((highlight: IHighlight) => void) | null>(null);
  const loadedCorreccionesRef = useRef<string>("");
  const initializingRef = useRef<boolean>(false);
  const { currentPage, totalPages, setTotalPages } = usePageTracking();
  
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

  useEffect(() => {
    const allCorrecciones = correcciones || [];
    
    const currentCorreccionesId = allCorrecciones.length > 0
      ? JSON.stringify(allCorrecciones.map((item) => `${item.id}-corr`).sort())
      : "empty";

    if (loadedCorreccionesRef.current === currentCorreccionesId || initializingRef.current) {
      return;
    }

    if (allCorrecciones.length === 0) {
      console.log("No hay correcciones, limpiando highlights");
      setHighlights([]);
      loadedCorreccionesRef.current = currentCorreccionesId;
      return;
    }

    initializingRef.current = true;

    console.log("Cargando solo correcciones para renderizado:", {
      correcciones: allCorrecciones.length
    });

    const loadTimer = setTimeout(() => {
      try {
        const correccionHighlights = allCorrecciones.map((corr) => convertCorreccionToHighlight(corr));

        setHighlights(correccionHighlights);
        loadedCorreccionesRef.current = currentCorreccionesId;
        
        console.log("Highlights de correcciones cargados exitosamente:", {
          correcciones: correccionHighlights.length
        });
      } catch (err) {
        console.error("Error al convertir correcciones:", err);
        setHighlights([]);
      } finally {
        initializingRef.current = false;
      }
    }, 0);

    return () => {
      clearTimeout(loadTimer);
      initializingRef.current = false;
    };
  }, [correcciones]);

  const resetHighlights = useCallback(() => {
    setHighlights([]);
    loadedCorreccionesRef.current = "";
    initializingRef.current = false;
  }, []);

  const handleHighlightClick = useCallback((highlight: IHighlight) => {
    if (scrollToHighlightRef.current && isPdfReady) {
      console.log("Navegando al highlight:", highlight.id);
      scrollToHighlightRef.current(highlight);
    } else {
      console.warn("Función de scroll no disponible todavía o PDF no está listo");
    }
  }, [isPdfReady]);

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

  const addHighlight = useCallback(async (highlight: NewHighlight) => {
    console.log("Saving correction highlight", highlight);

    const newHighlight = { ...highlight, id: getNextId() };
    setHighlights((prevHighlights) => [newHighlight, ...prevHighlights]);

    console.log("Nueva corrección:", newHighlight);

    // Create and download JSON file
    const jsonContent = JSON.stringify(newHighlight, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `highlight_${newHighlight.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    try {
      await createCorreccion(newHighlight);
      console.log("Corrección guardada en BD");
    } catch (error) {
      console.error("Error al guardar la corrección en BD:", error);
    }
}, []);

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
      <div className={styles['pdf-viewer-loading']}>
        <div>No hay documento para mostrar</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['pdf-viewer-error']}>
        <h2>Error loading PDF</h2>
        <p>{error}</p>
        <button onClick={() => setError(null)}>Try Again</button>
      </div>
    );
  }

  return (
    <div className={styles['pdf-viewer-container']}>
      <Sidebar
        resetHighlights={resetHighlights}
        onHighlightClick={handleHighlightClick} 
        highlights={highlights}
      />
      <div className={styles['pdf-viewer-content']}>
        <div className={styles['page-indicator']}>
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