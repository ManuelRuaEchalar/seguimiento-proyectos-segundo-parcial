'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerDocumentosPorActividad } from '@/services/documentos';
import Navbar from '@/components/general/Navbar';
import ListaEntregas from '@/components/general/ListaEntregas';
import styles from './ActividadPage.module.css';

interface Documento {
  id: number;
  titulo: string;
  version: number;
  estado: string;
  justificacion: string | null;
  created_at: string;
  file: string;
  proyecto: {
    id: number;
    titulo: string;
    estudiantes: Array<{
      id: number;
      cu: string;
      carrera: string;
      usuario: {
        nombre: string;
        apellido: string;
        email: string;
      };
    }>;
  };
}

export default function ActividadPage() {
  const router = useRouter();
  const [actividad, setActividad] = useState<any>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Recuperar la actividad actual del localStorage
    const actividadStr = localStorage.getItem('actividadActual');
    console.log('🔍 actividadActual en localStorage:', actividadStr);

    if (!actividadStr) {
      console.warn('⚠️ No hay actividadActual en localStorage');
      router.push('/dashboard/docente');
      return;
    }

    try {
      const actividadData = JSON.parse(actividadStr);

      if (!actividadData?.id) {
        console.error('❌ La actividad guardada no tiene un ID válido:', actividadData);
        router.push('/dashboard/docente');
        return;
      }

      setActividad(actividadData);
      console.log('📘 Actividad actual:', actividadData);
      console.log(`Actividad es:${actividad}`);

      // Llamar a la API para obtener los documentos
      const fetchDocs = async () => {
        try {
          const docs = await obtenerDocumentosPorActividad(actividadData.id);
          console.log('📄 Documentos obtenidos:', docs);
          setDocumentos(docs);
          console.log(`Documentos son:${documentos}`);
        } catch (error) {
          console.error('❌ Error al obtener documentos:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchDocs();
    } catch (error) {
      console.error('❌ Error al parsear actividadActual:', error);
      router.push('/dashboard/docente');
    }
  }, [router]);

  const handleBack = () => {
    router.push('/dashboard/docente/grupo');
  };

  const handleCloseActivity = () => {
    localStorage.removeItem('actividadActual');
    router.push('/dashboard/docente');
  };

  if (!actividad) {
    return null;
  }

  const handleEntregaClick = (documentoId: number) => {
    // Encontrar el documento completo
    const documentoSeleccionado = documentos.find(doc => doc.id === documentoId);

    if (documentoSeleccionado) {
      // Guardar en localStorage
      localStorage.setItem('documentoActual', JSON.stringify(documentoSeleccionado));
      //redirigir a la página de revisión de entregas /documento
      router.push('/dashboard/docente/revision');
    }
  };

  // Preparar los datos para el Navbar
const actividadInfo = {
  nombre: actividad.nombre || 'Sin título',
  estado: actividad.estado || 'activo',
  fase: actividad.fase,
  fecha: actividad.fecha_creacion || new Date().toISOString(),
  tags: actividad.elementos || [], // Los elementos son como "tags" (Conclusiones, Bibliografía, etc.)
};

  return (
    <div className={styles.container}>
      <Navbar
        role="actividad_docente"
        onBack={handleBack}
        actividadInfo={actividadInfo}
        onCloseActivity={handleCloseActivity}
      />
      
      <main className={styles.main}>
        {loading ? (
          <div className={styles.loading}>Cargando entregas...</div>
        ) : (
          <ListaEntregas documentos={documentos}  fase={actividadInfo.fase} onRevisar={handleEntregaClick} />
        )}
      </main>
    </div>
  );
}