import Actividad from './Actividad';
import styles from './styles/ListaActividades.module.css';

type ActividadRole = 'docente' | 'estudiante';

interface ListaActividadesProps {
  rol: ActividadRole;
  actividades: any[];
  estudianteId?: number;
  proyectoId?: number;
  onActividadActualizada: () => void;
  onVerEntregas: (actividadId: number) => void;
}

export default function ListaActividades({
  rol,
  actividades,
  estudianteId,
  proyectoId,
  onActividadActualizada,
  onVerEntregas,
}: ListaActividadesProps) {
  // Si no hay actividades
  if (!Array.isArray(actividades) || actividades.length === 0) {
    return (
      <div className={styles.previousActivities}>
        <h2 className={styles.sectionTitle}>Actividades anteriores</h2>
        <div className={styles.emptyState}>
          <p>No hay actividades creadas aún.</p>
          <p>Crea la primera actividad usando el formulario de nueva actividad.</p>
        </div>
      </div>
    );
  }

  // Filtrar actividades activas e inactivas
  const actividadesActivas = actividades.filter(
    (actividad) => actividad.estado?.toLowerCase() === 'activo'
  );
  const actividadesAnteriores = actividades.filter(
    (actividad) => actividad.estado?.toLowerCase() !== 'activo'
  );

  return (
    <div className={styles.activitiesContainer}>
      {/* Sección de actividades activas */}
      {actividadesActivas.length > 0 && (
        <div className={styles.currentActivity}>
          <h2 className={styles.sectionTitle}>Actividades en curso</h2>
          <div className={styles.activitiesTimeline}>
            {actividadesActivas.map((actividad, index) => (
              <Actividad
                rol={rol}
                estudianteId={estudianteId}
                proyectoId={proyectoId}
                key={actividad.id}
                actividad={actividad}
                numero={index + 1}
                onActividadActualizada={onActividadActualizada}
                onVerEntregas={onVerEntregas}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sección de actividades anteriores */}
      {actividadesAnteriores.length > 0 && (
        <div className={styles.previousActivities}>
          <h2 className={styles.sectionTitle}>Actividades anteriores</h2>
          <div className={styles.activitiesTimeline}>
            {actividadesAnteriores.map((actividad, index) => (
              <Actividad
                rol={rol}
                key={actividad.id}
                actividad={actividad}
                numero={actividadesAnteriores.length - index}
                onActividadActualizada={onActividadActualizada}
                onVerEntregas={onVerEntregas}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
