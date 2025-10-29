import { useState, useRef, useEffect, useCallback } from 'react';
import type { IHighlight } from '@/components/documento/react-pdf-highlighter';

interface UseScrollToHighlightProps {
  selectedObservation?: any;
  highlights: IHighlight[];
  infoProyecto: {
    codigoProyecto: number;
    codigoDoc: number;
  };
}

export const useScrollToHighlight = ({
  selectedObservation,
  highlights,
  infoProyecto
}: UseScrollToHighlightProps) => {
  const [isPdfReady, setIsPdfReady] = useState<boolean>(false);
  const scrollToHighlightRef = useRef<((highlight: IHighlight) => void) | null>(null);

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

  const handleHighlightClick = useCallback((highlight: IHighlight) => {
    if (scrollToHighlightRef.current && isPdfReady) {
      console.log("Navegando al highlight:", highlight.id);
      scrollToHighlightRef.current(highlight);
    } else {
      console.warn("Función de scroll no disponible todavía o PDF no está listo");
    }
  }, [isPdfReady]);

  return {
    isPdfReady,
    setIsPdfReady,
    scrollToHighlightRef,
    handleHighlightClick
  };
};