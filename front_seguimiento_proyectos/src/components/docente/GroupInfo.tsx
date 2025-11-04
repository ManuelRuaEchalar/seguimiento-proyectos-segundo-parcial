import styles from './styles/GroupInfo.module.css';

interface Grupo {
  id: number;
  nombre: string;
  grado: string;
  fase: string;
}

interface GroupInfoProps {
  grupo: Grupo;
}

export default function GroupInfo({ grupo }: GroupInfoProps) {
  return (
    <div className={styles.groupInfo}>
      <h1 className={styles.groupTitle}>Seguimiento de Proyecto de Grado</h1>
      <div className={styles.groupDetails}>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Grupo:</span> {grupo.nombre}
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Grado:</span> {grupo.grado}
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Fase:</span> {grupo.fase}
        </div>
      </div>
    </div>
  );
}