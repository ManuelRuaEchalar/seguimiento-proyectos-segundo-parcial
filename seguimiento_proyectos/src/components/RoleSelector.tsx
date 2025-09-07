// app/(auth)/components/RoleSelector.tsx
import React from 'react';

interface RoleSelectorProps {
  onRoleSelect: (role: 'estudiante' | 'docente') => void;
}

const RoleSelector = ({ onRoleSelect }: RoleSelectorProps) => {
  return (
    <div className="role-selector">
      <h2>¿Cuál es tu rol?</h2>
      <p>Selecciona tu tipo de cuenta para continuar</p>
      
      <div className="role-options">
        <button 
          className="role-button"
          onClick={() => onRoleSelect('estudiante')}
        >
          <div className="role-icon">👨‍🎓</div>
          <h3>Estudiante</h3>
          <p>Accede a tus cursos y materiales</p>
        </button>
        
        <button 
          className="role-button"
          onClick={() => onRoleSelect('docente')}
        >
          <div className="role-icon">👨‍🏫</div>
          <h3>Docente</h3>
          <p>Gestiona tus clases y estudiantes</p>
        </button>
      </div>
    </div>
  );
};

export default RoleSelector;