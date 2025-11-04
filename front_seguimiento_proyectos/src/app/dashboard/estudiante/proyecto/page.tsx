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
import GruposProyecto from '@/components/estudiante/GruposProyecto';
import { obtenerSolicitudesPorEstudiante } from '@/services/solicitudes';
import Solicitudes from '@/components/general/Solicitudes';

type Fase = 'tema' | 'perfil' | 'proyecto';

interface SolicitudesData {
  enviadas: any[];
  recibidas: any[];
}

export default function ProyectoPage() {
  const router = useRouter();
  const [estudianteInfo, setEstudianteInfo] = useState<any>(null);
  const [faseActual, setFaseActual] = useState<Fase>('tema');
  const [loading, setLoading] = useState(true);
  const [solicitudes, setSolicitudes] = useState<SolicitudesData>({ enviadas: [], recibidas: [] });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEstudianteInfo();
  }, []);

  useEffect(() => {
    if (estudianteInfo?.proyecto?.fase_actual) {
      setFaseActual(estudianteInfo.proyecto.fase_actual);
    }
  }, [estudianteInfo]);

  async function loadEstudianteInfo() {
    try {
      setLoading(true);
      const data = await fetchEstudianteInfo();
      console.log('📊 Información del estudiante:', data);
      setEstudianteInfo(data);

      const solicitudesData = await obtenerSolicitudesPorEstudiante(data.id);
      console.log('📋 Solicitudes del estudiante:', solicitudesData);
      setSolicitudes(solicitudesData);
      
      localStorage.setItem('estudianteInfo', JSON.stringify(data));
    } catch (err: any) {
      console.error('❌ Error al cargar info del estudiante:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleActividadClick = (actividadId: number) => {
    if (!estudianteInfo?.grupo?.actividades && !estudianteInfo?.grupo_dos?.actividades) return;

    // Buscar en ambos grupos
    const actividades = [
      ...(estudianteInfo.grupo?.actividades || []),
      ...(estudianteInfo.grupo_dos?.actividades || [])
    ];

    const actividadSeleccionada = actividades.find(
      (actividad: any) => actividad.id === actividadId
    );

    if (actividadSeleccionada) {
      localStorage.setItem('actividadActual', JSON.stringify(actividadSeleccionada));
    }

    router.push('/dashboard/estudiante/actividad');
  };

  const handleActividadActualizada = () => {
    loadEstudianteInfo();
  };

  const handleFinalSubido = () => {
    loadEstudianteInfo();
  };

  const manejarSolicitudRespondida = async () => {
    try {
      const solicitudesActualizadas = await obtenerSolicitudesPorEstudiante(estudianteInfo.id);
      setSolicitudes(solicitudesActualizadas);
    } catch (err: any) {
      console.error('❌ Error al recargar solicitudes:', err.message);
    }
  };

  const handleGrupoUnido = () => {
    // Recargar información después de unirse a un grupo
    loadEstudianteInfo();
  };

  const tieneAccesoAFase = (fase: Fase): boolean => {
    if (!estudianteInfo?.proyecto?.fase_actual) return false;
    
    const fasesOrden: Fase[] = ['tema', 'perfil', 'proyecto'];
    const faseProyectoIndex = fasesOrden.indexOf(estudianteInfo.proyecto.fase_actual);
    const faseRequeridaIndex = fasesOrden.indexOf(fase);
    
    return faseRequeridaIndex <= faseProyectoIndex;
  };

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

  // Datos del grupo principal (grado1)
  const actividades = estudianteInfo.grupo?.actividades || [];
  const grupo = estudianteInfo.grupo;
  const proyecto = estudianteInfo.proyecto;

  // Datos del grupo secundario (grado2) para fase proyecto
  const actividadesGrupoDos = estudianteInfo.grupo_dos?.actividades || [];
  const grupoDos = estudianteInfo.grupo_dos;

  console.log('Actividades del grupo:', actividades);
  console.log('Actividades del grupo dos:', actividadesGrupoDos);

  // Actividad final del grupo principal
  const actividadFinal = actividades.find((act: any) => act.es_final === true && act.estado === 'activo');
  console.log('actividadFinal perfil:', actividadFinal);

  // Actividad final del grupo secundario (para proyecto)
  const actividadFinalProyecto = actividadesGrupoDos.find((act: any) => act.es_final === true && act.estado === 'activo');
  console.log('actividadFinal proyecto:', actividadFinalProyecto);

  const actividadesRegulares = actividades.filter((act: any) => act.es_final !== true);

  // Filtrar actividades por fase
  const actividadesPerfil = actividadesRegulares.filter((act: any) => act.fase === 'perfil');
  const actividadTema = actividadesRegulares.find((act: any) => act.fase === 'tema');
  
  // Actividades de proyecto desde grupo_dos
  const actividadesProyecto = actividadesGrupoDos.filter((act: any) => act.es_final !== true);
  console.log('actividadesProyecto:', actividadesProyecto);

  // Determinar si mostrar el componente de trabajo final
  const mostrarTrabajoFinalPerfil = actividadFinal !== undefined;
  const mostrarTrabajoFinalProyecto = actividadFinalProyecto !== undefined;

  const noTitle = estudianteInfo.proyecto.titulo === '' || estudianteInfo.proyecto.titulo === null;

  // Verificar si tiene grupo para la fase proyecto
  const tieneGrupoProyecto = estudianteInfo.grupo_dos_id !== null;

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
        atras={false}
      />

      <div className={styles.content}>
        <ControlGrupo
          nombreGrupo={grupo?.nombre || 'Sin grupo'}
          grado={grupo?.grado || 'grado1'}
          rol="estudiante"
          faseActual={faseActual}
          onFaseChange={setFaseActual}
        />

        {faseActual === 'perfil' && (
          <div className={styles.layoutContainer}>
            {!tieneAccesoAFase('perfil') ? (
              <>
                <div className={styles.mainContent}>
                  <div className={styles.faseNoDisponible}>
                    <p>Para trabajar en tu perfil debes tener al menos un tema aprobado</p>
                  </div>
                </div>
                <div className={styles.sidebar}>
                  <Solicitudes 
                    solicitudes={solicitudes} 
                    onSolicitudRespondida={manejarSolicitudRespondida}
                  />
                </div>
              </>
            ) : (
              <>
                <div className={styles.mainContent}>
                  {mostrarTrabajoFinalPerfil && actividadFinal && proyecto && (
                    <TrabajoFinal
                      actividad={actividadFinal}
                      grado={grupo.grado}
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
                <div className={styles.sidebar}>
                  <Solicitudes 
                    solicitudes={solicitudes} 
                    onSolicitudRespondida={manejarSolicitudRespondida}
                  />
                </div>
              </>
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
          <div className={styles.layoutContainer}>
            {!tieneAccesoAFase('proyecto') ? (
              <>
                <div className={styles.mainContent}>
                  <div className={styles.faseNoDisponible}>
                    <p>Para trabajar en tu proyecto debes tener el perfil del mismo aprobado</p>
                  </div>
                </div>
              </>
            ) : !tieneGrupoProyecto ? (
              <>
                <div className={styles.mainContent}>
                  <GruposProyecto onGrupoUnido={handleGrupoUnido} />
                </div>
              </>
            ) : (
              <>
                <div className={styles.mainContent}>
                  {mostrarTrabajoFinalProyecto && actividadFinalProyecto && proyecto && (
                    <TrabajoFinal
                      actividad={actividadFinalProyecto}
                      grado={grupoDos.grado}
                      rol="estudiante"
                      proyectoId={estudianteInfo.proyecto.id}
                      carrera={estudianteInfo.carrera}
                      año={new Date().getFullYear()}
                      onFinalSubido={handleFinalSubido}
                    />
                  )}

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
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}