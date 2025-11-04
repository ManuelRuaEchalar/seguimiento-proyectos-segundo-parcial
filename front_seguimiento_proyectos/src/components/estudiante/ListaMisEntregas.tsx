import { on } from 'events';
import MiEntrega from './MiEntrega';
import styles from './styles/ListaMisEntregas.module.css';

interface Documento {
  id: number;
  titulo: string;
  version: number;
  estado: string;
  created_at: string;
  file: string;
  justificacion?: string;
  motivo_rechazo?: string;
}

interface ListaMisEntregasProps {
  documentos: Documento[];
  fase?: string;
  onRevisar: (entregaId: number) => void;
  esFinal?: boolean;
}

export default function ListaMisEntregas({ documentos, fase, onRevisar, esFinal }: ListaMisEntregasProps) {
  if (documentos.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No hay entregas registradas para esta actividad.</p>
        <p className={styles.emptyHint}>Utiliza el formulario de la derecha para realizar tu primera entrega.</p>
      </div>
    );
  }

  console.log("documentos en lista de mis entregas: ", documentos);

  return (
    <div className={styles.listaEntregas}>
      {documentos.map((documento) => (
        <MiEntrega 
          key={documento.id} 
          documento={documento} 
          fase={fase} 
          onRevisar={onRevisar}
          justificacion={esFinal ? documento.motivo_rechazo : documento.justificacion}
        />
      ))}
    </div>
  );
}