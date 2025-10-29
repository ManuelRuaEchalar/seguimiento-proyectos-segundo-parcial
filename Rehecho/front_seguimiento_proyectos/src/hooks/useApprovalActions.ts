import { useCallback, useMemo } from 'react';

import type { IHighlight } from '@/components/documento/react-pdf-highlighter';

import { cambiarEstado } from '@/services/observaciones';

interface UseApprovalActionsProps {
  selectedObservation?: any;
  highlights: IHighlight[];
  infoProyecto: {
    codigoProyecto: number;
    codigoDoc: number;
  };
  onApprovalComplete?: () => void;
  onRejectionWithNewObservation?: (rejectedCorrection: any, nuevaObservacionAPI: any) => void;
  onActualizarEstadoObservacion?: (observacionId: number, nuevoEstado: string) => void;
  setHighlights: React.Dispatch<React.SetStateAction<IHighlight[]>>;
}

export const useApprovalActions = ({
  selectedObservation,
  highlights,
  infoProyecto,
  onApprovalComplete,
  onRejectionWithNewObservation,
  onActualizarEstadoObservacion,
  setHighlights
}: UseApprovalActionsProps) => {
  
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
      
      if (onActualizarEstadoObservacion) {
        onActualizarEstadoObservacion(Number(showApprovalForm.id), 'aprobado');
      }
      
      onApprovalComplete?.();
    } catch (error) {
      console.error('Error al aprobar:', error);
    }
  }, [showApprovalForm?.id, onApprovalComplete, onActualizarEstadoObservacion, setHighlights]);

  const handleReject = useCallback(async (commentText?: string) => {
    if (!showApprovalForm?.id) return;

    try {
      // 1. Cambia estado en la base de datos (ahora incluye comentario)
      const response = await cambiarEstado(
        Number(showApprovalForm.id), 
        'rechazado',
        commentText // ← Envía el comentario si existe
      );
      
      console.log('Observación rechazada, respuesta de la API:', response);
      
      // 2. Actualiza estado local del highlight rechazado
      setHighlights((prevHighlights) =>
        prevHighlights.map((h) =>
          h.id === showApprovalForm.id 
            ? { ...h, estado: 'rechazado' } 
            : h
        )
      );
      
      // 3. Notifica al componente padre
      if (onActualizarEstadoObservacion) {
        onActualizarEstadoObservacion(
          Number(showApprovalForm.id), 
          'rechazado'
        );
      }
      
      // 4. Si hay comentario y la API devolvió una nueva observación
      if (commentText && response) {
        const rejectedHighlight = highlights.find(
          h => h.id === showApprovalForm.id
        );
        
        if (rejectedHighlight && onRejectionWithNewObservation) {
          // Pasa tanto el highlight rechazado como la respuesta de la API
          await onRejectionWithNewObservation(rejectedHighlight, response);
        } else {
          // Si no hay callback, simplemente completa
          onApprovalComplete?.();
        }
      } else {
        onApprovalComplete?.();
      }
      
    } catch (error) {
      console.error('Error al rechazar:', error);
    }
  }, [
    showApprovalForm?.id, 
    highlights,
    onApprovalComplete, 
    onRejectionWithNewObservation, 
    onActualizarEstadoObservacion, 
    setHighlights
  ]);

  return {
    showApprovalForm,
    handleApprove,
    handleReject
  };
};