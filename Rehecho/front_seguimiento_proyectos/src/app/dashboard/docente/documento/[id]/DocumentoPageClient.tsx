// src/app/dashboard/docente/documento/[id]/DocumentoPageClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { usePendientes } from '@/contexts/PendientesContext';
import type { Pendiente as PendienteType } from '@/types/types';

interface DocumentoPageClientProps {
  documentoId: number;
  onDataLoaded: (data: PendienteType | null) => void;
}

export default function DocumentoPageClient({ documentoId, onDataLoaded }: DocumentoPageClientProps) {
  const { getPendiente } = usePendientes();

  useEffect(() => {
    // Intentar recuperar del caché
    const pendienteCache = getPendiente(documentoId);
    
    if (pendienteCache) {
      console.log('=== DATOS RECUPERADOS DEL CACHÉ ===');
      console.log('ID del documento:', pendienteCache.id);
      console.log('Título:', pendienteCache.titulo);
      console.log('Estado:', pendienteCache.estado);
      console.log('Nombre del estudiante:', pendienteCache.estudiante);
      console.log('Carrera:', pendienteCache.carrera);
      console.log('CU:', pendienteCache.cu);
      console.log('===================================');
      
      // Pasar los datos al componente padre
      onDataLoaded(pendienteCache);
    } else {
      console.log('No se encontró el pendiente en el caché, se debe obtener de la API');
      onDataLoaded(null);
    }
  }, [documentoId, getPendiente, onDataLoaded]);

  return null;
}