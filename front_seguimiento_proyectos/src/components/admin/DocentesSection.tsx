'use client';

import { Group } from '@/types';
import { assignDocenteToGroup } from '@/services/api';
import '@/styles/admin/docentes-section.css';

interface DocentesSectionProps {
  docentes: any[];
  groups: Group[];
  setError: (error: string) => void;
}

export default function DocentesSection({ docentes, groups, setError }: DocentesSectionProps) {
  const handleAssign = async (groupId: number, docenteId: number) => {
    try {
      setError('');
      await assignDocenteToGroup(groupId, docenteId);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="docentes-section">
      <h2 className="docentes-section__title">Docentes</h2>
      <table className="docentes-section__table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Especialidad</th>
            <th>Grupos</th>
            <th>Asignar Grupo</th>
          </tr>
        </thead>
        <tbody>
          {docentes.map((docente: any) => (
            <tr key={docente.id}>
              <td>{docente.id}</td>
              <td>{docente.usuario.nombre} {docente.usuario.apellido}</td>
              <td>{docente.especialidad}</td>
              <td>
                {docente.grupos.map((grupo: any) => (
                  <span key={grupo.id} className="docentes-section__group">
                    {grupo.nombre}
                  </span>
                ))}
              </td>
              <td>
                <select
                  onChange={async (e) => {
                    if (!e.target.value) return;
                    await handleAssign(+e.target.value, docente.id);
                  }}
                  className="docentes-section__select"
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
