// app/(auth)/components/RoleSelector.tsx
import Link from 'next/link';
import React from 'react';

interface RoleSelectorProps {
  onRoleSelect: (role: 'estudiante' | 'docente') => void;
}

const RoleSelector = ({ onRoleSelect }: RoleSelectorProps) => {
  return (
    <div className="role-selector">
      <h2>Acceso para:</h2>
      <div className="role-options">
        <button 
          className="role-button"
          onClick={() => onRoleSelect('estudiante')}
        >
          <h3>Estudiante</h3>
          <p>Accede a tus cursos y materiales</p>
        </button>
        
        <button 
          className="role-button"
          onClick={() => onRoleSelect('docente')}
        >
          <h3>Docente</h3>
          <p>Gestiona tus clases y estudiantes</p>
        </button>
      </div>
       <div className="form-footer">
                <p>
                    ¿Ya tienes cuenta? <Link href="/sign-in">Inicia Sesión</Link>
                </p>
            </div>
    </div>
  );
};

export default RoleSelector;