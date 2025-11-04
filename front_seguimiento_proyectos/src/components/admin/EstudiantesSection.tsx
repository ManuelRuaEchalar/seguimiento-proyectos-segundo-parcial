'use client';

import { Group } from '@/types';
import { assignEstudianteToGroup } from '@/services/api';
import '@/styles/admin/estudiantes-section.css';

interface EstudiantesSectionProps {
  estudiantes: any[];
  groups: Group[];
  setError: (error: string) => void;
}

export default function EstudiantesSection({ estudiantes, groups, setError }: EstudiantesSectionProps) {
  const handleAssign = async (groupId: number, estudianteId: number) => {
    try {
      setError('');
      await assignEstudianteToGroup(groupId, estudianteId);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="estudiantes-section">
      <h2 className="estudiantes-section__title">Estudiantes</h2>
      <table className="estudiantes-section__table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>CU</th>
            <th>Carrera</th>
            <th>Grupo Actual</th>
            <th>Asignar Grupo</th>
          </tr>
        </thead>
        <tbody>
          {estudiantes.map((estudiante: any) => (
            <tr key={estudiante.id}>
              <td>{estudiante.id}</td>
              <td>{estudiante.usuario.nombre} {estudiante.usuario.apellido}</td>
              <td>{estudiante.cu}</td>
              <td>{estudiante.carrera}</td>
              <td>{estudiante.grupo ? estudiante.grupo.nombre : 'No asignado'}</td>
              <td>
                <select
                  onChange={async (e) => {
                    if (!e.target.value) return;
                    await handleAssign(+e.target.value, estudiante.id);
                  }}
                  className="estudiantes-section__select"
                >
                  <option value="">Seleccionar Grupo</option>
                  {groups.map((group: Group) => (
                    <option key={group.id} value={group.id}>{group.nombre}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
