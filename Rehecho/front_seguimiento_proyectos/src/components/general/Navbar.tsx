import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './styles/Navbar.module.css';
import Cronograma from './Cronograma';

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
  atras?: boolean;
  onBack?: () => void;
  docenteInfo?: DocenteInfo;
  estudianteInfo?: EstudianteInfo;
  actividadInfo?: ActividadInfo;
  onCloseActivity?: () => void;
  onLogout?: () => void;
  onPerfil?: () => void;
  onRepositorio?: () => void;
}

export default function Navbar({
  role,
  atras = true,
  onBack,
  docenteInfo,
  estudianteInfo,
  actividadInfo,
  onCloseActivity,
  onLogout,
  onPerfil,
  onRepositorio,
}: NavbarProps) {
  const router = useRouter();
  const [mostrarCronograma, setMostrarCronograma] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const toggleCronograma = () => {
    setMostrarCronograma(!mostrarCronograma);
  };

  const renderDocenteInfo = () => {
    if (!docenteInfo) return null;
    return (
      <div className={styles.teacherInfo}>
        <div className={styles.teacherContent}>
          <div className={styles.teacherName}>{docenteInfo.nombre}</div>
          <div className={styles.teacherEmail}>{docenteInfo.email}</div>
        </div>
        <button 
          className={styles.logoutButton} 
          title="Cerrar sesión"
          onClick={onLogout}
        >
          <img src="/logout.svg" alt="Logout" className={styles.logoutIcon} />
        </button>
      </div>
    );
  };

  const renderEstudianteInfo = () => {
    if (!estudianteInfo) return null;
    return (
      <div className={styles.studentInfo}>
        <div className={styles.studentContent}>
          <div className={styles.studentName}>{estudianteInfo.nombre}</div>
          <div className={styles.studentDetails}>{estudianteInfo.carrera}</div>
          <div className={styles.studentDetails}>CU: {estudianteInfo.cu}</div>
          <div className={styles.studentDetails}>{estudianteInfo.email}</div>
        </div>
        <button 
          className={styles.logoutButton} 
          title="Cerrar sesión"
          onClick={onLogout}
        >
          <img src="/logout.svg" alt="Logout" className={styles.logoutIcon} />
        </button>
      </div>
    );
  };

const renderActividadInfo = () => {
  if (!actividadInfo) return null;
  return (
    <div className={styles.navbarCenterActividad}>
      <div className={styles.activityHeader}>
        <div className={styles.activityTitle}>
          {actividadInfo.nombre}
          <span className={`${styles.activityStatus} ${styles[actividadInfo.estado.toLowerCase()]}`}>
            {actividadInfo.estado}
          </span>
        </div>
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
      <div className={styles.navbarWrapper}>
        <div className={styles.navbar}>
          {atras && (
            <button className={styles.backButton} onClick={handleBack}>
  <img src="/back.svg" alt="Atrás" className={styles.backIcon} />
</button>
          )}
          <div className={styles.navbarCenter}>
            <div className={styles.buttonsGroup}>
              <button className={styles.iconButton} onClick={onPerfil}>
                <img src="/profile.svg" alt="Perfil" className={styles.buttonIcon} />
                Perfil
              </button>
              <button className={styles.iconButton} onClick={onRepositorio}>
                <img src="/repository.svg" alt="Repositorio" className={styles.buttonIcon} />
                Repositorio
              </button>
            </div>
          </div>
          {renderDocenteInfo()}
        </div>
      </div>
    );
  }

  // Navbar para estudiante
  if (role === 'estudiante') {
    return (
      <div className={styles.navbarWrapper}>
        <div className={styles.navbar}>
          {atras && (
            <button className={styles.backButton} onClick={handleBack}>
  <img src="/back.svg" alt="Atrás" className={styles.backIcon} />
</button>
          )}
          <div className={styles.navbarCenter}>
            <div className={styles.buttonsGroup}>
              <button className={styles.iconButton} onClick={onPerfil}>
                <img src="/profile.svg" alt="Perfil" className={styles.buttonIcon} />
                Perfil
              </button>
              <button className={styles.iconButton} onClick={onRepositorio}>
                <img src="/repository.svg" alt="Repositorio" className={styles.buttonIcon} />
                Repositorio
              </button>
              <div className={styles.cronogramaButtonWrapper}>
                <button className={styles.iconButton} onClick={toggleCronograma}>
                  <img src="/calendar.svg" alt="Cronograma" className={styles.buttonIcon} />
                  Cronograma
                </button>
                {mostrarCronograma && <Cronograma />}
              </div>
            </div>
          </div>
          {renderEstudianteInfo()}
        </div>
      </div>
    );
  }

  // Navbar para actividad estudiante
  if (role === 'actividad_estudiante') {
    return (
      <div className={styles.navbar}>
        <div className={styles.navbarLeft}>
          {atras && (
            <button className={styles.backButton} onClick={handleBack}>
  <img src="/back.svg" alt="Atrás" className={styles.backIcon} />
</button>
          )}
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
          {atras && (
            <button className={styles.backButton} onClick={handleBack}>
  <img src="/back.svg" alt="Atrás" className={styles.backIcon} />
</button>
          )}
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