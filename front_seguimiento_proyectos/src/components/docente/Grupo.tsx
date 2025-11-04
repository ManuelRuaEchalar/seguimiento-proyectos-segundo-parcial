import { Grupo as GrupoType } from '@/types/types';
import styles from './styles/Grupo.module.css';

interface GrupoProps {
    grupo: GrupoType;
    onClick: (grupoId: number) => void;
}

export default function Grupo({ grupo, onClick }: GrupoProps) {
    const formatearFecha = (fecha: string | null) => {
        if (!fecha) return 'Sin actividades';
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className={styles.groupCard} onClick={() => onClick(grupo.id)}>
            <div className={styles.groupName}>{grupo.nombre}</div>
            <div className={styles.groupDetails}>
                <span className={styles.groupDetail}>{grupo.total_actividades} Actividades</span>
                <span className={styles.groupDetail}>{grupo.total_estudiantes} Estudiantes</span>
                <span className={styles.groupDetail}>
                    {grupo.grado === "grado1" ? "Grado 1" : grupo.grado}
                </span>
                <span className={styles.groupDetail}>Fase: {grupo.fase}</span>
            </div>
            <div className={styles.groupMeta}>
                <span>Última actividad: {formatearFecha(grupo.fecha_ultima_actividad)}</span>
            </div>
        </div>
    );
}