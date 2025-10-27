'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/general/Navbar';
import GroupInfo from '@/components/docente/GroupInfo';
import FormularioActividad from '@/components/docente/FormularioActividad';
import ListaActividades from '@/components/general/ListaActividades';
import { obtenerActividadesPorGrupo } from '@/services/actividades';
import styles from './page.module.css';

interface Grupo {
  id: number;
  nombre: string;
  grado: string;
  fase: string;
}

interface DocenteInfo {
  nombre: string;
  email: string;
}

interface Actividad {
  id: number;
  nombre: string;
  estado: string;
  fecha: string;
  elementos: string[];
  descripcion?: string;
}

export default function GrupoPage() {
  const router = useRouter();
  const [docenteInfo, setDocenteInfo] = useState<DocenteInfo | null>(null);
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(true);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Recuperar la información del grupo desde localStorage
      const grupoGuardado = localStorage.getItem('grupoActual');
      const docenteGuardado = localStorage.getItem('docenteActual');

      if (grupoGuardado) {
        const grupoData = JSON.parse(grupoGuardado);
        setGrupo(grupoData);

        // Cargar actividades del grupo desde la API
        const actividadesData = await obtenerActividadesPorGrupo(grupoData.id);
        console.log('Actividades cargadas:', actividadesData);
        setActividades(actividadesData.actividades);
      }

      if (docenteGuardado) {
        const docente = JSON.parse(docenteGuardado);
        setDocenteInfo({
          nombre: `${docente.usuario.nombre} ${docente.usuario.apellido}`,
          email: docente.usuario.email,
        });
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard/docente');
  };

  const toggleFormulario = () => {
    setMostrarFormulario(!mostrarFormulario);
  };

  const handleActividadCreada = (nuevaActividad: Actividad) => {
    setActividades(prev => [nuevaActividad, ...prev]);
    setMostrarFormulario(false);
  };

  const handleActividadClick = (actividadId: number) => {
    // Encontrar la actividad completa
    const actividadSeleccionada = actividades.find(actividad => actividad.id === actividadId);

    if (actividadSeleccionada) {
      // Guardar en localStorage
      localStorage.setItem('actividadActual', JSON.stringify(actividadSeleccionada));
    }

    router.push('/dashboard/docente/actividad');
  };

  if (cargando) {
    return <div className={styles.cargando}>Cargando...</div>;
  }

  return (
    <>
      {docenteInfo && (
        <Navbar
          role="docente"
          docenteInfo={docenteInfo}
          onBack={handleBack}
        />
      )}
      <div className={styles.container}>
        <div className={styles.content}>
          {grupo && <GroupInfo grupo={grupo} />}

          <div className={styles.newActivityToggle}>
            <button className={styles.newActivityBtn} onClick={toggleFormulario}>
              {mostrarFormulario ? 'Cerrar Nueva Actividad' : 'Nueva Actividad'}
            </button>
            <button className={styles.newActivityPlusBtn} onClick={toggleFormulario}>
              {mostrarFormulario ? '−' : '+'}
            </button>
          </div>

          <div className={styles.activitiesWrapper}>
            {mostrarFormulario && grupo && (
              <FormularioActividad
                grupoId={grupo.id}
                onActividadCreada={handleActividadCreada}
              />
            )}

            <ListaActividades
              rol="docente"
              actividades={actividades}
              onActividadActualizada={cargarDatos}
              onVerEntregas={handleActividadClick}
            />
          </div>
        </div>
      </div>
    </>
  );
}