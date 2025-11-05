import { useState, useCallback, useRef, useEffect } from 'react';
import type { IHighlight, NewHighlight, ScaledPosition, Content } from '@/components/documento/react-pdf-highlighter';
import { Observacion } from '@/types';
import { createObservacion } from '@/services/observaciones';
import { cambiarEstadoDocumento } from '@/services/documentos';
import { 
  convertObservacionToHighlight, 
  convertCorreccionToHighlight, 
  getNextId 
} from '@/utils/highlightConverters';

interface UseHighlightManagementProps {
  observaciones: Observacion[] | null;
  correcciones: any[] | null;
  infoProyecto: {
    codigoProyecto: number;
    codigoDoc: number;
  };
}

export const useHighlightManagement = ({
  observaciones,
  correcciones,
  infoProyecto
}: UseHighlightManagementProps) => {
  const [highlights, setHighlights] = useState<Array<IHighlight>>([]);
  const loadedObservacionesRef = useRef<string>("");

  // Cargar observaciones y correcciones
  useEffect(() => {
    const textObservaciones = observaciones || [];
    const allCorrecciones = correcciones || [];
    const allItems = [...textObservaciones, ...allCorrecciones];

    const currentItemsId = allItems.length > 0
      ? `${allItems.length}-${allItems.map(item => item.id).join(',')}`
      : "empty";

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
      
      console.log("📝 Cambiando estado del documento a 'revisado'");
      const resultado = await cambiarEstadoDocumento(infoProyecto.codigoDoc, 'revisado');
      if (resultado.success) {
        console.log("✅ Estado del documento cambiado a 'revisado'");
      } else {
        console.error("❌ Error al cambiar estado del documento:", resultado.error);
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
  }, [infoProyecto, highlights]);

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
    loadedObservacionesRef.current = "";
  }, []);

  return {
    highlights,
    setHighlights,
    addHighlight,
    updateHighlight,
    resetHighlights
  };
};