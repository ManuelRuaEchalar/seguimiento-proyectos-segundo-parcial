import { User } from '../../context/AuthContext'; // Ajusta la ruta según tu estructura

interface HeaderProps {
  user: User | null;
  grupo_id?: string;
  proyecto_id?: string;
}

export default function Header({ user, grupo_id = "1", proyecto_id = "1" }: HeaderProps) {
  if (!user) {
    return (
      <header className="header">
        <div className="header-container">
          <div className="header-loading">
            <div className="loading-spinner"></div>
            <span>Cargando...</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="header">
      <div className="header-container">
        {/* Avatar e información del usuario */}
        <div className="header-user-section">
          <div className="user-avatar">
            <span className="avatar-initials">
              {user.nombre.charAt(0)}{user.apellido.charAt(0)}
            </span>
          </div>
          <div className="user-info">
            <h1 className="header-title">{user.nombre} {user.apellido}</h1>
            <p className="header-subtitle">{user.email}</p>
          </div>
        </div>

        {/* Información del grupo */}
        <div className="header-group-section">
          <div className="group-badge">
            <span className="group-number">Grupo {grupo_id}</span>
            <span className="project-title">Proyecto #{proyecto_id}</span>
          </div>
        </div>
      </div>
    </header>
  );
}