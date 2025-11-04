// src/contexts/PendientesContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Pendiente as PendienteType } from '@/types/types';

interface PendientesContextType {
  pendientesCache: Map<number, PendienteType>;
  addPendiente: (pendiente: PendienteType) => void;
  getPendiente: (id: number) => PendienteType | undefined;
  clearCache: () => void;
  isHydrated: boolean;
}

const PendientesContext = createContext<PendientesContextType | undefined>(undefined);

const STORAGE_KEY = 'pendientes_cache';

export function PendientesProvider({ children }: { children: ReactNode }) {
  const [pendientesCache, setPendientesCache] = useState<Map<number, PendienteType>>(new Map());
  const [isHydrated, setIsHydrated] = useState(false);

  // Cargar datos desde localStorage al montar el componente
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        // Convertir el objeto de vuelta a Map
        const map = new Map<number, PendienteType>(
          Object.entries(parsed).map(([key, value]) => [
            Number(key),
            value as PendienteType
          ])
        );
        setPendientesCache(map);
        console.log('✅ Caché de pendientes cargado desde localStorage:', map.size, 'items');
      }
    } catch (error) {
      console.error('❌ Error al cargar caché de pendientes desde localStorage:', error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Guardar en localStorage cada vez que cambie el caché
  useEffect(() => {
    // No guardar hasta que se haya hidratado (evita sobrescribir con estado vacío inicial)
    if (!isHydrated) return;

    try {
      // Convertir Map a objeto para poder guardarlo en localStorage
      const obj = Object.fromEntries(pendientesCache);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
      console.log('💾 Caché guardado en localStorage:', pendientesCache.size, 'items');
    } catch (error) {
      console.error('❌ Error al guardar caché en localStorage:', error);
    }
  }, [pendientesCache, isHydrated]);

  const addPendiente = (pendiente: PendienteType) => {
    setPendientesCache(prev => {
      const newCache = new Map(prev);
      newCache.set(pendiente.id, pendiente);
      console.log('➕ Pendiente agregado al caché:', pendiente.id);
      return newCache;
    });
  };

  const getPendiente = (id: number): PendienteType | undefined => {
    const pendiente = pendientesCache.get(id);
    if (pendiente) {
      console.log('✅ Pendiente encontrado en caché:', id);
    } else {
      console.log('⚠️ Pendiente NO encontrado en caché:', id);
    }
    return pendiente;
  };

  const clearCache = () => {
    setPendientesCache(new Map());
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('🗑️ Caché limpiado completamente');
    } catch (error) {
      console.error('❌ Error al limpiar caché de localStorage:', error);
    }
  };

  return (
    <PendientesContext.Provider 
      value={{ 
        pendientesCache, 
        addPendiente, 
        getPendiente, 
        clearCache,
        isHydrated 
      }}
    >
      {children}
    </PendientesContext.Provider>
  );
}

export function usePendientes() {
  const context = useContext(PendientesContext);
  if (!context) {
    throw new Error('usePendientes debe usarse dentro de PendientesProvider');
  }
  return context;
}