// components/DocentePage.tsx
'use client';
import { useAuth } from '../../../context/AuthContext';
import { useEffect, useState } from 'react';

interface Estudiante {
  user_id: number;
  nombre: string;
  apellido: string;
  carrera: string;
  cu: string;
}

const DocentePage = () => {
  const { user, logout } = useAuth();
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEstudiantes = async () => {
      if (user && user.grupo_id) {
        try {
          setLoading(true);
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          const response = await fetch(`${apiUrl}/users/mis-estudiantes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ grupo_id: user.grupo_id }),
            credentials: 'include',
          });

          if (response.status === 401) {
            logout();
            throw new Error('No autorizado');
          }

          if (!response.ok) {
            throw new Error(`Error ${response.status}`);
          }

          const data = await response.json();
          setEstudiantes(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchEstudiantes();
    }
  }, [user, logout]);

  if (!user) return <div>No hay datos de usuario</div>;

  const handleEstudianteClick = (estudiante: Estudiante) => {
    console.log('Estudiante seleccionado:', estudiante);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>Panel del Docente</h1>
      <p style={{ marginBottom: '30px' }}>
        Bienvenido: <strong>{user.nombre}</strong> registrado con email: <strong>{user.email}</strong>
      </p>
      
      <h2 style={{ color: '#444', marginBottom: '20px' }}>Lista de Estudiantes</h2>
      
      {loading && <p>Cargando estudiantes...</p>}
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {!loading && !error && estudiantes.length === 0 && (
        <p>No hay estudiantes en este grupo.</p>
      )}
      
      {!loading && !error && estudiantes.length > 0 && (
        <div style={{ display: 'grid', gap: '15px' }}>
          {estudiantes.map(estudiante => (
            <button
              key={estudiante.user_id}
              onClick={() => handleEstudianteClick(estudiante)}
              style={{
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#eaeaea';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#f9f9f9';
              }}
            >
              <div style={{ fontWeight: 'bold' }}>
                {estudiante.nombre} {estudiante.apellido}
              </div>
              <div style={{ marginTop: '5px' }}>
                <span style={{ color: '#666' }}>Carrera: </span>
                {estudiante.carrera}
              </div>
              <div>
                <span style={{ color: '#666' }}>CU: </span>
                {estudiante.cu}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocentePage;