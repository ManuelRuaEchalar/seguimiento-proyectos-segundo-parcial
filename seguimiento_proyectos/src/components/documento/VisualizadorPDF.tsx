import React, { useState, useEffect, useCallback, useRef } from "react";

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
}

const getNextId = () => String(Math.random()).slice(2);

const parseIdFromHash = () =>
  document.location.hash.slice("#highlight-".length);

const resetHash = () => {
  document.location.hash = "";
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

export function VisualizadorPDF({ blob }: VisualizadorPDFProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<Array<IHighlight>>([]);
  const [error, setError] = useState<string | null>(null);

  // Crear URL del blob cuando cambie
  useEffect(() => {
    if (blob) {
      const objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);

      // Limpiar la URL cuando el componente se desmonte o el blob cambie
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else {
      setUrl(null);
    }
  }, [blob]);

  const resetHighlights = () => {
    setHighlights([]);
  };

  const scrollViewerTo = useRef<(highlight: IHighlight) => void>((highlight: IHighlight) => {});

  const scrollToHighlightFromHash = useCallback(() => {
    try {
      const highlight = getHighlightById(parseIdFromHash());
      if (highlight) {
        scrollViewerTo.current(highlight);
      }
    } catch (err) {
      console.warn("Error scrolling to highlight:", err);
    }
  }, [highlights]);

  useEffect(() => {
    const handleHashChange = () => {
      try {
        scrollToHighlightFromHash();
      } catch (err) {
        console.warn("Error handling hash change:", err);
      }
    };

    window.addEventListener("hashchange", handleHashChange, false);
    
    return () => {
      window.removeEventListener("hashchange", handleHashChange, false);
    };
  }, [scrollToHighlightFromHash]);

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

  const getHighlightById = (id: string) => {
    return highlights.find((highlight) => highlight.id === id);
  };

  const addHighlight = (highlight: NewHighlight) => {
    console.log("Saving highlight", highlight);
    setHighlights((prevHighlights) => [
      { ...highlight, id: getNextId() },
      ...prevHighlights,
    ]);
  };

  const updateHighlight = (
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
  };

  // Si no hay blob, mostrar mensaje de espera
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
      />
      <div className="pdf-viewer-content">
        <PdfLoader 
          url={url} 
          beforeLoad={<Spinner />}
          onError={(error) => {
            console.error("PDF loading error:", error);
            setError("Failed to load PDF. Please check if the file exists.");
          }}
        >
          {(pdfDocument) => (
            <PdfHighlighter
              pdfDocument={pdfDocument}
              enableAreaSelection={(event) => event.altKey}
              onScrollChange={resetHash}
              scrollRef={(scrollTo) => {
                scrollViewerTo.current = scrollTo;
                scrollToHighlightFromHash();
              }}
              onSelectionFinished={(
                position,
                content,
                hideTipAndSelection,
                transformSelection,
              ) => (
                <Tip
                  onOpen={transformSelection}
                  onConfirm={(comment) => {
                    addHighlight({ content, position, comment });
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
                isScrolledTo,
              ) => {
                const isTextHighlight = !highlight.content?.image;

                const component = isTextHighlight ? (
                  <Highlight
                    isScrolledTo={isScrolledTo}
                    position={highlight.position}
                    comment={highlight.comment}
                  />
                ) : (
                  <AreaHighlight
                    isScrolledTo={isScrolledTo}
                    highlight={highlight}
                    onChange={(boundingRect) => {
                      updateHighlight(
                        highlight.id,
                        { boundingRect: viewportToScaled(boundingRect) },
                        { image: screenshot(boundingRect) },
                      );
                    }}
                  />
                );

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
              highlights={highlights}
            />
          )}
        </PdfLoader>
      </div>
    </div>
  );
}