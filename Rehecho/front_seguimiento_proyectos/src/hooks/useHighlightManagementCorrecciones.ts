import { useState, useCallback, useRef, useEffect } from 'react';
import type { IHighlight, NewHighlight, ScaledPosition, Content } from '@/components/documento/react-pdf-highlighter';
import { createCorreccion } from "@/services/correcciones";
import { convertCorreccionToHighlight, getNextId } from '@/utils/highlightConverters';

interface UseHighlightManagementCorreccionesProps {
  correcciones: any[] | null;
}

export const useHighlightManagementCorrecciones = ({
  correcciones
}: UseHighlightManagementCorreccionesProps) => {
  const [highlights, setHighlights] = useState<Array<IHighlight>>([]);
  const loadedCorreccionesRef = useRef<string>("");
  const initializingRef = useRef<boolean>(false);

  // Cargar solo correcciones
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

  const addHighlight = useCallback(async (highlight: NewHighlight) => {
    console.log("Saving correction highlight", highlight);

    const newHighlight = { ...highlight, id: getNextId() };
    setHighlights((prevHighlights) => [newHighlight, ...prevHighlights]);

    console.log("Nueva corrección:", newHighlight);

    try {
      await createCorreccion(newHighlight);
      console.log("Corrección guardada en BD");
    } catch (error) {
      console.error("Error al guardar la corrección en BD:", error);
    }
  }, []);

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

  const resetHighlights = useCallback(() => {
    setHighlights([]);
    loadedCorreccionesRef.current = "";
    initializingRef.current = false;
  }, []);

  return {
    highlights,
    setHighlights,
    addHighlight,
    updateHighlight,
    resetHighlights
  };
};