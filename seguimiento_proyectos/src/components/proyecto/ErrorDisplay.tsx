// components/proyecto/ErrorDisplay.tsx
interface ErrorDisplayProps {
  error: Error;
}

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <div className="error-container">
      <div className="error-content">
        <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 48 48">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="error-title">Error al cargar el proyecto</h2>
        <p className="error-message">
          {error.message || 'No se pudo obtener la información del proyecto'}
        </p>
        <a href="/docente" className="error-button">
          Volver al panel principal
        </a>
      </div>
    </div>
  );
}