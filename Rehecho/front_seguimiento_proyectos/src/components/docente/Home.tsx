'use client';

import { useRouter } from 'next/navigation';
import Navbar from '@/components/general/Navbar';
import ListaGrupos from './ListaGrupos';
import Calendario from '@/components/general/Calendario';
import { Usuario, Grupo } from '@/types/types';
import styles from './styles/Home.module.css';

interface HomeProps {
  docente: {
    id: number;
    especialidad: string;
    usuario: Usuario;
  };
  grupos: Grupo[];
  onBack?: () => void;
}

export default function Home({ docente, grupos, onBack }: HomeProps) {
  const router = useRouter();

  const docenteInfo = {
    nombre: `${docente.usuario.nombre} ${docente.usuario.apellido}`,
    email: docente.usuario.email,
  };

  const handleGrupoClick = (grupoId: number) => {
    // Encontrar el grupo completo
    const grupoSeleccionado = grupos.find(grupo => grupo.id === grupoId);
    
    if (grupoSeleccionado) {
      // Guardar en localStorage
      localStorage.setItem('grupoActual', JSON.stringify(grupoSeleccionado));
    }
    
    router.push('/dashboard/docente/grupo');
  };

  return (
    <>
      <Navbar 
        role="docente" 
        docenteInfo={docenteInfo}
        onBack={onBack}
      />
      <div className={styles.container}>
        <h1 className={styles.welcomeTitle}>
          Bienvenido, {docente.usuario.nombre}
        </h1>
        <div className={styles.contentLayout}>
          <div className={styles.leftColumn}>
            <ListaGrupos grupos={grupos} onGrupoClick={handleGrupoClick} />
          </div>
          <div className={styles.rightColumn}>
            <Calendario />
          </div>
        </div>
      </div>
    </>
  );
}