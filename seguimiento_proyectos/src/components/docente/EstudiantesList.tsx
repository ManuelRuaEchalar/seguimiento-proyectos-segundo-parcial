// components/docente/EstudiantesList.tsx
import { Estudiante } from '@/types';
import EstudianteCard from './EstudianteCard';

interface EstudiantesListProps {
  estudiantes: Estudiante[];
  onEstudianteClick: (estudiante: Estudiante) => void;
}

export default function EstudiantesList({ estudiantes, onEstudianteClick }: EstudiantesListProps) {
  return (
    <div className="estudiantes-grid">
      {estudiantes.map(estudiante => (
        <EstudianteCard
          key={estudiante.user_id}
          estudiante={estudiante}
          onClick={onEstudianteClick}
        />
      ))}
    </div>
  );
}