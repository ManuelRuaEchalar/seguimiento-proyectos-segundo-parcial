// @/components/documento/SidebarObservaciones.tsx
'use client';
import React from 'react';

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
    <aside className="sidebar-observaciones">
      <h3 className="sidebar-title">Observaciones y Anotaciones</h3>
      
      {observaciones.length === 0 ? (
        <div className="no-observaciones">
          <p>No hay observaciones aún</p>
        </div>
      ) : (
        <div className="observaciones-lista">
          {observaciones.map((obs) => (
            <div key={obs.id} className="observacion-card">
              <h4 className="observacion-titulo">{obs.titulo}</h4>
              
              <div className="observacion-meta">
                <span className="autor">{obs.autor}</span>
                <span className="fecha-hora">{obs.fecha} - {obs.hora}</span>
              </div>
              
              <p className="observacion-comentario">{obs.comentario}</p>
              
              <div className="observacion-acciones">
                <button 
                  onClick={() => handleEditar(obs.id)}
                  className="btn-accion btn-editar"
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleEliminar(obs.id)}
                  className="btn-accion btn-eliminar"
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