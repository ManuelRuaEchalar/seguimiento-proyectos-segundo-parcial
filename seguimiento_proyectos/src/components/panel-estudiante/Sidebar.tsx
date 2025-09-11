import React from 'react';

interface User {
  user_id: string;
  apellido: string;
  carrera: string;
  cu: string;
  email: string;
  nombre: string;
}

interface SidebarProps {
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Información del Estudiante</h2>
      </div>
      <div className="sidebar-content">
        <div className="user-info-item">
          <span className="label">Nombre:</span>
          <span className="value">{user.nombre} {user.apellido}</span>
        </div>
        <div className="user-info-item">
          <span className="label">Carrera:</span>
          <span className="value">{user.carrera}</span>
        </div>
        <div className="user-info-item">
          <span className="label">CU:</span>
          <span className="value">{user.cu}</span>
        </div>
        <div className="user-info-item">
          <span className="label">Email:</span>
          <span className="value">{user.email}</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;