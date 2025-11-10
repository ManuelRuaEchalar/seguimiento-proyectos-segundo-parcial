'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/general/Navbar';
import ControlGrupo from '@/components/general/ControlGrupo';
import SelectorFecha from '@/components/docente/SelectorFecha';
import FormularioActividad from '@/components/docente/FormularioActividad';
import FormularioFormatoDocumento from '@/components/docente/FormularioFormatoDocumento';
import ListaActividades from '@/components/general/ListaActividades';
import Actividad from '@/components/general/Actividad';
import TrabajoFinal from '@/components/general/TrabajoFinal';
import Solicitudes from '@/components/general/Solicitudes';
import ListaEstudiantes from '@/components/docente/ListaEstudiantes';
import { obtenerActividadesPorGrupo } from '@/services/actividades';
import { obtenerSolicitudesPendientesDocente } from '@/services/solicitudes';
import styles from './page.module.css';

type Fase = 'tema' | 'perfil' | 'proyecto';
type VistaGrupo = 'actividades' | 'estudiantes';

interface Grupo {
  id: number;
  nombre: string;
  grado: string;
  fase: Fase;
  elementos?: string[] | null;
  elementos_hechos?: string[] | null;
  fecha_inicio_tema?: string | null;
  fecha_fin_tema?: string | null;
  fecha_inicio_perfil?: string | null;
  fecha_fin_perfil?: string | null;
  fecha_inicio_proyecto?: string | null;
  fecha_fin_proyecto?: string | null;
}

interface DocenteInfo {
  nombre: string;
  email: string;
}

interface Actividad {
  id: number;
  nombre: string;
  elementos: string[];
  descripcion?: string;
  fecha_creacion: string;
  estado: string;
  grupo_id: number;
  fase: string;
  es_final: boolean;
}

interface SolicitudesData {
  enviadas: any[];
  recibidas: any[];
}

