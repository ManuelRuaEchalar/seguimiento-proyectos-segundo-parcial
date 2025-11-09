'use client';

import { useState } from 'react';
import styles from './styles/ControlGrupo.module.css';

type Fase = 'tema' | 'perfil' | 'proyecto';
type VistaGrupo = 'actividades' | 'estudiantes';

interface ControlGrupoProps {
  nombreGrupo: string;
  grado: string;
  faseActual: Fase;
  onFaseChange: (fase: Fase) => void;
  rol?: 'docente' | 'estudiante';
  vistaActual?: VistaGrupo;
  onVistaChange?: (vista: VistaGrupo) => void;
}

export default function ControlGrupo({
  nombreGrupo,
  grado,
  faseActual,
  onFaseChange,
  rol = 'estudiante',
  vistaActual = 'actividades',
  onVistaChange,
}: ControlGrupoProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const faseLabels: Record<Fase, string> = {
    tema: 'Tema',
    perfil: 'Perfil',
    proyecto: 'Proyecto',
  };

  // Determinar qué fases están disponibles según el rol y grado
  const getFasesDisponibles = (): Fase[] => {
    // Estudiantes siempre ven todas las fases
    if (rol === 'estudiante') {
      return ['tema', 'perfil', 'proyecto'];
    }

    // Docentes: lógica según el grado
    if (grado === 'grado1') {
      // Grado 1: solo tema y perfil
      return ['tema', 'perfil'];
    } else if (grado === 'grado2') {
      // Grado 2: solo proyecto
      return ['proyecto'];
    }

    // Fallback: todas las fases
    return ['tema', 'perfil', 'proyecto'];
  };

  const fasesDisponibles = getFasesDisponibles();

  const handleFaseClick = (fase: Fase) => {
    onFaseChange(fase);
    setShowDropdown(false);
  };

  return (
    <div className={styles.groupInfo}>
      <div className={styles.groupCard}>
        <div className={styles.groupItem}>
          <span>Grupo:</span> {nombreGrupo}
        </div>
        <div className={styles.groupItem}>
          <span>Grado:</span> {grado === 'grado1' ? 'Grado 1' : 'Grado 2'}
        </div>
        <div className={`${styles.groupItem} ${styles.phase}`}>
          <span>Fase:</span>
          <div className={styles.phaseSelector}>
            <button
              className={styles.phaseButton}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {faseLabels[faseActual]}
            </button>
            <div className={`${styles.phaseDropdown} ${showDropdown ? styles.show : ''}`}>
              {fasesDisponibles.includes('tema') && (
                <div
                  className={`${styles.phaseOption} ${faseActual === 'tema' ? styles.active : ''}`}
                  onClick={() => handleFaseClick('tema')}
                >
                  Tema
                </div>
              )}
              {fasesDisponibles.includes('perfil') && (
                <div
                  className={`${styles.phaseOption} ${faseActual === 'perfil' ? styles.active : ''}`}
                  onClick={() => handleFaseClick('perfil')}
                >
                  Perfil
                </div>
              )}
              {fasesDisponibles.includes('proyecto') && (
                <div
                  className={`${styles.phaseOption} ${faseActual === 'proyecto' ? styles.active : ''}`}
                  onClick={() => handleFaseClick('proyecto')}
                >
                  Proyecto
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toggle para docentes */}
      {rol === 'docente' && onVistaChange && (
        <div className={styles.toggleContainer}>
          <button
            className={`${styles.toggleOption} ${vistaActual === 'actividades' ? styles.active : ''}`}
            onClick={() => onVistaChange('actividades')}
          >
            Actividades
          </button>
          <button
            className={`${styles.toggleOption} ${vistaActual === 'estudiantes' ? styles.active : ''}`}
            onClick={() => onVistaChange('estudiantes')}
          >
            Mis estudiantes
          </button>
        </div>
      )}
    </div>
  );
}