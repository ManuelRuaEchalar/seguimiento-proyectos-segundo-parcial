// components/docente/EstudianteCard.tsx
import { Estudiante } from '@/types';

interface EstudianteCardProps {
  estudiante: Estudiante;
  onClick: (estudiante: Estudiante) => void;
}

export default function EstudianteCard({ estudiante, onClick }: EstudianteCardProps) {
  return (
    <button
      onClick={() => onClick(estudiante)}
      className="estudiante-card"
      aria-label={`Ver proyecto de ${estudiante.nombre} ${estudiante.apellido}`}
    >
      <div className="estudiante-card-header">
        <div className="estudiante-badge">
          {estudiante.cu}
        </div>
      </div>
      
      <h3 className="estudiante-name">
        {estudiante.nombre} {estudiante.apellido}
      </h3>
      
      <div className="estudiante-info">
        <div className="estudiante-carrera">
          <svg className="carrera-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6.5a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h0zm10 4.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-8 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd" />
          </svg>
          <span>{estudiante.carrera}</span>
        </div>
      </div>
    </button>
  );
}