export default function GrupoPage() {
  const router = useRouter();
  const [docenteInfo, setDocenteInfo] = useState<DocenteInfo | null>(null);
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [actividadFinal, setActividadFinal] = useState<Actividad | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(true);
  const [faseActual, setFaseActual] = useState<Fase>('tema');
  const [cargando, setCargando] = useState(true);
  const [solicitudes, setSolicitudes] = useState<SolicitudesData>({ enviadas: [], recibidas: [] });
  const [vistaActual, setVistaActual] = useState<VistaGrupo>('actividades');

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (grupo) {
      setFaseActual(grupo.fase);
    }
  }, [grupo]);

  const cargarDatos = async () => {
    try {
      const grupoGuardado = localStorage.getItem('grupoActual');
      const docenteGuardado = localStorage.getItem('docenteActual');

      if (grupoGuardado) {
        const grupoData = JSON.parse(grupoGuardado);
        setGrupo(grupoData);

        const actividadesData = await obtenerActividadesPorGrupo(grupoData.id);
        console.log('Actividades cargadas:', actividadesData);
        
        // Buscar la actividad final
        const final = actividadesData.actividades.find((act: Actividad) => act.es_final === true);
        const actividadesRegulares = actividadesData.actividades.filter((act: Actividad) => act.es_final !== true);
        
        console.log('🎯 Actividad final encontrada:', final);
        console.log('📚 Actividades regulares:', actividadesRegulares);
        
        setActividadFinal(final || null);
        setActividades(actividadesRegulares);

        // Cargar solicitudes pendientes del docente para este grupo
        const solicitudesData = await obtenerSolicitudesPendientesDocente(grupoData.id);
        console.log('📋 Solicitudes del docente:', solicitudesData);
        setSolicitudes(solicitudesData);
      }

      if (docenteGuardado) {
        const docente = JSON.parse(docenteGuardado);
        setDocenteInfo({
          nombre: `${docente.usuario.nombre} ${docente.usuario.apellido}`,
          email: docente.usuario.email,
        });
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard/docente');
  };

  const toggleFormulario = () => {
    setMostrarFormulario(!mostrarFormulario);
  };

  const handleActividadCreada = (nuevaActividad: Actividad, grupoActualizado: Grupo) => {
  setActividades(prev => [nuevaActividad, ...prev]);
  setMostrarFormulario(false);
  
  // Actualizar el estado del grupo con los datos actualizados
  if (grupoActualizado) {
    setGrupo(grupoActualizado);
    // Actualizar también en localStorage
    localStorage.setItem('grupoActual', JSON.stringify(grupoActualizado));
    
    console.log('✅ Grupo actualizado después de crear actividad:', grupoActualizado);
  }
  
  // Recargar actividades para asegurar consistencia
  cargarDatos();
};

  const handleActividadClick = (actividadId: number) => {
    const actividadSeleccionada = actividades.find(actividad => actividad.id === actividadId);

    if (actividadSeleccionada) {
      localStorage.setItem('actividadActual', JSON.stringify(actividadSeleccionada));
    }

    router.push('/dashboard/docente/actividad');
  };

  const handleElementosGuardados = () => {
    // Recargar los datos del grupo desde el servidor
    cargarDatos();
  };

  const handleFechasGuardadas = () => {
    // Recargar los datos del grupo desde el servidor para actualizar las fechas
    cargarDatos();
  };

  const manejarSolicitudRespondida = async () => {
    // Recargar solicitudes después de responder
    if (grupo) {
      try {
        const solicitudesActualizadas = await obtenerSolicitudesPendientesDocente(grupo.id);
        setSolicitudes(solicitudesActualizadas);
      } catch (err: any) {
        console.error('❌ Error al recargar solicitudes:', err.message);
      }
    }
  };

  // Verificar si se necesitan fechas para la fase actual
  const necesitaFechas = () => {
    if (!grupo) return false;
    
    if (faseActual === 'tema') {
      return !grupo.fecha_inicio_tema || !grupo.fecha_fin_tema;
    } else if (faseActual === 'perfil') {
      return !grupo.fecha_inicio_perfil || !grupo.fecha_fin_perfil;
    } else if (faseActual === 'proyecto') {
      return !grupo.fecha_inicio_proyecto || !grupo.fecha_fin_proyecto;
    }
    
    return false;
  };

  // Filtrar actividades por fase
  const actividadesPerfil = actividades.filter(act => act.fase === 'perfil');
  const actividadesProyecto = actividades.filter(act => act.fase === 'proyecto');
  const actividadTema = actividades.find(act => act.fase === 'tema');

  if (cargando) {
    return <div className={styles.cargando}>Cargando...</div>;
  }

  // Determinar si mostrar formulario de formato de documento
  const mostrarFormatoDocumento = grupo && (!grupo.elementos || grupo.elementos.length === 0) && (!grupo.elementos_hechos || grupo.elementos_hechos.length === 0);
  
  // Determinar si mostrar el componente de trabajo final
  const mostrarTrabajoFinal = actividadFinal !== null;

  return (
    <>
      {docenteInfo && (
        <Navbar
          role="docente"
          docenteInfo={docenteInfo}
          onBack={handleBack}
        />
      )}
      <div className={styles.container}>
        <div className={styles.content}>
          <ControlGrupo
            nombreGrupo={grupo?.nombre || 'Sin grupo'}
            grado={grupo?.grado || 'grado1'}
            rol="docente"
            faseActual={faseActual}
            onFaseChange={setFaseActual}
            vistaActual={vistaActual}
            onVistaChange={setVistaActual}
          />

          {/* Vista de Estudiantes */}
          {vistaActual === 'estudiantes' && grupo && (
            <ListaEstudiantes grupoId={grupo.id} />
          )}

          {/* Vista de Actividades */}
          {vistaActual === 'actividades' && (
            <>
              {/* Mostrar selector de fechas si son necesarias */}
              {grupo && necesitaFechas() && (
                <SelectorFecha
                  grupoId={grupo.id}
                  fase={faseActual}
                  onFechasGuardadas={handleFechasGuardadas}
                />
              )}

              {faseActual === 'perfil' && (
                <div className={styles.contentWrapper}>
                  <div className={styles.mainContent}>
                    {mostrarFormatoDocumento ? (
                      <FormularioFormatoDocumento
                        grupoId={grupo!.id}
                        onElementosGuardados={handleElementosGuardados}
                      />
                    ) : (
                      <>
                        {!mostrarTrabajoFinal && (
                          <div className={styles.newActivityToggle}>
                            <button className={styles.newActivityBtn} onClick={toggleFormulario}>
                              {mostrarFormulario ? 'Cerrar Nueva Actividad' : 'Nueva Actividad'}
                            </button>
                            <button className={styles.newActivityPlusBtn} onClick={toggleFormulario}>
                              {mostrarFormulario ? '−' : '+'}
                            </button>
                          </div>
                        )}

                        <div className={`${styles.activitiesWrapper} ${!mostrarTrabajoFinal && mostrarFormulario ? styles.withForm : ''}`}>
                          {!mostrarTrabajoFinal && mostrarFormulario && grupo && grupo.elementos && (
                            <FormularioActividad
  grupoId={grupo.id}
  fase={grupo.grado === 'grado1' ? 'perfil' : grupo.grado === 'grado2' ? 'proyecto' : grupo.fase}
  elementosGrupo={grupo.elementos as string[] || []}
  onActividadCreada={handleActividadCreada}
/>
                          )}

                          {mostrarTrabajoFinal && actividadFinal && grupo && (
                            <TrabajoFinal
                              actividad={actividadFinal}
                              grado={grupo.grado}
                              rol="docente"
                              onActividadActualizada={cargarDatos}
                            />
                          )}

                          <ListaActividades
                            rol="docente"
                            fase="perfil"
                            actividades={actividadesPerfil}
                            onActividadActualizada={cargarDatos}
                            onVerEntregas={handleActividadClick}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className={styles.sidebar}>
                    <Solicitudes 
                      solicitudes={solicitudes} 
                      onSolicitudRespondida={manejarSolicitudRespondida}
                      rol="docente"
                    />
                  </div>
                </div>
              )}

              {faseActual === 'tema' && (
                <div className={styles.temaContainer}>
                  {actividadTema ? (
                    <Actividad
                      actividad={actividadTema}
                      rol="docente"
                      fase="tema"
                      onActividadActualizada={cargarDatos}
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
                <div className={styles.contentWrapper}>
                  <div className={styles.mainContent}>
                    {mostrarFormatoDocumento ? (
                      <FormularioFormatoDocumento
                        grupoId={grupo!.id}
                        onElementosGuardados={handleElementosGuardados}
                      />
                    ) : (
                      <>
                        {!mostrarTrabajoFinal && (
                          <div className={styles.newActivityToggle}>
                            <button className={styles.newActivityBtn} onClick={toggleFormulario}>
                              {mostrarFormulario ? 'Cerrar Nueva Actividad' : 'Nueva Actividad'}
                            </button>
                            <button className={styles.newActivityPlusBtn} onClick={toggleFormulario}>
                              {mostrarFormulario ? '−' : '+'}
                            </button>
                          </div>
                        )}

                        <div className={`${styles.activitiesWrapper} ${!mostrarTrabajoFinal && mostrarFormulario ? styles.withForm : ''}`}>
                          {!mostrarTrabajoFinal && mostrarFormulario && grupo && grupo.elementos && (
                            <FormularioActividad
  grupoId={grupo.id}
  fase={grupo.grado === 'grado1' ? 'perfil' : grupo.grado === 'grado2' ? 'proyecto' : grupo.fase}
  elementosGrupo={grupo.elementos as string[] || []}
  onActividadCreada={handleActividadCreada}
/>
                          )}

                          {mostrarTrabajoFinal && actividadFinal && grupo && (
                            <TrabajoFinal
                              actividad={actividadFinal}
                              grado={grupo.grado}
                              rol="docente"
                              onActividadActualizada={cargarDatos}
                            />
                          )}

                          <ListaActividades
                            rol="docente"
                            fase="proyecto"
                            actividades={actividadesProyecto}
                            onActividadActualizada={cargarDatos}
                            onVerEntregas={handleActividadClick}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className={styles.sidebar}>
                    <Solicitudes 
                      solicitudes={solicitudes} 
                      onSolicitudRespondida={manejarSolicitudRespondida}
                      rol="docente"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}