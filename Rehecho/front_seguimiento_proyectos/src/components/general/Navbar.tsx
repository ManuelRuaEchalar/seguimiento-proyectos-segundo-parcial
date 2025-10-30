import { useRouter } from 'next/navigation';
import styles from './styles/Navbar.module.css';

type NavbarRole = 'docente' | 'estudiante' | 'actividad_estudiante' | 'actividad_docente';

interface DocenteInfo {
  nombre: string;
  email: string;
}

interface EstudianteInfo {
  nombre: string;
  carrera: string;
  cu: string;
  email: string;
}

interface ActividadInfo {
  nombre: string;
  estado: string;
  fecha: string;
  tags: string[];
}

interface NavbarProps {
  role: NavbarRole;
  onBack?: () => void;
  docenteInfo?: DocenteInfo;
  estudianteInfo?: EstudianteInfo;
  actividadInfo?: ActividadInfo;
  onCloseActivity?: () => void;
}

export default function Navbar({
  role,
  onBack,
  docenteInfo,
  estudianteInfo,
  actividadInfo,
  onCloseActivity,
}: NavbarProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const renderDocenteInfo = () => {
    if (!docenteInfo) return null;
    return (
      <div className={styles.teacherInfo}>
        <div className={styles.teacherName}>{docenteInfo.nombre}</div>
        <div className={styles.teacherEmail}>{docenteInfo.email}</div>
      </div>
    );
  };

  const renderEstudianteInfo = () => {
    if (!estudianteInfo) return null;
    return (
      <div className={styles.studentInfo}>
        <div className={styles.studentName}>{estudianteInfo.nombre}</div>
        <div className={styles.studentDetails}>{estudianteInfo.carrera}</div>
        <div className={styles.studentDetails}>CU: {estudianteInfo.cu}</div>
        <div className={styles.studentDetails}>{estudianteInfo.email}</div>
      </div>
    );
  };

  const renderActividadInfo = () => {
    if (!actividadInfo) return null;
    return (
      <div className={styles.navbarCenter}>
        <div className={styles.activityTitle}>{actividadInfo.nombre}         <span className={`${styles.activityStatus} ${styles[actividadInfo.estado.toLowerCase()]}`}>
  {actividadInfo.estado}
</span></div>
        <div className={styles.activityMeta}>

        </div>
        <div className={styles.activityTags}>
          {actividadInfo.tags.map((tag, index) => (
            <span key={index} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Navbar para docente
  if (role === 'docente') {
    return (
      <div className={styles.navbar}>
        <button className={styles.backButton} onClick={handleBack}>
          ← Atrás
        </button>
        {renderDocenteInfo()}
      </div>
    );
  }

  // Navbar para estudiante
  if (role === 'estudiante') {
    return (
      <div className={styles.navbar}>
        <button className={styles.backButton} onClick={handleBack}>
          ← Atrás
        </button>
        {renderEstudianteInfo()}
      </div>
    );
  }

  // Navbar para actividad estudiante
  if (role === 'actividad_estudiante') {
    return (
      <div className={styles.navbar}>
        <div className={styles.navbarLeft}>
          <button className={styles.backButton} onClick={handleBack}>
            ← Atrás
          </button>
        </div>
        {renderActividadInfo()}
      </div>
    );
  }

  // Navbar para actividad docente
  if (role === 'actividad_docente') {
    return (
      <div className={styles.navbar}>
        <div className={styles.navbarLeft}>
          <button className={styles.backButton} onClick={handleBack}>
            ← Atrás
          </button>
        </div>
        {renderActividadInfo()}
        <div className={styles.navbarRight}>
          <button className={styles.closeActivityBtn} onClick={onCloseActivity}>
            Cerrar actividad
          </button>
        </div>
      </div>
    );
  }

  return null;
}