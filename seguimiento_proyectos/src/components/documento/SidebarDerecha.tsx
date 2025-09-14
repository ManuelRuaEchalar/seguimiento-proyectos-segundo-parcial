// @/components/documento/SidebarDerecha.tsx
'use client';
import React from 'react';

interface DatosEstudiante {
  nombre: string;
  carrera: string;
  semestre: string;
}

interface DatosProyecto {
  titulo: string;
  descripcion: string;
  fechaEntrega: string;
}

interface SidebarDerechaProps {
  estudiante: DatosEstudiante;
  proyecto: DatosProyecto;
}

export default function SidebarDerecha({
  estudiante,
  proyecto
}: SidebarDerechaProps) {
  return (
    <aside className="sidebar-derecha">
      <div className="logo-container">
        <div className="logo-placeholder">
          <span>CloudIt</span>
        </div>
      </div>

      <div className="datos-estudiante">
        <h3 className="section-title">Datos del Estudiante</h3>
        <div className="dato-item">
          <span className="dato-label">Nombre:</span>
          <span className="dato-value">{estudiante.nombre}</span>
        </div>
        <div className="dato-item">
          <span className="dato-label">Carrera:</span>
          <span className="dato-value">{estudiante.carrera}</span>
        </div>
        <div className="dato-item">
          <span className="dato-label">Semestre:</span>
          <span className="dato-value">{estudiante.semestre}</span>
        </div>
      </div>

      <div className="datos-proyecto">
        <h3 className="section-title">Datos del Proyecto</h3>
        <div className="dato-item">
          <span className="dato-label">Título:</span>
          <span className="dato-value">{proyecto.titulo}</span>
        </div>
        <div className="dato-item">
          <span className="dato-label">Descripción:</span>
          <p className="dato-description">{proyecto.descripcion}</p>
        </div>
        <div className="dato-item">
          <span className="dato-label">Fecha de Entrega:</span>
          <span className="dato-value">{proyecto.fechaEntrega}</span>
        </div>
      </div>
    </aside>
  );
}