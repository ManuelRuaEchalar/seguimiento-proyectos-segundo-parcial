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
  file: string;
  onRevisar: (entregaId: number) => void;
}

export default function Entrega({
  id,
  titulo,
  version,
  estado,
  fechaEntrega,
  estudiantes,
  file,
  onRevisar
}: EntregaProps) {
  const router = useRouter();

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
      case 'pendiente':
      default:
        return styles.pendiente;
    }
  };

  const handleRevisar = () => {
    // Aquí puedes implementar la lógica para revisar el documento
    console.log('Revisar documento:', id);
    // Por ejemplo: router.push(`/dashboard/docente/revision/${id}`);
  };

  return (
    <div className={styles.entrega}>
      <div className={styles.leftSection}>
        <span className={`${styles.badge} ${styles.versionBadge}`}>
          v{version}
        </span>
        <span className={`${styles.badge} ${styles.statusBadge} ${getEstadoClass()}`}>
          {estado.charAt(0).toUpperCase() + estado.slice(1)}
        </span>

        <div className={styles.titleContainer}>
          <h3 className={styles.title}>{titulo}</h3>
        </div>
        
        <p className={styles.metaLine}>
          Última entrega • {formatearFecha(fechaEntrega)}
        </p>

        <button className={styles.button} onClick={() => onRevisar(id)}>
          Revisar
        </button>
      </div>

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
    </div>
  );
}