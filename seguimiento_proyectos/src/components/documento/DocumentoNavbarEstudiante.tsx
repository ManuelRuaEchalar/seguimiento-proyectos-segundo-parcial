'use client';
import React from 'react';

interface DocumentoNavbarEstudianteProps {
  nombreDocumento: string;
  version: string;
  estado: string;
  fechaSubida: string;
}

export default function DocumentoNavbarEstudiante({
  nombreDocumento,
  version,
  estado,
  fechaSubida,
}: DocumentoNavbarEstudianteProps) {
  const handleVolver = () => {
    console.log('Botón volver clickeado');
    // Aquí iría la lógica para volver
  };

  return (
    <nav className="documento-navbar">
      <div className="navbar-left">
        <button 
          onClick={handleVolver}
          className="btn-volver"
        >
          ← Atrás
        </button>
        <div className="documento-info">
          <span className="nombre-documento">{nombreDocumento}</span>
          <span className="version">{version}</span>
        </div>
      </div>

      <div className="navbar-center">
        {/* No buttons for approving or comparing versions */}
      </div>

      <div className="navbar-right">
        <div className="etiqueta">
          <span className="etiqueta-label">Estado:</span>
          <span className="etiqueta-value">{estado}</span>
        </div>
        <div className="etiqueta">
          <span className="etiqueta-label">Fecha de subida:</span>
          <span className="etiqueta-value">{fechaSubida}</span>
        </div>
      </div>
    </nav>
  );
}

export { DocumentoNavbarEstudiante };