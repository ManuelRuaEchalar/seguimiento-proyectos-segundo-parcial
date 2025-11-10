'use client';

import { useEffect, useState } from 'react';
import { obtenerGruposFinal, unirseAGrupoGrado2 } from '@/services/grupos';
import styles from './styles/GruposProyecto.module.css';

interface Grupo {
  id: number;
  nombre: string;
  grado: string;
  docente_nombre_completo: string;
}

interface GruposProyectoProps {
  onGrupoUnido: () => void;
}

export default function GruposProyecto({ onGrupoUnido }: GruposProyectoProps) {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uniendose, setUniendose] = useState<number | null>(null);

  useEffect(() => {
    cargarGrupos();
  }, []);

  const cargarGrupos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await obtenerGruposFinal();
      setGrupos(data);
    } catch (err: any) {
      console.error('❌ Error al cargar grupos:', err);
      setError(err.message || 'Error al cargar los grupos');
    } finally {
      setLoading(false);
    }
  };

  const handleUnirse = async (grupoId: number) => {
    try {
      setUniendose(grupoId);
      setError(null);
      await unirseAGrupoGrado2(grupoId);
      
      // Notificar al componente padre que se unió exitosamente
      onGrupoUnido();
    } catch (err: any) {
      console.error('❌ Error al unirse al grupo:', err);
      setError(err.message || 'Error al unirse al grupo');
      setUniendose(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.gruposSection}>
        <div className={styles.loading}>Cargando grupos disponibles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.gruposSection}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={cargarGrupos} className={styles.retryBtn}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (grupos.length === 0) {
    return (
      <div className={styles.gruposSection}>
        <h2 className={styles.sectionTitle}>Grupos Disponibles</h2>
        <div className={styles.noGrupos}>
          <p>No hay grupos disponibles en este momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gruposSection}>
      <h2 className={styles.sectionTitle}>Grupos Disponibles</h2>
      <p className={styles.descripcion}>
        Selecciona un grupo de <b>grado II</b> para continuar con tu proyecto de grado.
      </p>
      <div className={styles.gruposList}>
        {grupos.map((grupo) => (
          <div key={grupo.id} className={styles.groupCard}>
            <h3 className={styles.groupName}>{grupo.nombre}</h3>
            
            <div className={styles.groupDocente}>
              <span>Asesor: {grupo.docente_nombre_completo}</span>
            </div>
            
            <div className={styles.groupFooter}>
              <span className={styles.groupGrado}>2do Grado</span>
              <span className={styles.activeBadge}>Activo</span>
            </div>
            
            <button 
              onClick={() => handleUnirse(grupo.id)}
              className={styles.joinButton}
              disabled={uniendose === grupo.id}
            >
              {uniendose === grupo.id ? (
                <>
                  <div className={styles.buttonSpinner}></div>
                  Uniéndose...
                </>
              ) : (
                'Unirse al grupo'
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}