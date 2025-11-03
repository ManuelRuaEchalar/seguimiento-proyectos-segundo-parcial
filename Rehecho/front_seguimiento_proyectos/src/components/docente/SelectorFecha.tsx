'use client';

import { useState } from 'react';
import { asignarFechasGrupo } from '@/services/grupos';
import styles from './styles/SelectorFecha.module.css';

type Fase = 'tema' | 'perfil' | 'proyecto';

interface SelectorFechaProps {
  grupoId: number;
  fase: Fase;
  onFechasGuardadas: () => void;
}

export default function SelectorFecha({ grupoId, fase, onFechasGuardadas }: SelectorFechaProps) {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const handleGuardar = async () => {
    // Validaciones
    if (!fechaInicio || !fechaFin) {
      setError('Por favor, selecciona ambas fechas');
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      setError('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    setError('');
    setGuardando(true);

    try {
      // Guardar el grupo actualizado en una variable
      const grupoActualizado = await asignarFechasGrupo(grupoId, fase, fechaInicio, fechaFin);
      
      // Guardar en localStorage
      localStorage.setItem('grupoActual', JSON.stringify(grupoActualizado));
      
      // Llamar al callback después de guardar
      onFechasGuardadas();
    } catch (err: any) {
      console.error('Error al guardar fechas:', err);
      setError('Error al guardar las fechas. Intenta nuevamente.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className={styles.dateSelector}>
      <div className={styles.dateCard}>
        <div className={styles.dateTitle}>Inicio y Fin de fase</div>
        <div className={styles.dateInputs}>
          <div className={styles.dateInputGroup}>
            <label htmlFor="fecha-inicio">Fecha Inicio</label>
            <input
              type="date"
              id="fecha-inicio"
              className={styles.dateInput}
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              disabled={guardando}
            />
          </div>
          <div className={styles.dateInputGroup}>
            <label htmlFor="fecha-fin">Fecha Fin</label>
            <input
              type="date"
              id="fecha-fin"
              className={styles.dateInput}
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              disabled={guardando}
            />
          </div>
          <button
            className={styles.dateButton}
            onClick={handleGuardar}
            disabled={guardando}
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
}