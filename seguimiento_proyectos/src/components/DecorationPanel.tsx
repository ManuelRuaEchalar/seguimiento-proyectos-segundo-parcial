// app/(auth)/components/DecorationPanel.tsx
import React from 'react';

const DecorationPanel = () => {
  return (
    <div className="decoration-panel">
      <div className="decoration-content">
        <h1>Bienvenido</h1>
        <p>Seguimiento de proyectos de grado para estudiantes de la USFX</p>
      </div>
      <span className="ball"></span>
      <span className="ball"></span>
      <span className="ball"></span>
      <span className="ball"></span>
      <span className="ball"></span>
      <span className="ball"></span>
    </div>
  );
};

export default DecorationPanel;