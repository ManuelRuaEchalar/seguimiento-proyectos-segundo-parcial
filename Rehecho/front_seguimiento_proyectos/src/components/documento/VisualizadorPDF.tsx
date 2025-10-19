import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Observacion } from '@/types';
import { createObservacion, cambiarEstado } from '@/services/observaciones';
import { cambiarEstadoDocumento } from '@/services/documentos';
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
import styles from './style/VisualizadorPDF.module.css';

interface infoProyecto {
  codigoProyecto: number;
  codigoDoc: number;
}

interface VisualizadorPDFProps {
  blob: Blob | null;
  observaciones: Observacion[] | null;
  observacionesOtrasVersiones?: any[]; // Nuevo prop
  correcciones: any[] | null;
  infoProyecto: infoProyecto;
  selectedObservation?: any;
  contentType?: string;
  onObservationClick?: (observacion: any) => void; // Nuevo prop
  onApprovalComplete?: () => void;
  onRejectionWithNewObservation?: (rejectedCorrection: any, commentText: string) => void;
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
    observacionId: ""
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
    observacionId: correccion.observacion_id || correccion.observacionId || ""
  };

  return highlight;
};

export function VisualizadorPDF({
  blob,
  observaciones,
  observacionesOtrasVersiones = [], // Valor por defecto
  correcciones,
  infoProyecto,
  selectedObservation,
  onObservationClick,
  onRejectionWithNewObservation,
  contentType = 'application/pdf',
  onApprovalComplete
}: VisualizadorPDFProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<Array<IHighlight>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPdfReady, setIsPdfReady] = useState<boolean>(false);

  const scrollToHighlightRef = useRef<((highlight: IHighlight) => void) | null>(null);
  const loadedObservacionesRef = useRef<string>("");
  const { currentPage, totalPages, setTotalPages } = usePageTracking();

  // 🔧 SIEMPRE declarar useMemo en el mismo lugar, sin condiciones
  const memoizedHighlights = useMemo(() => highlights, [highlights]);

  useEffect(() => {
    console.log('🎯 VisualizadorPDF - observacionesOtrasVersiones recibidas:', {
      total: observacionesOtrasVersiones.length,
      datos: observacionesOtrasVersiones,
      estructuraPrimera: observacionesOtrasVersiones[0]
    });
  }, [observacionesOtrasVersiones]);

  useEffect(() => {
    console.log('🔍 INFO PROYECTO RECIBIDA:', {
      codigoProyecto: infoProyecto.codigoProyecto,
      codigoDoc: infoProyecto.codigoDoc,
      infoProyectoCompleto: infoProyecto
    });

    if (!infoProyecto.codigoProyecto) {
      console.error('⚠️ ADVERTENCIA: codigoProyecto es undefined o null');
    }
    if (!infoProyecto.codigoDoc) {
      console.error('⚠️ ADVERTENCIA: codigoDoc es undefined o null');
    }
  }, [infoProyecto]);

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

  // Convertir observaciones y correcciones a highlights (VERSIÓN OPTIMIZADA)
  useEffect(() => {
    const textObservaciones = observaciones || [];
    const allCorrecciones = correcciones || [];
    const allItems = [...textObservaciones, ...allCorrecciones];

    // Crear una key más estable y simple
    const currentItemsId = allItems.length > 0
      ? `${allItems.length}-${allItems.map(item => item.id).join(',')}`
      : "empty";

    // Evitar re-procesar los mismos datos
    if (loadedObservacionesRef.current === currentItemsId) {
      return;
    }

    if (allItems.length === 0) {
      console.log("No hay observaciones ni correcciones, limpiando highlights");
      setHighlights([]);
      loadedObservacionesRef.current = currentItemsId;
      return;
    }

    console.log("Cargando observaciones y correcciones:", {
      observaciones: textObservaciones.length,
      correcciones: allCorrecciones.length,
      total: allItems.length
    });

    try {
      const textHighlights = textObservaciones.map((obs) => convertObservacionToHighlight(obs));
      const correccionHighlights = allCorrecciones.map((corr) => convertCorreccionToHighlight(corr));

      const converted = [...textHighlights, ...correccionHighlights];
      setHighlights(converted);
      loadedObservacionesRef.current = currentItemsId;

      console.log("Highlights cargados exitosamente:", {
        observaciones: textHighlights.length,
        correcciones: correccionHighlights.length,
        total: converted.length
      });
    } catch (err) {
      console.error("Error al convertir observaciones y correcciones:", err);
      setHighlights([]);
    }
  }, [observaciones, correcciones]);

  // Navegar al highlight seleccionado o a la corrección correspondiente
  useEffect(() => {
    if (!selectedObservation || !isPdfReady || !scrollToHighlightRef.current) {
      return;
    }

    const attemptScroll = () => {
      let highlight: IHighlight | undefined;

      if (infoProyecto.codigoDoc === selectedObservation.codigoDoc) {
        highlight = highlights.find(h => h.id === selectedObservation.id?.toString());
        if (highlight) {
          console.log("Navegando a observación seleccionada:", highlight.id);
          scrollToHighlightRef.current!(highlight);
        } else {
          console.warn("Observación highlight no encontrado para selectedObservation:", selectedObservation.id);
        }
      } else {
        highlight = highlights.find(h => h.isCorreccion && h.observacionId === selectedObservation.id?.toString());
        if (highlight) {
          console.log("Navegando a corrección correspondiente:", highlight.id);
          scrollToHighlightRef.current!(highlight);
        } else {
          console.warn("Corrección highlight no encontrado para observacionId:", selectedObservation.id);
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

  const handleHighlightClick = useCallback((highlight: IHighlight) => {
    if (scrollToHighlightRef.current && isPdfReady) {
      console.log("Navegando al highlight:", highlight.id);
      scrollToHighlightRef.current(highlight);
    } else {
      console.warn("Función de scroll no disponible todavía o PDF no está listo");
    }
  }, [isPdfReady]);

  const showApprovalForm = useMemo(() => {
    if (selectedObservation && infoProyecto.codigoDoc === selectedObservation.codigoDoc) {
      return { id: selectedObservation.id?.toString() || '' };
    }
    return undefined;
  }, [selectedObservation, infoProyecto.codigoDoc]);

  const handleApprove = useCallback(async () => {
    if (!showApprovalForm?.id) return;
    try {
      await cambiarEstado(Number(showApprovalForm.id), 'aprobado');
      console.log('Observación aprobada');
      setHighlights((prevHighlights) =>
        prevHighlights.map((h) =>
          h.id === showApprovalForm.id ? { ...h, estado: 'aprobado' } : h
        )
      );
      onApprovalComplete?.();
    } catch (error) {
      console.error('Error al aprobar:', error);
    }
  }, [showApprovalForm?.id, onApprovalComplete]);

  const handleReject = useCallback(async (commentText?: string) => {
    if (!showApprovalForm?.id) return;

    try {
      await cambiarEstado(Number(showApprovalForm.id), 'rechazado');

      setHighlights((prevHighlights) =>
        prevHighlights.map((h) =>
          h.id === showApprovalForm.id ? { ...h, estado: 'rechazado' } : h
        )
      );

      if (onRejectionWithNewObservation && commentText) {
        const rejectedHighlight = highlights.find(h => h.id === showApprovalForm.id);
        if (rejectedHighlight) {
          await onRejectionWithNewObservation(rejectedHighlight, commentText);
        }
      } else {
        onApprovalComplete?.();
      }

    } catch (error) {
      console.error('Error al rechazar:', error);
    }
  }, [showApprovalForm?.id, onApprovalComplete, onRejectionWithNewObservation, highlights]);

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

  const addHighlight = useCallback(async (highlight: NewHighlight) => {
    console.log("💾 Saving highlight", highlight);
    console.log("📋 infoProyecto disponible:", {
      codigoProyecto: infoProyecto.codigoProyecto,
      codigoDoc: infoProyecto.codigoDoc
    });

    const newHighlight = { ...highlight, id: getNextId() };
    setHighlights((prevHighlights) => [newHighlight, ...prevHighlights]);

    console.log("✏️ Nuevo highlight creado:", newHighlight);

    try {
      if (!infoProyecto.codigoProyecto) {
        console.error('❌ ERROR: codigoProyecto no está disponible');
        throw new Error('codigoProyecto es requerido para guardar la observación');
      }

      if (!infoProyecto.codigoDoc) {
        console.error('❌ ERROR: codigoDoc no está disponible');
        throw new Error('codigoDoc es requerido para guardar la observación');
      }

      const observacionData = {
        ...newHighlight,
        proyecto_id: infoProyecto.codigoProyecto,
        documento_id: infoProyecto.codigoDoc,
      };
      console.log("📤 Datos a enviar al backend:", observacionData);
      console.log("🔑 proyecto_id:", observacionData.proyecto_id, "tipo:", typeof observacionData.proyecto_id);
      console.log("🔑 documento_id:", observacionData.documento_id, "tipo:", typeof observacionData.documento_id);

      await createObservacion(observacionData);
      console.log("✅ Highlight guardado en BD");
      // Si es la primera observación (antes había 0), cambiar estado del documento a "revisado"
      const observacionesSinCorrecciones = highlights.filter(h => !h.isCorreccion);
      if (observacionesSinCorrecciones.length === 0) {
        console.log("📝 Primera observación detectada, cambiando estado del documento a 'revisado'");
        const resultado = await cambiarEstadoDocumento(infoProyecto.codigoDoc, 'revisado');
        if (resultado.success) {
          console.log("✅ Estado del documento cambiado a 'revisado'");
        } else {
          console.error("❌ Error al cambiar estado del documento:", resultado.error);
        }
      }
    } catch (error) {
      console.error("❌ Error al guardar el highlight en BD:", error);
      let errorMessage = "Error desconocido";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      alert(`Error al guardar: ${errorMessage}`);
    }
  }, [infoProyecto]);

  const updateHighlight = useCallback(
    (highlightId: string, position: Partial<ScaledPosition>, content: Partial<Content>) => {
      console.log("Updating highlight", highlightId, position, content);
      setHighlights((prevHighlights) =>
        prevHighlights.map((h) => {
          const { id, position: originalPosition, content: originalContent, ...rest } = h;
          return id === highlightId
            ? {
              id,
              position: { ...originalPosition, ...position },
              content: { ...originalContent, ...content },
              ...rest,
            }
            : h;
        })
      );
    },
    []
  );

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
      <Sidebar
        highlights={highlights.filter((h) => !h.isCorreccion)}
        observacionesOtrasVersiones={observacionesOtrasVersiones}
        resetHighlights={resetHighlights}
        onHighlightClick={handleHighlightClick}
        onObservationClick={onObservationClick}
        showApprovalForm={showApprovalForm}
        onApprove={handleApprove}
        onReject={handleReject}
      />
      <div className={styles.pdfViewerContent} style={{ position: 'relative' }}>
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
                enableAreaSelection={(event) => event.altKey}
                onScrollChange={() => { }}
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
    </div>
  );
}