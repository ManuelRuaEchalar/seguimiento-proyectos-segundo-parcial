import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './styles/Navbar.module.css';
import Cronograma from './Cronograma';
import { logout } from '@/services/api';
import { editarActividad } from '@/services/actividades';

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
  id: number;
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
  onPerfil?: () => void;
}

export default function Navbar({
  role,
  atras = true,
  onBack,
  docenteInfo,
  estudianteInfo,
  actividadInfo,
  onCloseActivity,
  onPerfil,
}: NavbarProps) {
  const router = useRouter();
  const [mostrarCronograma, setMostrarCronograma] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [cerrando, setCerrando] = useState(false);

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

  const handleRepositorio = () => {
    window.open('/', '_blank');
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  const manejarCerrarActividad = async () => {
    if (!actividadInfo) return;
    
    setCerrando(true);
    try {
      await editarActividad(actividadInfo.id, { estado: 'cerrado' });
      setMostrarConfirmacion(false);
      if (onCloseActivity) {
        onCloseActivity();
      }
    } catch (error) {
      console.error('Error cerrando actividad:', error);
      alert('Error al cerrar la actividad');
    } finally {
      setCerrando(false);
    }
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
          onClick={handleLogout}
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
          onClick={handleLogout}
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
              <button className={styles.iconButton} onClick={handleRepositorio}>
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
              <button className={styles.iconButton} onClick={handleRepositorio}>
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
      <>
        <div className={styles.navbar}>
          <div className={styles.navbarLeft}>
            {atras && (
              <button className={styles.backButton} onClick={handleBack}>
                <img src="/back.svg" alt="Atrás" className={styles.backIcon} />
              </button>
            )}
          </div>
          {renderActividadInfo()}
          {actividadInfo && actividadInfo.estado.toLowerCase() !== 'cerrado' && (
            <div className={styles.navbarRight}>
              <button 
                className={styles.closeActivityBtn} 
                onClick={() => setMostrarConfirmacion(true)}
                disabled={cerrando}
              >
                {cerrando ? 'Cerrando...' : 'Cerrar actividad'}
              </button>
            </div>
          )}
        </div>

        {/* Modal de confirmación */}
        {mostrarConfirmacion && (
          <div className={styles.modalOverlay} onClick={() => !cerrando && setMostrarConfirmacion(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h3 className={styles.modalTitle}>¿Cerrar actividad?</h3>
              <p className={styles.modalText}>
                Al cerrar la actividad, los estudiantes ya no podrán subir entregas.
                Esta acción no se puede deshacer.
              </p>
              <div className={styles.modalButtons}>
                <button 
                  className={styles.modalCancelBtn}
                  onClick={() => setMostrarConfirmacion(false)}
                  disabled={cerrando}
                >
                  Cancelar
                </button>
                <button 
                  className={styles.modalConfirmBtn}
                  onClick={manejarCerrarActividad}
                  disabled={cerrando}
                >
                  {cerrando ? 'Cerrando...' : 'Cerrar actividad'}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}