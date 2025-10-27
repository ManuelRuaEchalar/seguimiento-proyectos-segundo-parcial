import Entrega from './Entrega';
import styles from './styles/ListaEntregas.module.css';

interface Estudiante {
  id: number;
  cu: string;
  carrera: string;
  usuario: {
    nombre: string;
    apellido: string;
    email: string;
  };
}

interface Documento {
  id: number;
  titulo: string;
  version: number;
  estado: string;
  justificacion: string | null;
  created_at: string;
  file: string;
  proyecto: {
    id: number;
    titulo: string;
    estudiantes: Estudiante[];
  };
}

interface ListaEntregasProps {
  documentos: Documento[];
}

export default function ListaEntregas({ documentos }: ListaEntregasProps) {
  if (!documentos || documentos.length === 0) {
    return (
      <div className={styles.entregasContainer}>
        <h2 className={styles.sectionTitle}>Entregas de la actividad</h2>
        <div className={styles.emptyState}>
          <p>No hay entregas para esta actividad aún.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.entregasContainer}>
      <h2 className={styles.sectionTitle}>Entregas de la actividad</h2>
      {documentos.map((doc) => (
        <Entrega
          key={doc.id}
          id={doc.id}
          titulo={doc.titulo}
          version={doc.version}
          estado={doc.estado}
          fechaEntrega={doc.created_at}
          estudiantes={doc.proyecto.estudiantes}
          file={doc.file}
        />
      ))}
    </div>
  );
}