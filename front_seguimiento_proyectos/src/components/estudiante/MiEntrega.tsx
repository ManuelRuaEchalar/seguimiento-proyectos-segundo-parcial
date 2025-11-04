import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './styles/MiEntrega.module.css';

interface Documento {
  id: number;
  titulo: string;
  version: number;
  estado: string;
  created_at: string;
  file: string;
}

interface MiEntregaProps {
  documento: Documento;
  onRevisar: (entregaId: number) => void;
  fase?: string;
  justificacion?: string;
}

export default function MiEntrega({ documento, onRevisar, fase, justificacion }: MiEntregaProps) {
  const router = useRouter();
  const [mostrarJustificacionCompleta, setMostrarJustificacionCompleta] = useState(false);
  const isTemaFase = fase === 'tema';

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', opciones);
  };


  const obtenerEstiloEstado = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'aprobado':
        return styles.aprobado;
      case 'rechazado':
        return styles.rechazado;
      case 'revisado':
        return styles.revisado;
      case 'pendiente':
      default:
        return styles.pendiente;
    }
  };

  const obtenerTextoEstado = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'aprobado':
        return 'Aprobado';
      case 'rechazado':
        return 'Rechazado';
      case 'revisado':
        return 'Revisado';
      case 'pendiente':
      default:
        return 'Pendiente';
    }
  };

  const handleRevisar = () => {
    // Aquí puedes implementar la navegación al detalle del documento
    // router.push(`/dashboard/estudiante/documento/${documento.id}`);
    console.log('Revisar documento:', documento.id);
  };

  const justificacionLarga = justificacion && justificacion.length > 150;
  console.log("Justificacion: ", justificacion);

  return (
    <>
      <div className={styles.entrega}>
        <div className={styles.leftSection}>
          {!isTemaFase && (
            <span className={`${styles.badge} ${styles.versionBadge}`}>
              v{documento.version}
            </span>
          )}
          <span className={`${styles.badge} ${styles.statusBadge} ${obtenerEstiloEstado(documento.estado)}`}>
            {obtenerTextoEstado(documento.estado)}
          </span>

          <div className={styles.titleContainer}>
            <h3 className={styles.title}>{documento.titulo}</h3>
          </div>
          <p className={styles.metaLine}>
            Última entrega • {formatearFecha(documento.created_at)}
          </p>
          <button className={styles.button} onClick={() => onRevisar(documento.id)}>
            Revisar
          </button>
        </div>

        {justificacion && (
          <div className={styles.note}>
            <p className={styles.noteText}>
              {justificacionLarga ? `${justificacion.substring(0, 150)}...` : justificacion}
            </p>
            {justificacionLarga && (
              <button
                onClick={() => setMostrarJustificacionCompleta(true)}
                className={styles.noteButton}
              >
                Ver nota completa
              </button>
            )}
          </div>
        )}
      </div>

      {mostrarJustificacionCompleta && (
        <div className={styles.modal} onClick={() => setMostrarJustificacionCompleta(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Justificación del Docente</h3>
            <p className={styles.modalText}>{justificacion}</p>
            <button
              onClick={() => setMostrarJustificacionCompleta(false)}
              className={styles.modalButton}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}