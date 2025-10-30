'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchEstudianteInfo } from '@/services/estudiantes';
import Navbar from '@/components/general/Navbar';
import ControlGrupo from '@/components/general/ControlGrupo';
import ListaActividades from '@/components/general/ListaActividades';
import Actividad from '@/components/general/Actividad';
import TrabajoFinal from '@/components/general/TrabajoFinal';
import styles from './page.module.css';
import ConfiguracionProyecto from '@/components/estudiante/ConfiguracionProyecto';

type Fase = 'tema' | 'perfil' | 'proyecto';

export default function ProyectoPage() {
  const router = useRouter();
  const [estudianteInfo, setEstudianteInfo] = useState<any>(null);
  const [faseActual, setFaseActual] = useState<Fase>('tema');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEstudianteInfo() {
      try {
        const data = await fetchEstudianteInfo();
        console.log('📊 Información del estudiante:', data);
        setEstudianteInfo(data);
        
        // Guardar en localStorage
        localStorage.setItem('estudianteInfo', JSON.stringify(data));
      } catch (err: any) {
        console.error('❌ Error al cargar info del estudiante:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadEstudianteInfo();
  }, []);

  useEffect(() => {
    if (estudianteInfo?.grupo?.fase) {
      setFaseActual(estudianteInfo.proyecto.fase_actual);
    }
  }, [estudianteInfo]);

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

  const handleFinalSubido = () => {
    // Recargar la información del estudiante después de subir el final
    loadEstudianteInfo();
  };

  async function loadEstudianteInfo() {
    try {
      const data = await fetchEstudianteInfo();
      setEstudianteInfo(data);
      
      // Guardar en localStorage
      localStorage.setItem('estudianteInfo', JSON.stringify(data));
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
  const grupo = estudianteInfo.grupo;
  const proyecto = estudianteInfo.proyecto;

  // Filtrar actividades por fase
  const actividadesPerfil = actividades.filter((act: any) => act.fase === 'perfil');
  const actividadesProyecto = actividades.filter((act: any) => act.fase === 'proyecto');
  const actividadTema = actividades.find((act: any) => act.fase === 'tema');
  console.log('actividadTema', actividadTema);  

  // Determinar si mostrar el componente de trabajo final
  const mostrarTrabajoFinal = grupo && 
    (!grupo.elementos || grupo.elementos.length === 0) && 
    (grupo.elementos_hechos && grupo.elementos_hechos.length > 0);

  const noTitle = estudianteInfo.proyecto.titulo === '' || estudianteInfo.proyecto.titulo === null;

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
          nombreGrupo={grupo?.nombre || 'Sin grupo'}
          grado={grupo?.grado || 'grado1'}
          faseActual={faseActual}
          onFaseChange={setFaseActual}
        />

        {faseActual === 'perfil' && (
          <div className={styles.actividadesContainer}>
            {mostrarTrabajoFinal && grupo.elementos_hechos && proyecto && (
              <TrabajoFinal
                elementos={grupo.elementos_hechos}
                grado={grupo.grado}
                fase={grupo.fase}
                rol="estudiante"
                proyectoId={estudianteInfo.proyecto.id}
                carrera={estudianteInfo.carrera}
                año={new Date().getFullYear()}
                onFinalSubido={handleFinalSubido}
              />
            )}

            {noTitle && (
              <ConfiguracionProyecto
                emisor_id={estudianteInfo.id}
                proyecto_emisor_id={estudianteInfo.proyecto.id}
              />
            )}
            {actividadesPerfil.length > 0 ? (
              <ListaActividades
                rol="estudiante"
                fase="perfil"
                estudianteId={estudianteInfo.usuario.id}
                proyectoId={proyecto?.id}
                actividades={actividadesPerfil}
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
          <div className={styles.temaContainer}>
            {actividadTema ? (
              <Actividad
                actividad={actividadTema}
                proyectoId={estudianteInfo.proyecto.id}
                rol="estudiante"
                fase="tema"
                onActividadActualizada={handleActividadActualizada}
                onVerEntregas={handleActividadClick}
              />
            ) : (
              <div className={styles.noActividad}>
                <p>No hay actividad de tema creada aún</p>
              </div>
            )}
          </div>
        )}

        {faseActual === 'proyecto' && (
          <div className={styles.proyectoContainer}>
            {actividadesProyecto.length > 0 ? (
              <ListaActividades
                rol="estudiante"
                fase="proyecto"
                estudianteId={estudianteInfo.usuario.id}
                proyectoId={proyecto?.id}
                actividades={actividadesProyecto}
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
      </div>
    </div>
  );
}