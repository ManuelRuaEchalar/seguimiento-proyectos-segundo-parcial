// components/proyecto/ProyectoClientPanel.tsx
'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const ProyectoClientPanel = () => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/sign-in');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="client-panel">
      <button
        onClick={handleBack}
        className="client-panel-button client-panel-button--back"
        aria-label="Volver a la lista de estudiantes"
      >
        <svg className="client-panel-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver
      </button>
      
      <button
        onClick={handleLogout}
        className="client-panel-button client-panel-button--logout"
        aria-label="Cerrar sesión"
      >
        <svg className="client-panel-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Cerrar Sesión
      </button>
    </div>
  );
};

export default ProyectoClientPanel;