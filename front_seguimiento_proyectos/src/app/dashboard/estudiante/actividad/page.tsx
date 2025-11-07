'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/general/Navbar';
import ListaMisEntregas from '@/components/estudiante/ListaMisEntregas';
import FormularioEntrega from '@/components/estudiante/FormularioEntrega';
import HistorialObservaciones from '@/components/estudiante/HistorialObservaciones';
import { fetchStudentDocuments } from '@/services/estudiantes';
import styles from './ActividadPage.module.css';

interface Actividad {
  id: number;
  nombre: string;
  descripcion: string;
  fecha_creacion: string;
  estado: string;
  fase?: string;
  elementos?: string[];
  es_final?: boolean;
}

interface Observacion {
  id: number;
  content_text: string;
  comment_text: string | null;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  bounding_page: number;
  correccion_id?: number;
  observacion_id?: number;
}

interface Correccion {
  id: number;
  content_text: string;
  comment_text: string | null;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  bounding_page: number;
  observacion_id: number;
}

interface Documento {
  id: number;
  titulo: string;
  version: number;
  estado: string;
  created_at: string;
  file: string;
  justificacion?: string;
  motivo_rechazo?: string;
  es_final?: boolean;
  observaciones: Observacion[];
  correcciones: Correccion[];
}

export default function ActividadPage() {
  const router = useRouter();
  const [actividad, setActividad] = useState<Actividad | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [vistaActual, setVistaActual] = useState<'entregas' | 'observaciones'>('entregas');
  const [proyectoId, setProyectoId] = useState<number | null>(null);
  const [esFinal, setEsFinal] = useState(false);

  useEffect(() => {
    const actividadStr = localStorage.getItem('actividadActual');
    const estudianteInfo = localStorage.getItem('estudianteInfo');

    if (!actividadStr) {
      console.warn('⚠️ No hay actividadActual en localStorage');
      router.push('/dashboard/estudiante');
      return;
    }

    if (!estudianteInfo) {
      console.warn('⚠️ No hay estudianteInfo en localStorage');
      router.push('/dashboard/estudiante');
      return;
    }

    const estudianteData = JSON.parse(estudianteInfo);
    setProyectoId(estudianteData.proyecto_id || null);

    try {
      const actividadData = JSON.parse(actividadStr);

      if (!actividadData?.id) {
        console.error('❌ La actividad guardada no tiene un ID válido:', actividadData);
        router.push('/dashboard/estudiante');
        return;
      }

      setActividad(actividadData);
      console.log('📘 Actividad actual:', actividadData);

      const fetchDocs = async () => {
        try {
          const response = await fetchStudentDocuments(actividadData.id);
          console.log('📄 Documentos obtenidos:', response);

          // Si la respuesta indica que es final, usar finales; si no, usar documentos
          if (response.es_final && response.finales) {
            setDocumentos(response.finales.map((doc: any) => ({
              ...doc,
              observaciones: doc.observaciones || [],
              correcciones: doc.correcciones || []
            })));
            setEsFinal(true);
          } else {
            setDocumentos((response.documentos || []).map((doc: any) => ({
              ...doc,
              observaciones: doc.observaciones || [],
              correcciones: doc.correcciones || []
            })));
            setEsFinal(false);
          }
        } catch (error) {
          console.error('❌ Error al obtener documentos:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchDocs();
    } catch (error) {
      console.error('❌ Error al parsear actividadActual:', error);
      router.push('/dashboard/estudiante');
    }
  }, [router]);

  const handleBack = () => {
    router.push('/dashboard/estudiante');
  };

  const handleCloseActivity = () => {
    localStorage.removeItem('actividadActual');
    router.push('/dashboard/estudiante');
  };

  const handleActualizarEntregas = async () => {
    if (!actividad) return;

    try {
      const response = await fetchStudentDocuments(actividad.id);

      if (response.es_final && response.finales) {
        setDocumentos(response.finales.map((doc: any) => ({
          ...doc,
          observaciones: doc.observaciones || [],
          correcciones: doc.correcciones || []
        })));
      } else {
        setDocumentos((response.documentos || []).map((doc: any) => ({
          ...doc,
          observaciones: doc.observaciones || [],
          correcciones: doc.correcciones || []
        })));
      }
    } catch (error) {
      console.error('❌ Error al actualizar documentos:', error);
    }
  };

  const handleEntregaClick = (documentoId: number) => {
    // Encontrar el documento completo
    const documentoSeleccionado = documentos.find(doc => doc.id === documentoId);

    if (documentoSeleccionado) {
      // Guardar en localStorage
      localStorage.setItem('documentoActual', JSON.stringify(documentoSeleccionado));
      //redirigir a la página de revisión de entregas /documento
      router.push('/dashboard/estudiante/revision');
    }
  };

  if (!actividad) {
    return null;
  }

  const actividadInfo = {
    id: actividad.id,
    nombre: actividad.nombre || 'Sin título',
    estado: actividad.estado || 'activo',
    fecha: actividad.fecha_creacion || new Date().toISOString(),
    tags: actividad.elementos || [],
  };

  return (
    <div className={styles.container}>
      <Navbar
        role="actividad_estudiante"
        onBack={handleBack}
        actividadInfo={actividadInfo}
        onCloseActivity={handleCloseActivity}
      />

      <div className={styles.mainContent}>
        {/* Toggle Switch */}
        {actividad.fase !== 'tema' && (
          <div className={styles.toggleContainer}>
            <button
              className={`${styles.toggleOption} ${vistaActual === 'entregas' ? styles.active : ''}`}
              onClick={() => setVistaActual('entregas')}
            >
              Mis entregas
            </button>
            <button
              className={`${styles.toggleOption} ${vistaActual === 'observaciones' ? styles.active : ''}`}
              onClick={() => setVistaActual('observaciones')}
            >
              Historial observaciones
            </button>
          </div>
        )}

        {/* Content Layout */}
        {(vistaActual === 'entregas' || actividad.fase === 'tema') && (
          <div className={styles.contentLayout}>
            {/* Lista de Entregas */}
            <div className={styles.entregasContainer}>
              <h2 className={styles.sectionTitle}>Entregas de la actividad</h2>
              {loading ? (
                <p>Cargando entregas...</p>
              ) : (
                <ListaMisEntregas
                  documentos={documentos}
                  onRevisar={handleEntregaClick}
                  fase={actividad.fase}
                  esFinal={esFinal}
                />
              )}
            </div>

            {/* Formulario de Nueva Entrega - No mostrar para trabajos finales */}
            {!esFinal && (
              <FormularioEntrega
                actividadId={actividad.id}
                proyectoId={proyectoId}
                fase={actividad.fase}
                onEntregaExitosa={handleActualizarEntregas}
              />
            )}
          </div>
        )}

        {vistaActual === 'observaciones' && (
          <div className={styles.observacionesContainer}>
            <h2 className={styles.sectionTitle}>Historial de observaciones</h2>
            {loading ? (
              <p>Cargando historial...</p>
            ) : (
              <HistorialObservaciones documentos={documentos} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}