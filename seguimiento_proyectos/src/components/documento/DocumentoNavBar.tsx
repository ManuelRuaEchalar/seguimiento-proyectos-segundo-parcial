// @/components/documento/DocumentoNavbar.tsx
'use client';
import React from 'react';

interface DocumentoNavbarProps {
  nombreDocumento: string;
  version: string;
  estado: string;
  fechaSubida: string;
}

export default function DocumentoNavbar({
  nombreDocumento,
  version,
  estado,
  fechaSubida,
}: DocumentoNavbarProps) {
  const handleVolver = () => {
    console.log('Botón volver clickeado');
    // Aquí iría la lógica para volver
  };

  const handleCompararVersion = () => {
    console.log('Botón comparar versión anterior clickeado');
  };

  const handleAprobar = () => {
    console.log('Botón aprobar clickeado');
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
        <button 
          onClick={handleCompararVersion}
          className="btn-comparar"
        >
          Comparar versión anterior
        </button>
        <button 
          onClick={handleAprobar}
          className="btn-aprobar"
        >
          Aprobar
        </button>
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