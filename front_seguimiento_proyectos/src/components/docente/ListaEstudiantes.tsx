'use client';

import { useEffect, useState, useMemo } from 'react';
import { obtenerEstudiantesDeGrupo } from '@/services/grupos';
import Proyecto from './Proyecto';
import ProyectoModal from '@/components/docente/ProyectoModal'; // ← NUEVO IMPORT
import styles from './styles/ListaEstudiantes.module.css';

interface Estudiante {
  id: number;
  nombre_completo: string;
  carrera: string;
  cu: string;
  correo: string;
  proyecto_id: number | null;
  titulo_proyecto: string | null;
}

interface ListaEstudiantesProps {
  grupoId: number;
}

// Genera colores pastel aleatorios
const generarColorPastel = () => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 60 + Math.random() * 20; // 60-80%
  const lightness = 85 + Math.random() * 10; // 85-95%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Genera un color de borde más saturado basado en el color de fondo
const generarColorBorde = (colorFondo: string) => {
  const match = colorFondo.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/);
  if (match) {
    const hue = match[1];
    const saturation = parseFloat(match[2]);
    const lightness = parseFloat(match[3]);
    return `hsl(${hue}, ${Math.min(saturation + 20, 100)}%, ${Math.max(lightness - 40, 30)}%)`;
  }
  return '#3b82f6';
};

export default function ListaEstudiantes({ grupoId }: ListaEstudiantesProps) {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ordenAlfabetico, setOrdenAlfabetico] = useState(false);
  const [coloresProyectos, setColoresProyectos] = useState<Record<number, { fondo: string; borde: string }>>({});
  const [modalAbierto, setModalAbierto] = useState<{ proyectoId: number; grupoId: number } | null>(null); // ← NUEVO ESTADO

  useEffect(() => {
    const cargarEstudiantes = async () => {
      try {
        setLoading(true);
        const data = await obtenerEstudiantesDeGrupo(grupoId);
        setEstudiantes(data);

        // Generar colores para cada proyecto único
        const proyectosUnicos = [...new Set(data.filter((e: Estudiante) => e.proyecto_id).map((e: Estudiante) => e.proyecto_id))] as (number | null)[];
        const colores: Record<number, { fondo: string; borde: string }> = {};
        
        proyectosUnicos.forEach((proyectoId) => {
          if (proyectoId !== null) {
            const colorFondo = generarColorPastel();
            colores[proyectoId] = {
              fondo: colorFondo,
              borde: generarColorBorde(colorFondo)
            };
          }
        });
        
        setColoresProyectos(colores);
        setError(null);
      } catch (err) {
        setError('Error al cargar los estudiantes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    cargarEstudiantes();
  }, [grupoId]);

  const estudiantesOrdenados = useMemo(() => {
    if (ordenAlfabetico) {
      return [...estudiantes].sort((a, b) => 
        a.nombre_completo.localeCompare(b.nombre_completo, 'es')
      );
    }
    return estudiantes;
  }, [estudiantes, ordenAlfabetico]);

  // Agrupar estudiantes por proyecto para mostrar información de compañeros
  const obtenerCompañeros = (estudiante: Estudiante) => {
    if (!estudiante.proyecto_id) return [];
    return estudiantesOrdenados
      .filter(e => e.proyecto_id === estudiante.proyecto_id && e.id !== estudiante.id)
      .map(e => e.nombre_completo.split(' ')[0] + ' ' + e.nombre_completo.split(' ')[e.nombre_completo.split(' ').length - 1]);
  };

  const handleEstudianteClick = (estudiante: Estudiante) => {
    
    if (estudiante.proyecto_id) {
      const seleccion = {
        proyectoId: estudiante.proyecto_id,
        grupoId: grupoId
      };
      setModalAbierto(seleccion); // ← AHORA ABRE EL MODAL
    } else {
      console.log('El estudiante no tiene proyecto_id');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando estudiantes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1></h1>
        <button 
          className={styles.sortButton}
          onClick={() => setOrdenAlfabetico(!ordenAlfabetico)}
        >
          {ordenAlfabetico ? 'Ordenar por proyecto' : 'Orden alfabético'}
        </button>
      </div>
      
      <div className={styles.studentsContainer}>
        <table className={styles.studentsTable}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Carrera</th>
              <th>CU</th>
              <th>Correo</th>
              <th>Proyecto</th>
            </tr>
          </thead>
          <tbody>
            {estudiantesOrdenados.map((estudiante) => {
              const compañeros = obtenerCompañeros(estudiante);
              const tieneProyecto = estudiante.proyecto_id && coloresProyectos[estudiante.proyecto_id];
              const esProyectoGrupal = compañeros.length > 0;

              return (
                <tr 
                  key={estudiante.id}
                  className={tieneProyecto ? styles.clickableRow : ''}
                  onClick={() => handleEstudianteClick(estudiante)}
                >
                  <td>{estudiante.nombre_completo}</td>
                  <td>{estudiante.carrera}</td>
                  <td>{estudiante.cu}</td>
                  <td>{estudiante.correo}</td>
                  <td 
                    className={`${styles.projectCell} ${tieneProyecto ? styles.groupHighlight : ''}`}
                    style={tieneProyecto ? {
                      backgroundColor: coloresProyectos[estudiante.proyecto_id!].fondo,
                      borderLeftColor: coloresProyectos[estudiante.proyecto_id!].borde
                    } : undefined}
                  >
                    {estudiante.titulo_proyecto ? (
                      <>
                        <div className={styles.projectName}>{estudiante.titulo_proyecto}</div>
                        {esProyectoGrupal && (
                          <div className={styles.projectGroupIndicator}>
                            <span className={styles.groupIcon}>Team</span>
                            <span className={styles.groupBadge}>
                              Grupo con {compañeros.join(', ')}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className={styles.noProject}>Sin proyecto configurado</div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {estudiantesOrdenados.length === 0 && (
          <div className={styles.emptyState}>
            No hay estudiantes registrados en este grupo
          </div>
        )}
      </div>

      {/* MODAL DE PROYECTO - SE ABRE COMO VENTANA EMERGENTE */}
      {modalAbierto && (
        <ProyectoModal
          proyectoId={modalAbierto.proyectoId}
          grupoId={modalAbierto.grupoId}
          onClose={() => setModalAbierto(null)}
        />
      )}
    </div>
  );
}