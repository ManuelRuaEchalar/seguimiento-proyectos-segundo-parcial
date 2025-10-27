'use client';

import { useState } from 'react';
import styles from './styles/ControlGrupo.module.css';

type Fase = 'tema' | 'perfil' | 'proyecto';

interface ControlGrupoProps {
  nombreGrupo: string;
  grado: string;
  faseActual: Fase;
  onFaseChange: (fase: Fase) => void;
}

export default function ControlGrupo({
  nombreGrupo,
  grado,
  faseActual,
  onFaseChange,
}: ControlGrupoProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const faseLabels: Record<Fase, string> = {
    tema: 'Tema',
    perfil: 'Perfil',
    proyecto: 'Proyecto',
  };

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
              <div
                className={`${styles.phaseOption} ${faseActual === 'perfil' ? styles.active : ''}`}
                onClick={() => handleFaseClick('perfil')}
              >
                Perfil
              </div>
              <div
                className={`${styles.phaseOption} ${faseActual === 'tema' ? styles.active : ''}`}
                onClick={() => handleFaseClick('tema')}
              >
                Tema
              </div>
              <div
                className={`${styles.phaseOption} ${faseActual === 'proyecto' ? styles.active : ''}`}
                onClick={() => handleFaseClick('proyecto')}
              >
                Proyecto
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}