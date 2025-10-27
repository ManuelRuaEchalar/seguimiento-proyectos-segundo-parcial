'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchEstudianteInfo } from '@/services/estudiantes';
import Navbar from '@/components/general/Navbar';
import ControlGrupo from '@/components/general/ControlGrupo';
import ListaActividades from '@/components/general/ListaActividades';
import styles from './page.module.css';

type Fase = 'tema' | 'perfil' | 'proyecto';

export default function ProyectoPage() {
  const router = useRouter();
  const [estudianteInfo, setEstudianteInfo] = useState<any>(null);
  const [faseActual, setFaseActual] = useState<Fase>('perfil');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEstudianteInfo() {
      try {
        const data = await fetchEstudianteInfo();
        console.log('📊 Información del estudiante:', data);
        setEstudianteInfo(data);
      } catch (err: any) {
        console.error('❌ Error al cargar info del estudiante:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadEstudianteInfo();
  }, []);

  const handleActividadClick = (actividadId: number) => {
    if (!estudianteInfo?.grupo?.actividades) return;

    // Encontrar la actividad completa
    const actividadSeleccionada = estudianteInfo.grupo.actividades.find(
      (actividad: any) => actividad.id === actividadId
    );

    if (actividadSeleccionada) {
      // Guardar en localStorage
      localStorage.setItem('actividadActual', JSON.stringify(actividadSeleccionada));
    }

    router.push('/dashboard/estudiante/actividad');
  };

  const handleActividadActualizada = () => {
    // Recargar la información del estudiante
    loadEstudianteInfo();
  };

  async function loadEstudianteInfo() {
    try {
      const data = await fetchEstudianteInfo();
      setEstudianteInfo(data);
    } catch (err: any) {
      console.error('❌ Error al recargar info:', err.message);
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando información...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  if (!estudianteInfo) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>No se encontró información del estudiante</div>
      </div>
    );
  }

  const actividades = estudianteInfo.grupo?.actividades || [];

  return (
    <div className={styles.container}>
      <Navbar
        role="estudiante"
        estudianteInfo={{
          nombre: `${estudianteInfo.usuario.nombre} ${estudianteInfo.usuario.apellido}`,
          carrera: estudianteInfo.carrera,
          cu: estudianteInfo.cu,
          email: estudianteInfo.usuario.email,
        }}
      />

      <div className={styles.content}>
        <ControlGrupo
          nombreGrupo={estudianteInfo.grupo?.nombre || 'Sin grupo'}
          grado={estudianteInfo.grupo?.grado || 'grado1'}
          faseActual={faseActual}
          onFaseChange={setFaseActual}
        />

        {faseActual === 'perfil' && (
          <div className={styles.actividadesContainer}>
            {actividades.length > 0 ? (
              <ListaActividades
                rol="estudiante"
                estudianteId={estudianteInfo.usuario.id}
                proyectoId={estudianteInfo.proyecto.id}
                actividades={actividades}
                onActividadActualizada={handleActividadActualizada}
                onVerEntregas={handleActividadClick}
              />
            ) : (
              <div className={styles.noActividades}>
                No hay actividades disponibles
              </div>
            )}
          </div>
        )}

        {faseActual === 'tema' && (
          <div className={styles.faseNoImplementada}>
            <h3>Fase Tema</h3>
            <p>Esta fase aún no está implementada</p>
          </div>
        )}

        {faseActual === 'proyecto' && (
          <div className={styles.faseNoImplementada}>
            <h3>Fase Proyecto</h3>
            <p>Esta fase aún no está implementada</p>
          </div>
        )}
      </div>
    </div>
  );
}