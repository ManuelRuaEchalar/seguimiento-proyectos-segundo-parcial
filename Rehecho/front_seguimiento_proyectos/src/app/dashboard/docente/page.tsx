'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchDocenteInfo } from '@/services/docentes';
import { DocenteData } from '@/types/types';
import Home from '@/components/docente/Home';

export default function DocenteDashboardPage() {
  const router = useRouter();
  const [docenteData, setDocenteData] = useState<DocenteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const obtenerInfo = async () => {
      try {
        const data = await fetchDocenteInfo();
        if (isMounted) {
          setDocenteData(data);
          console.log('Información del docente:', data);
          
          // Guardar info del docente en localStorage
          const { grupos, ...docente } = data;
          localStorage.setItem('docenteActual', JSON.stringify(docente));
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message);
          console.error('Error al obtener info del docente:', err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    obtenerInfo();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <div className="p-4">Cargando...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!docenteData) return <div className="p-4">No se encontró información</div>;

  const { grupos, ...docente } = docenteData;

  return (
    <Home 
      docente={docente} 
      grupos={grupos}
      onBack={() => router.push('/dashboard')}
    />
  );
}