import React, { useState, useEffect } from "react";
import { PdfLoader } from "./react-pdf-highlighter";
import { PdfHighlighterEstudiante } from "./react-pdf-highlighter/components/PdfHighlighterEstudiante";
import { Spinner } from "./Spinner";
import { usePageTracking } from "@/hooks/usePageTracking";
import styles from './style/VisualizadorPDFFinal.module.css';

interface VisualizadorPDFFinalProps {
  blob: Blob | null;
  contentType?: string;
}

export function VisualizadorPDFFinal({
  blob,
  contentType = 'application/pdf'
}: VisualizadorPDFFinalProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPdfReady, setIsPdfReady] = useState<boolean>(false);

  const { currentPage, totalPages, setTotalPages } = usePageTracking();

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
          Intentar de nuevo
        </button>
      </div>
    );
  }

return (
    <div className={styles.pdfViewerContainer}>
      <div className={styles.pdfViewerContent}>
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
            if (!isPdfReady) {
              const updatePages = () => {
                if (pdfDocument.numPages && totalPages !== pdfDocument.numPages) {
                  setTotalPages(pdfDocument.numPages);
                }
                setIsPdfReady(true);
              };

              setTimeout(updatePages, 0);
              return <Spinner />;
            }

            return (
              <PdfHighlighterEstudiante
                pdfDocument={pdfDocument}
                onScrollChange={() => {}}
                scrollRef={() => {}}
                highlightTransform={() => <></>}
                highlights={[]}
              />
            );
          }}
        </PdfLoader>
      </div>
    </div>
  );
}