'use client';
import { useAuth } from '../../../../context/AuthContext';
import { useAuthFetch } from '../../../../hooks/useAuthFetch';
import { useEffect, useState } from 'react';
import Sidebar from '../../../../components/Sidebar';
import MenuProgramacion from '../../../../components/MenuProgramacion';

interface Grupo {
  id: number;
  nombre: string;
}

const EstudianteSinGrupoPage = () => {
  const { user } = useAuth();
  const { data: grupos, loading, error } = useAuthFetch('/grupos');
  const [gruposData, setGruposData] = useState<Grupo[]>([]);
  console.log(gruposData);

  useEffect(() => {
    if (grupos) {
      setGruposData(grupos);
    }
  }, [grupos]);

  if (!user) return <div>No hay datos de usuario</div>;
  if (loading) return <div>Cargando grupos...</div>;
  if (error) return <div>Error al cargar grupos: {error}</div>;

  return (
    <div className="estudiante-sin-grupo-container">
      <Sidebar user={user} />
      <MenuProgramacion grupos={gruposData} user={user} />
    </div>
  );
};

export default EstudianteSinGrupoPage;