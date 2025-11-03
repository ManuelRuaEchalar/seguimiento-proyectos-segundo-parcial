'use client';

import { useState, useEffect } from 'react';
import styles from './styles/ConfiguracionProyecto.module.css';
import { crearSolicitud } from '@/services/solicitudes';
import { actualizarTituloProyecto, getConfiguracionProyecto } from '@/services/estudiantes';

interface Tema {
  id: number;
  titulo: string;
}

interface EstudianteProyecto {
  id: number;
  nombre: string;
}

interface Proyecto {
  id: number;
  titulo: string;
  estudiantes: EstudianteProyecto[];
}

interface Estudiante {
  id: number;
  nombre: string;
}

interface ConfigData {
  temas: Tema[];
  proyectos: Proyecto[];
  estudiantes: Estudiante[];
}

interface ConfiguracionProyectoProps {
  emisor_id: number;
  proyecto_emisor_id: number;
}

type Modo = 'individual' | 'equipo' | null;
type EquipoAccion = 'unirse' | 'invitar' | null;

export default function ConfiguracionProyecto({
  emisor_id,
  proyecto_emisor_id,
}: ConfiguracionProyectoProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [configData, setConfigData] = useState<ConfigData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState('');

  const [modo, setModo] = useState<Modo>(null);
  const [equipoAccion, setEquipoAccion] = useState<EquipoAccion>(null);
  const [temaSeleccionado, setTemaSeleccionado] = useState<Tema | null>(null);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<Proyecto | null>(null);
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState<Estudiante[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  // Cargar datos al montar el componente
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoadingData(true);
        const data = await getConfiguracionProyecto();
        setConfigData({
          temas: data.temas,
          proyectos: data.proyectos,
          estudiantes: data.estudiantes,
        });
        setDataError('');

        console.log('✅ Configuración cargada:', data);
      } catch (err) {
        console.error('Error al cargar configuración:', err);
        setDataError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchData();
  }, []);

  const handleModoChange = (nuevoModo: Modo) => {
    setModo(nuevoModo);
    setEquipoAccion(null);
    setTemaSeleccionado(null);
    setProyectoSeleccionado(null);
    setEstudiantesSeleccionados([]);
    setMensaje('');
    setError('');
  };

  const handleEquipoAccionChange = (accion: EquipoAccion) => {
    setEquipoAccion(accion);
    setTemaSeleccionado(null);
    setProyectoSeleccionado(null);
    setEstudiantesSeleccionados([]);
    setMensaje('');
    setError('');
  };

  const handleEstudianteToggle = (estudiante: Estudiante) => {
    if (estudiantesSeleccionados.find(e => e.id === estudiante.id)) {
      setEstudiantesSeleccionados(estudiantesSeleccionados.filter(e => e.id !== estudiante.id));
    } else if (estudiantesSeleccionados.length < 2) {
      setEstudiantesSeleccionados([...estudiantesSeleccionados, estudiante]);
    }
  };

  const isFormValid = () => {
    if (modo === 'individual' && temaSeleccionado) return true;
    if (modo === 'equipo' && equipoAccion === 'unirse' && proyectoSeleccionado) return true;
    if (modo === 'equipo' && equipoAccion === 'invitar' && temaSeleccionado && estudiantesSeleccionados.length > 0) return true;
    return false;
  };

  const handleConfirmar = async () => {
    setIsLoading(true);
    setError('');
    setMensaje('');

    try {
  if (modo === 'individual') {
    // Guardar el título del tema en el proyecto del estudiante
    if (temaSeleccionado) {
      await actualizarTituloProyecto(proyecto_emisor_id, temaSeleccionado.titulo);
    }
    setMensaje(`Proyecto individual configurado: "${temaSeleccionado?.titulo}"`);
    
    // Refrescar la página después de configurar
    setTimeout(() => {
      window.location.reload();
    }, 1500);
    
  } else if (equipoAccion === 'unirse' && proyectoSeleccionado) {
    // Enviar solicitud de unirse
    await crearSolicitud({
      tipo: 'unirse',
      proyecto_id: proyectoSeleccionado.id,
      emisor_id: emisor_id,
      receptor_id: proyectoSeleccionado.estudiantes[0].id,
    });
    setMensaje(`Solicitud enviada para unirte a: "${proyectoSeleccionado.titulo}"`);
    
    // Refrescar la página después de enviar solicitud
    setTimeout(() => {
      window.location.reload();
    }, 1500);
    
  } else if (equipoAccion === 'invitar' && temaSeleccionado) {
    // Guardar el título del tema en el proyecto del estudiante
    await actualizarTituloProyecto(proyecto_emisor_id, temaSeleccionado.titulo);
    
    // Enviar solicitudes de invitación a cada estudiante seleccionado
    for (const estudiante of estudiantesSeleccionados) {
      await crearSolicitud({
        tipo: 'invitar',
        proyecto_id: proyecto_emisor_id,
        emisor_id: emisor_id,
        receptor_id: estudiante.id,
      });
    }
    setMensaje(
      `Invitaciones enviadas a: ${estudiantesSeleccionados.map(e => e.nombre).join(', ')} - Tema: "${temaSeleccionado.titulo}"`
    );
    
    // Refrescar la página después de enviar invitaciones
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }
} catch (err) {
  console.error('Error al confirmar:', err);
  setError(err instanceof Error ? err.message : 'Error al procesar la solicitud');
  // ❌ NO refrescar aquí porque hubo un error
} finally {
  setIsLoading(false);
}
  };

  // Mostrar estado de carga inicial
  if (isLoadingData) {
    return (
      <div className={styles.configForm}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Cargando configuración...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si no se pudieron cargar los datos
  if (dataError || !configData) {
    return (
      <div className={styles.configForm}>
        <div className={`${styles.alert} ${styles.alertError}`}>
          {dataError || 'Error al cargar los datos de configuración'}
        </div>
      </div>
    );
  }

  const { temas, proyectos, estudiantes } = configData;

  // Si no está expandido, mostrar solo el botón
  if (!isExpanded) {
    return (
      <div className={styles.configForm} style={{ textAlign: 'center' }}>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => setIsExpanded(true)}
        >
          Configurar Proyecto
        </button>
      </div>
    );
  }

  return (
    <div className={styles.configForm}>
      <h2 className={styles.formTitle}>Configuración del Proyecto</h2>
      <p className={styles.formSubtitle}>Define cómo deseas trabajar en tu proyecto de grado</p>

      <div className={styles.flowContainer}>
        {/* Paso 1: Modo */}
        <div className={`${styles.flowStep} ${styles.visible}`}>
          <p className={styles.stepQuestion}>¿Individual o en equipo?</p>
          <div className={styles.optionGroup}>
            <div
              className={`${styles.optionCard} ${modo === 'individual' ? styles.selected : ''}`}
              onClick={() => handleModoChange('individual')}
            >
              Individual
            </div>
            <div
              className={`${styles.optionCard} ${modo === 'equipo' ? styles.selected : ''}`}
              onClick={() => handleModoChange('equipo')}
            >
              En equipo
            </div>
          </div>
        </div>

        {/* Individual: Tema */}
        {modo === 'individual' && (
          <div className={`${styles.flowStep} ${styles.visible}`}>
            <p className={styles.stepQuestion}>Selecciona el tema:</p>
            {temas.length > 0 ? (
              <div className={styles.themeList}>
                {temas.map(tema => (
                  <div
                    key={tema.id}
                    className={`${styles.themeItem} ${temaSeleccionado?.id === tema.id ? styles.selected : ''}`}
                    onClick={() => setTemaSeleccionado(tema)}
                  >
                    <div className={styles.themeItemTitle}>{tema.titulo}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyMessage}>No hay temas disponibles</p>
            )}
          </div>
        )}

        {/* Equipo: Acción */}
        {modo === 'equipo' && (
          <div className={`${styles.flowStep} ${styles.visible}`}>
            <p className={styles.stepQuestion}>¿Unirte o invitar?</p>
            <div className={styles.optionGroup}>
              <div
                className={`${styles.optionCard} ${equipoAccion === 'unirse' ? styles.selected : ''}`}
                onClick={() => handleEquipoAccionChange('unirse')}
              >
                Unirme
              </div>
              <div
                className={`${styles.optionCard} ${equipoAccion === 'invitar' ? styles.selected : ''}`}
                onClick={() => handleEquipoAccionChange('invitar')}
              >
                Invitar
              </div>
            </div>
          </div>
        )}

        {/* Unirse: Proyecto */}
        {modo === 'equipo' && equipoAccion === 'unirse' && (
          <div className={`${styles.flowStep} ${styles.visible}`}>
            <p className={styles.stepQuestion}>Proyecto al que unirte:</p>
            {proyectos.length > 0 ? (
              <div className={styles.projectList}>
                {proyectos.map(proyecto => (
                  <div
                    key={proyecto.id}
                    className={`${styles.projectItem} ${proyectoSeleccionado?.id === proyecto.id ? styles.selected : ''}`}
                    onClick={() => setProyectoSeleccionado(proyecto)}
                  >
                    <div className={styles.projectItemTitle}>{proyecto.titulo}</div>
                    <div className={styles.studentCount}>
                      {proyecto.estudiantes.map(e => e.nombre).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyMessage}>No hay proyectos disponibles</p>
            )}
          </div>
        )}

        {/* Invitar: Tema */}
        {modo === 'equipo' && equipoAccion === 'invitar' && (
          <div className={`${styles.flowStep} ${styles.visible}`}>
            <p className={styles.stepQuestion}>Tema del proyecto:</p>
            {temas.length > 0 ? (
              <div className={styles.themeList}>
                {temas.map(tema => (
                  <div
                    key={tema.id}
                    className={`${styles.themeItem} ${temaSeleccionado?.id === tema.id ? styles.selected : ''}`}
                    onClick={() => setTemaSeleccionado(tema)}
                  >
                    <div className={styles.themeItemTitle}>{tema.titulo}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyMessage}>No hay temas disponibles</p>
            )}
          </div>
        )}

        {/* Invitar: Estudiantes */}
        {modo === 'equipo' && equipoAccion === 'invitar' && temaSeleccionado && (
          <div className={`${styles.flowStep} ${styles.visible}`}>
            <p className={styles.stepQuestion}>
              Selecciona hasta <strong>2 compañeros</strong>:
            </p>
            {estudiantes.length > 0 ? (
              <>
                <div className={styles.studentList}>
                  {estudiantes.map(estudiante => (
                    <div
                      key={estudiante.id}
                      className={`${styles.studentItem} ${estudiantesSeleccionados.find(e => e.id === estudiante.id) ? styles.selected : ''
                        }`}
                      onClick={() => handleEstudianteToggle(estudiante)}
                    >
                      {estudiante.nombre}
                    </div>
                  ))}
                </div>
                <div className={styles.selectedCount}>
                  {estudiantesSeleccionados.length}/2 seleccionados
                </div>
              </>
            ) : (
              <p className={styles.emptyMessage}>No hay estudiantes disponibles</p>
            )}
          </div>
        )}
      </div>

      <div className={styles.finalActions}>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={handleConfirmar}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? 'Procesando...' : 'Confirmar Configuración'}
        </button>

        {mensaje && (
          <div className={`${styles.alert} ${styles.alertSuccess}`}>
            ¡Éxito! {mensaje}
          </div>
        )}

        {error && (
          <div className={`${styles.alert} ${styles.alertError}`}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}