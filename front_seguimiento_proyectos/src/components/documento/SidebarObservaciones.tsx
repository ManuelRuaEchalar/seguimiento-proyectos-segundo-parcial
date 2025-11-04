'use client';
import React from 'react';
import styles from './style/SidebarObservaciones.module.css';

interface Observacion {
  id: number;
  titulo: string;
  autor: string;
  fecha: string;
  hora: string;
  comentario: string;
}

interface SidebarObservacionesProps {
  observaciones: Observacion[];
}

export default function SidebarObservaciones({
  observaciones
}: SidebarObservacionesProps) {
  const handleEditar = (id: number) => {
    console.log(`Botón editar observación ${id} clickeado`);
  };

  const handleEliminar = (id: number) => {
    console.log(`Botón eliminar observación ${id} clickeado`);
  };

  return (
    <aside className={styles.sidebarObservaciones}>
      <h3 className={styles.sidebarTitle}>Observaciones y Anotaciones</h3>
      
      {observaciones.length === 0 ? (
        <div className={styles.noObservaciones}>
          <p>No hay observaciones aún</p>
        </div>
      ) : (
        <div className={styles.observacionesLista}>
          {observaciones.map((obs) => (
            <div key={obs.id} className={styles.observacionCard}>
              <h4 className={styles.observacionTitulo}>{obs.titulo}</h4>
              
              <div className={styles.observacionMeta}>
                <span className={styles.autor}>{obs.autor}</span>
                <span className={styles.fechaHora}>{obs.fecha} - {obs.hora}</span>
              </div>
              
              <p className={styles.observacionComentario}>{obs.comentario}</p>
              
              <div className={styles.observacionAcciones}>
                <button 
                  onClick={() => handleEditar(obs.id)}
                  className={`${styles.btnAccion} ${styles.btnEditar}`}
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleEliminar(obs.id)}
                  className={`${styles.btnAccion} ${styles.btnEliminar}`}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}