import { useEffect, useState } from 'react';
import styles from './styles/Cronograma.module.css';

interface Fase {
  nombre: string;
  titulo: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  estado: 'completado' | 'en-curso' | 'bloqueado';
}

export default function Cronograma() {
  const [fases, setFases] = useState<Fase[]>([]);
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    const estudianteStr = localStorage.getItem('estudianteInfo');
    if (!estudianteStr) return;

    const estudianteData = JSON.parse(estudianteStr);
    const faseActual = estudianteData.proyecto?.fase_actual;
    const grupo = estudianteData.grupo || {};
    const grupoDos = estudianteData.grupo_dos || {};

    const fasesOrden = ['tema', 'perfil', 'proyecto', 'predefensa'];
    const fasesTitulos = {
      tema: 'Fase 1: Elección de tema',
      perfil: 'Fase 2: Perfil de grado',
      proyecto: 'Fase 3: Proyecto de grado',
      predefensa: 'Fase 4: Predefensa'
    };

    const indiceActual = fasesOrden.indexOf(faseActual);

    const fasesData: Fase[] = fasesOrden.map((fase, index) => {
      let estado: 'completado' | 'en-curso' | 'bloqueado';
      if (index < indiceActual) {
        estado = 'completado';
      } else if (index === indiceActual) {
        estado = 'en-curso';
      } else {
        estado = 'bloqueado';
      }

      // Para la fase "proyecto", obtener fechas de grupo_dos
      let fechaInicio: string | null;
      let fechaFin: string | null;
      
      if (fase === 'proyecto') {
        fechaInicio = grupoDos.fecha_inicio_proyecto || null;
        fechaFin = grupoDos.fecha_fin_proyecto || null;
      } else {
        fechaInicio = grupo[`fecha_inicio_${fase}`] || null;
        fechaFin = grupo[`fecha_fin_${fase}`] || null;
      }

      return {
        nombre: fase,
        titulo: fasesTitulos[fase as keyof typeof fasesTitulos],
        fechaInicio,
        fechaFin,
        estado
      };
    });

    setFases(fasesData);
    
    // Calcular progreso (25% por fase completada)
    const fasesCompletadas = indiceActual;
    setProgreso((fasesCompletadas / 4) * 100);
  }, []);

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return 'No definida por el docente';
    
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();
    
    return `${dia}/${mes}/${anio}`;
  };

  return (
    <div className={styles.cronogramaSection}>
      <div className={styles.cronogramaHeader}>
        <h2 className={styles.cronogramaTitle}>Cronograma del proyecto</h2>
      </div>
      
      {/* Barra de Progreso */}
      <div className={styles.progressContainer}>
        <div 
          className={styles.progressBar}
          style={{ width: `${progreso}%` }}
        ></div>
      </div>
      
      {/* Fases del Proyecto */}
      <div className={styles.phasesContainer}>
        {fases.map((fase, index) => (
          <div 
            key={index} 
            className={`${styles.phaseCard} ${fase.estado === 'bloqueado' ? styles.blocked : ''}`}
          >
            <div className={`${styles.phaseStatus} ${styles[`status-${fase.estado}`]}`}>
              {fase.estado === 'completado' && 'Completado'}
              {fase.estado === 'en-curso' && 'En curso'}
              {fase.estado === 'bloqueado' && 'Bloqueado'}
            </div>
            <h3 className={styles.phaseTitle}>{fase.titulo}</h3>
            {fase.estado !== 'bloqueado' && (
              <div className={styles.phaseDates}>
                <span>Fecha inicio: {formatearFecha(fase.fechaInicio)}</span>
                <span>Fecha fin: {formatearFecha(fase.fechaFin)}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}