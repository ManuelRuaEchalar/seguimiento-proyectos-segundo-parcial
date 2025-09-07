// app/(auth)/components/DecorationPanel.tsx
import React from 'react';

const DecorationPanel = () => {
  return (
    <div className="decoration-panel">
      <div className="decoration-content">
        <h1>Bienvenido</h1>
        <p>Únete a nuestra plataforma educativa</p>
        <div className="decoration-graphic">
          <div className="circle"></div>
          <div className="circle"></div>
          <div className="circle"></div>
        </div>
      </div>
    </div>
  );
};

export default DecorationPanel;