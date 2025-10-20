import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Observacion } from "@/types";
import {
  AreaHighlight,
  Highlight,
  PdfHighlighter,
  PdfLoader,
  Popup,
} from "./react-pdf-highlighter";
import type { IHighlight, ScaledPosition } from "./react-pdf-highlighter";
import { Sidebar } from "./Sidebar";
import { Spinner } from "./Spinner";
import styles from "./style/VisualizadorPDF.module.css";

interface infoProyecto {
  codigoProyecto: number;
  codigoDoc: number;
}

interface VisualizadorPDFProps {
  blob: Blob | null;
  observaciones: Observacion[] | null;
  observacionesOtrasVersiones?: any[];
  correcciones: any[] | null;
  infoProyecto: infoProyecto;
  selectedObservation?: any;
  contentType?: string;
  onObservationClick?: (observacion: any) => void;
  onApprovalComplete?: () => void;
  onRejectionWithNewObservation?: (
    rejectedCorrection: any,
    commentText: string
  ) => void;
  onActualizarEstadoObservacion?: (
    observacionId: number,
    nuevoEstado: string
  ) => void;
  modoSoloLectura?: boolean; // 🆕 NUEVA PROP
}

// Hook personalizado para el seguimiento de páginas
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
          .filter((entry) => entry.isIntersecting)
          .map((entry) => ({
            pageNumber: parseInt(
              entry.target.getAttribute("data-page-number") || "1"
            ),
            intersectionRatio: entry.intersectionRatio,
          }))
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visiblePages.length > 0) {
          setCurrentPage(visiblePages[0].pageNumber);
        }
      },
      {
        root: null,
        rootMargin: "-20% 0px -20% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75],
      }
    );
  }, []);

  const observePageElements = useCallback(() => {
    const possibleSelectors = [
      ".react-pdf__Page",
      "[data-page-number]",
      ".page",
      ".pdf-page",
      ".PdfHighlighter__page",
    ];

    let pageElements: NodeListOf<Element> | null = null;

    for (const selector of possibleSelectors) {
      pageElements = document.querySelectorAll(selector);
      if (pageElements.length > 0) break;
    }

    if (pageElements && pageElements.length > 0) {
      pageElements.forEach((element, index) => {
        if (!element.getAttribute("data-page-number")) {
          element.setAttribute("data-page-number", (index + 1).toString());
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
            if (
              element.classList.contains("react-pdf__Page") ||
              element.querySelector(".react-pdf__Page") ||
              element.classList.contains("page") ||
              element.querySelector(".page") ||
              element.classList.contains("PdfHighlighter__page") ||
              element.querySelector(".PdfHighlighter__page")
            ) {
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
      subtree: true,
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
  comment: { text: string; emoji?: string };
}) =>
  comment.text ? (
    <div className={styles.highlightPopup}>
      {comment.emoji && <span>{comment.emoji} </span>}
      {comment.text}
    </div>
  ) : null;

const convertObservacionToHighlight = (observacion: any): IHighlight => {
  let position;

  if (observacion.position) {
    position = observacion.position;
  } else if (
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
    text: observacion.content_text || observacion.content?.text || "",
  };

  const highlight: IHighlight = {
    id: observacion.id?.toString() || getNextId(),
    content,
    position,
    comment: {
      text: observacion.comment_text || observacion.comment?.text || "",
      emoji: observacion.comment_emoji || observacion.comment?.emoji || "",
    },
    estado: observacion.estado || "pendiente",
    documento_id: observacion.documento_id || 0,
    proyecto_id: observacion.proyecto_id || 1,
    observacionId: "",
  };

  return highlight;
};

const convertCorreccionToHighlight = (correccion: any): IHighlight => {
  let position;

  if (correccion.position) {
    position = correccion.position;
  } else if (
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
    text: correccion.content_text || correccion.content?.text || "",
  };

  const highlight: IHighlight = {
    id: correccion.id?.toString() || getNextId(),
    content,
    position,
    comment: {
      text: correccion.comment_text || correccion.comment?.text || "",
      emoji: correccion.comment_emoji || correccion.comment?.emoji || "",
    },
    estado: correccion.estado || "pendiente",
    documento_id: correccion.documento_id || 0,
    proyecto_id: correccion.proyecto_id || 1,
    isCorreccion: true,
    observacionId: correccion.observacion_id || correccion.observacionId || "",
  };

  return highlight;
};

export function VisualizadorPDF({
  blob,
  observaciones,
  observacionesOtrasVersiones = [],
  correcciones,
  infoProyecto,
  selectedObservation,
  onObservationClick,
  onRejectionWithNewObservation,
  contentType = "application/pdf",
  onApprovalComplete,
  onActualizarEstadoObservacion,
  modoSoloLectura = false, // 🆕 DEFAULT false (estudiante puede editar)
}: VisualizadorPDFProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<Array<IHighlight>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPdfReady, setIsPdfReady] = useState<boolean>(false);

  const scrollToHighlightRef = useRef<((highlight: IHighlight) => void) | null>(
    null
  );
  const loadedObservacionesRef = useRef<string>("");
  const { currentPage, totalPages, setTotalPages } = usePageTracking();

  const memoizedHighlights = useMemo(() => highlights, [highlights]);

  useEffect(() => {
    console.log("🎯 VisualizadorPDF - Modo solo lectura:", modoSoloLectura);
  }, [modoSoloLectura]);

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
    const allCorrecciones = correcciones || [];
    const allItems = [...textObservaciones, ...allCorrecciones];

    const currentItemsId =
      allItems.length > 0
        ? `${allItems.length}-${allItems.map((item) => item.id).join(",")}`
        : "empty";

    if (loadedObservacionesRef.current === currentItemsId) {
      return;
    }

    if (allItems.length === 0) {
      setHighlights([]);
      loadedObservacionesRef.current = currentItemsId;
      return;
    }

    try {
      const textHighlights = textObservaciones.map((obs) =>
        convertObservacionToHighlight(obs)
      );
      const correccionHighlights = allCorrecciones.map((corr) =>
        convertCorreccionToHighlight(corr)
      );

      const converted = [...textHighlights, ...correccionHighlights];
      setHighlights(converted);
      loadedObservacionesRef.current = currentItemsId;
    } catch (err) {
      console.error("Error al convertir observaciones y correcciones:", err);
      setHighlights([]);
    }
  }, [observaciones, correcciones]);

  useEffect(() => {
    if (!selectedObservation || !isPdfReady || !scrollToHighlightRef.current) {
      return;
    }

    const attemptScroll = () => {
      let highlight: IHighlight | undefined;

      if (infoProyecto.codigoDoc === selectedObservation.codigoDoc) {
        highlight = highlights.find(
          (h) => h.id === selectedObservation.id?.toString()
        );
        if (highlight) {
          scrollToHighlightRef.current!(highlight);
        }
      } else {
        highlight = highlights.find(
          (h) =>
            h.isCorreccion &&
            h.observacionId === selectedObservation.id?.toString()
        );
        if (highlight) {
          scrollToHighlightRef.current!(highlight);
        }
      }
    };

    attemptScroll();
    const retryTimer = setTimeout(() => {
      if (highlights.length > 0) {
        attemptScroll();
      }
    }, 500);

    return () => clearTimeout(retryTimer);
  }, [selectedObservation, isPdfReady, highlights, infoProyecto.codigoDoc]);

  const resetHighlights = useCallback(() => {
    setHighlights([]);
    loadedObservacionesRef.current = "";
  }, []);

  const handleHighlightClick = useCallback(
    (highlight: IHighlight) => {
      if (scrollToHighlightRef.current && isPdfReady) {
        scrollToHighlightRef.current(highlight);
      }
    },
    [isPdfReady]
  );

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

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
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
        <button className={styles.errorButton} onClick={() => setError(null)}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.pdfViewerContainer}>
      {/* 🆕 SIDEBAR SOLO EN MODO LECTURA (para ver observaciones sin editar) */}
      {!modoSoloLectura && (
        <Sidebar
          highlights={highlights.filter((h) => !h.isCorreccion)}
          observacionesOtrasVersiones={observacionesOtrasVersiones}
          resetHighlights={resetHighlights}
          onHighlightClick={handleHighlightClick}
          onObservationClick={onObservationClick}
          showApprovalForm={undefined}
          onApprove={() => {}}
          onReject={() => {}}
        />
      )}

      <div className={styles.pdfViewerContent} style={{ position: "relative" }}>
        {/* 🆕 INDICADOR DE MODO SOLO LECTURA */}
        {modoSoloLectura && (
          <div className={styles.readOnlyBadge}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Solo lectura
          </div>
        )}

        <div className={styles.pageIndicator}>
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
                // 🔒 DESHABILITAR SELECCIÓN EN MODO SOLO LECTURA
                enableAreaSelection={() => !modoSoloLectura}
                onScrollChange={() => {}}
                scrollRef={(scrollToFunction) => {
                  scrollToHighlightRef.current = scrollToFunction;
                }}
                // 🔒 NO MOSTRAR TIP EN MODO SOLO LECTURA
                onSelectionFinished={(
                  position: ScaledPosition,
                  content: { text?: string; image?: string },
                  hideTipAndSelection: () => void,
                  transformSelection: () => void
                ) => {
                  // En modo solo lectura no mostramos tip ni permitimos acciones, retornamos null (Element | null)
                  if (modoSoloLectura) {
                    return null;
                  }

                  // Por ahora no mostramos un elemento al finalizar la selección,
                  // devolvemos null para cumplir la firma requerida.
                  return null;
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

                  // 🔒 EN MODO SOLO LECTURA, NO MOSTRAR POPUP AL HOVER
                  if (modoSoloLectura) {
                    return component;
                  }

                  return (
                    <Popup
                      popupContent={<HighlightPopup {...highlight} />}
                      onMouseOver={(popupContent) =>
                        setTip(highlight, (highlight) => popupContent)
                      }
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
    </div>
  );
}
