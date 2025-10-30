'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/general/Navbar';
import ControlGrupo from '@/components/general/ControlGrupo';
import GroupInfo from '@/components/docente/GroupInfo';
import FormularioActividad from '@/components/docente/FormularioActividad';
import FormularioFormatoDocumento from '@/components/docente/FormularioFormatoDocumento';
import ListaActividades from '@/components/general/ListaActividades';
import Actividad from '@/components/general/Actividad';
import TrabajoFinal from '@/components/general/TrabajoFinal';
import { obtenerActividadesPorGrupo } from '@/services/actividades';
import styles from './page.module.css';

type Fase = 'tema' | 'perfil' | 'proyecto';

interface Grupo {
  id: number;
  nombre: string;
  grado: string;
  fase: Fase;
  elementos?: string[] | null;
  elementos_hechos?: string[] | null;
}

interface DocenteInfo {
  nombre: string;
  email: string;
}

interface Actividad {
  id: number;
  nombre: string;
  estado: string;
  fecha: string;
  elementos: string[];
  descripcion?: string;
  fase: Fase;
}

export default function GrupoPage() {
  const router = useRouter();
  const [docenteInfo, setDocenteInfo] = useState<DocenteInfo | null>(null);
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(true);
  const [faseActual, setFaseActual] = useState<Fase>('tema');
  const [cargando, setCargando] = useState(true);

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
        setActividades(actividadesData.actividades);
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

  const handleActividadCreada = (nuevaActividad: Actividad) => {
    setActividades(prev => [nuevaActividad, ...prev]);
    setMostrarFormulario(false);
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
  const mostrarTrabajoFinal = grupo && 
    (!grupo.elementos || grupo.elementos.length === 0) && 
    (grupo.elementos_hechos && grupo.elementos_hechos.length > 0);

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
            faseActual={faseActual}
            onFaseChange={setFaseActual}
          />

          {faseActual === 'perfil' && (
            <>
              {mostrarFormatoDocumento ? (
                // Mostrar formulario de formato de documento si no hay elementos
                <FormularioFormatoDocumento
                  grupoId={grupo!.id}
                  onElementosGuardados={handleElementosGuardados}
                />
              ) : (
                // Mostrar interfaz normal o trabajo final
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
                        fase={grupo.fase}
                        elementosGrupo={grupo.elementos}
                        onActividadCreada={handleActividadCreada}
                      />
                    )}

                    {mostrarTrabajoFinal && grupo.elementos_hechos && (
                      <TrabajoFinal
                        elementos={grupo.elementos_hechos}
                        grado={grupo.grado}
                        fase={grupo.fase}
                        rol="docente"
                        onFinalSubido={cargarDatos}
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
            </>
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
            <div className={styles.proyectoContainer}>
              <ListaActividades
                rol="docente"
                fase="proyecto"
                actividades={actividadesProyecto}
                onActividadActualizada={cargarDatos}
                onVerEntregas={handleActividadClick}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}