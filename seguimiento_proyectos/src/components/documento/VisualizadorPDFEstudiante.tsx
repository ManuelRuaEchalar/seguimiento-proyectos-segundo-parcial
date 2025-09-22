'use client';
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Observacion, ObservacionArea } from '@/types';
import { fetchImageAsBase64 } from '@/services/observaciones';
import {
  AreaHighlight,
  Highlight,
  PdfHighlighter,
  PdfLoader,
  Popup,
} from "./react-pdf-highlighter";
import type { IHighlight, ScaledPosition } from "./react-pdf-highlighter";
import { Sidebar } from "./SidebarEstudiante";
import { Spinner } from "./Spinner"; // Correct import for Spinner

interface infoProyecto {
  codigoProyecto: number;
  codigoDoc: number;
}

interface VisualizadorPDFEstudianteProps {
  blob: Blob | null;
  observaciones: Observacion[] | null;
  observacionesArea: ObservacionArea[] | null;
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

const convertObservacionToHighlight = async (observacion: any, isArea: boolean = false): Promise<IHighlight> => {
  let position;

  if (observacion.position) {
    position = observacion.position;
  } else if (
    observacion.boundingX1 !== undefined &&
    observacion.boundingY1 !== undefined
  ) {
    const pageNumber = observacion.boundingPage || 1;
    const width = 1020;
    const height = 1320;

    position = {
      boundingRect: {
        x1: observacion.boundingX1,
        y1: observacion.boundingY1,
        x2: observacion.boundingX2,
        y2: observacion.boundingY2,
        width,
        height,
        pageNumber,
      },
      rects:
        observacion.rects && Array.isArray(observacion.rects)
          ? observacion.rects.map((rect: any) => ({
              x1: rect.x1 || rect.boundingX1 || observacion.boundingX1,
              y1: rect.y1 || rect.boundingY1 || observacion.boundingY1,
              x2: rect.x2 || rect.boundingX2 || observacion.boundingX2,
              y2: rect.y2 || rect.boundingY2 || observacion.boundingY2,
              width: rect.width || width,
              height: rect.height || height,
              pageNumber: rect.pageNumber || pageNumber,
            }))
          : [
              {
                x1: observacion.boundingX1,
                y1: observacion.boundingY1,
                x2: observacion.boundingX2,
                y2: observacion.boundingY2,
                width,
                height,
                pageNumber,
              },
            ],
      pageNumber,
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

  let content: any = {};
  if (isArea || observacion.imageUrl) {
    const base64Image = await fetchImageAsBase64(observacion.imageUrl);
    content.image = base64Image || "";
  } else {
    content.text = observacion.contentText || observacion.content?.text || "";
  }

  const highlight: IHighlight = {
    id: observacion.id?.toString() || String(Math.random()).slice(2),
    content,
    position,
    comment: {
      text: observacion.commentText || observacion.comment?.text || "",
      emoji: observacion.commentEmoji || observacion.comment?.emoji || "",
    },
    estado: observacion.estado || "pendiente",
    codigoDoc: observacion.codigoDoc || 0,
    codigoProyecto: observacion.codigoProyecto || 1,
  };

  (highlight as any).isAreaHighlight = isArea || !!observacion.imageUrl;

  return highlight;
};

export function VisualizadorPDFEstudiante({ blob, observaciones, observacionesArea, infoProyecto }: VisualizadorPDFEstudianteProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<Array<IHighlight>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPdfReady, setIsPdfReady] = useState<boolean>(false);
  const scrollToHighlightRef = useRef<((highlight: IHighlight) => void) | null>(null);
  const loadedObservacionesRef = useRef<string>("");
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
    const textObservaciones = observaciones || [];
    const areaObservaciones = observacionesArea || [];
    const allObservaciones = [...textObservaciones, ...areaObservaciones];

    const currentObservacionesId = allObservaciones.length > 0
      ? JSON.stringify(allObservaciones.map((obs) => obs.id).sort())
      : "empty";

    if (loadedObservacionesRef.current === currentObservacionesId || initializingRef.current) {
      return;
    }

    if (allObservaciones.length === 0) {
      setHighlights([]);
      loadedObservacionesRef.current = currentObservacionesId;
      return;
    }

    initializingRef.current = true;

    const loadTimer = setTimeout(async () => {
      try {
        const textHighlights = await Promise.all(
          textObservaciones.map((obs) => convertObservacionToHighlight(obs, false))
        );

        const areaHighlights = await Promise.all(
          areaObservaciones.map((obs) => convertObservacionToHighlight(obs, true))
        );

        const converted = [...textHighlights, ...areaHighlights];
        setHighlights(converted);
        loadedObservacionesRef.current = currentObservacionesId;
      } catch (err) {
        console.error("Error al convertir observaciones:", err);
        setHighlights([]);
      } finally {
        initializingRef.current = false;
      }
    }, 0);

    return () => {
      clearTimeout(loadTimer);
      initializingRef.current = false;
    };
  }, [observaciones, observacionesArea]);

  const resetHighlights = useCallback(() => {
    setHighlights([]);
    loadedObservacionesRef.current = "";
    initializingRef.current = false;
  }, []);

  const handleHighlightClick = useCallback((highlight: IHighlight) => {
    if (scrollToHighlightRef.current && isPdfReady) {
      scrollToHighlightRef.current(highlight);
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
              setIsPdfReady(true);
            };

            setTimeout(updatePages, 0);

            return (
              <PdfHighlighter
                pdfDocument={pdfDocument}
                enableAreaSelection={() => false} // Disable area selection
                onScrollChange={() => {}}
                scrollRef={(scrollToFunction) => {
                  scrollToHighlightRef.current = scrollToFunction;
                }}
                onSelectionFinished={() => null} // Disable text selection
                highlightTransform={(
                  highlight,
                  index,
                  setTip,
                  hideTip,
                  viewportToScaled,
                  screenshot,
                  isScrolledTo
                ) => {
                  const isAreaHighlight = (highlight as any).isAreaHighlight || 
                                         (highlight.content?.image && !highlight.content?.text);

                  const component = isAreaHighlight ? (
                    <AreaHighlight
                      isScrolledTo={isScrolledTo}
                      highlight={highlight}
                      onChange={() => {}} // No changes allowed
                    />
                  ) : (
                    <Highlight
                      isScrolledTo={isScrolledTo}
                      position={highlight.position}
                      comment={highlight.comment}
                      estado={highlight.estado || "pendiente"} 
                      codigoDoc={highlight.codigoDoc || 2}
                      codigoProyecto={highlight.codigoProyecto || 1}
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

export default VisualizadorPDFEstudiante;