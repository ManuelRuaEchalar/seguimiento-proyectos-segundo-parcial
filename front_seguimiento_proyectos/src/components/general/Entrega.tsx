import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './styles/Entrega.module.css';

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

interface EntregaProps {
  id: number;
  titulo: string;
  version: number;
  estado: string;
  fechaEntrega: string;
  estudiantes: Estudiante[];
  tipo?: string;
  file: string;
  onRevisar: (entregaId: number) => void;
  fase?: string;
  justificacion?: string;
}

export default function Entrega({
  id,
  titulo,
  version,
  estado,
  fechaEntrega,
  estudiantes,
  file,
  onRevisar,
  fase,
  justificacion
}: EntregaProps) {
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


const getEstadoClass = () => {
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

  const handleRevisar = () => {
    console.log('Revisar documento:', id);
  };

  const justificacionLarga = justificacion && justificacion.length > 150;

  return (
    <>
      <div className={`${styles.entrega} ${isTemaFase ? styles.entregaTema : ''}`}>
        <div className={styles.leftSection}>
          {!isTemaFase && (
            <span className={`${styles.badge} ${styles.versionBadge}`}>
              v{version}
            </span>
          )}
          <span className={`${styles.badge} ${styles.statusBadge} ${getEstadoClass()}`}>
            {estado.charAt(0).toUpperCase() + estado.slice(1)}
          </span>

          <div className={styles.titleContainer}>
            <h3 className={styles.title}>{titulo}</h3>
          </div>
          
          <p className={styles.metaLine}>
            Última entrega • {formatearFecha(fechaEntrega)}
          </p>

          {isTemaFase && estudiantes.length > 0 && (
            <p className={styles.metaLine}>
              {estudiantes.length === 1 ? (
                <>
                  {estudiantes[0].usuario.nombre} {estudiantes[0].usuario.apellido} • {estudiantes[0].carrera}
                </>
              ) : (
                <>
                  Equipo de {estudiantes.length} estudiantes • {estudiantes[0].carrera}
                </>
              )}
            </p>
          )}

          <button className={styles.button} onClick={() => onRevisar(id)}>
            Revisar
          </button>
        </div>

        {!isTemaFase && (
          <div className={styles.rightSection}>
            {estudiantes.length === 1 ? (
              <>
                <p className={styles.studentName}>
                  {estudiantes[0].usuario.nombre} {estudiantes[0].usuario.apellido}
                </p>
                <p className={styles.carrera}>{estudiantes[0].carrera}</p>
                <p className={styles.cu}>CU: {estudiantes[0].cu}</p>
              </>
            ) : (
              <>
                <p className={styles.studentName}>Equipo de {estudiantes.length} estudiantes</p>
                {estudiantes.map((est, index) => (
                  <div key={est.id} className={styles.estudianteItem}>
                    <p className={styles.estudianteNombre}>
                      • {est.usuario.nombre} {est.usuario.apellido}
                    </p>
                    <p className={styles.estudianteCu}>CU: {est.cu}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {isTemaFase && justificacion && (
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