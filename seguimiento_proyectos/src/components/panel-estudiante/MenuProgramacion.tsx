'use client';
import React, { useState } from 'react';

interface Grupo {
  id: number;
  nombre: string;
}

interface User {
  user_id: string;
  apellido: string;
  carrera: string;
  rol: string;
  cu: string;
  email: string;
  nombre: string;
}

interface MenuProgramacionProps {
  grupos: Grupo[];
  user: User;
}

const MenuProgramacion: React.FC<MenuProgramacionProps> = ({ grupos, user }) => {
  const [selectedGrupo, setSelectedGrupo] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrupo) return;

    try {
      console.log(grupos);
      console.log(selectedGrupo);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/users/change-group`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({user_id: user.user_id, rol: user.rol, grupo_id: selectedGrupo }),
      });
    
    } catch (error) {
      console.error('Error:', error);
      alert('Error al unirse al grupo');
    }
  };

  return (
    <div className="menu-programacion">
      <h2>Selecciona un Grupo</h2>
      <form onSubmit={handleSubmit} className="grupo-form">
        <table className="grupos-table">
          <thead>
            <tr>
              <th>Seleccionar</th>
              <th>Nombre del Grupo</th>
            </tr>
          </thead>
          <tbody>
            {grupos.map((grupo) => (
              <tr key={grupo.id}>
                <td>
                  <input
                    type="radio"
                    name="grupo"
                    value={grupo.id}
                    onChange={() => setSelectedGrupo(grupo.id)}
                    className="grupo-radio"
                  />
                </td>
                <td>{grupo.nombre}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button 
          type="submit" 
          disabled={!selectedGrupo}
          className="submit-button"
        >
          Unirse al Grupo
        </button>
      </form>
    </div>
  );
};

export default MenuProgramacion;