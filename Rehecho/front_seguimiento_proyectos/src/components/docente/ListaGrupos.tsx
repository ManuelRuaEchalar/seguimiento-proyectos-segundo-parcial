import { Grupo as GrupoType } from '@/types/types';
import Grupo from './Grupo';
import styles from './styles/ListaGrupos.module.css';

interface ListaGruposProps {
  grupos: GrupoType[];
  onGrupoClick: (grupoId: number) => void;
}

export default function ListaGrupos({ grupos, onGrupoClick }: ListaGruposProps) {
  return (
    <div className={styles.groupsSection}>
      <h2 className={styles.sectionTitle}>Mis Grupos</h2>
      <div className={styles.groupsGrid}>
        {grupos.map((grupo) => (
          <Grupo key={grupo.id} grupo={grupo} onClick={onGrupoClick} />
        ))}
      </div>
    </div>
  );
}