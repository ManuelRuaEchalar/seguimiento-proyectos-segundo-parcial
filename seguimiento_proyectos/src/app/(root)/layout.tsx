// app/(root)/layout.tsx
import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="root-layout">
      <header className="root-header">
        <div className="header-content">
          <h1>Mi App Educativa</h1>
          <nav>
            <a href="/sign-in">Iniciar Sesión</a>
            <a href="/sign-up">Registrarse</a>
          </nav>
        </div>
      </header>
      
      <main className="root-main">
        {children}
      </main>
      
      <footer className="root-footer">
        <p>&copy; 2024 Mi App Educativa. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Layout;