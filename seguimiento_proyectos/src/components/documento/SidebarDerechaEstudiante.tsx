'use client';
import { Observacion } from '@/types';
import React from 'react';

interface SidebarDerechaProps {
  observaciones: any[] | null;
}

export default function SidebarDerecha({ observaciones }: SidebarDerechaProps) {
  return (
    <aside className="sidebar-derecha">
      <div className="logo-container">
        <div className="logo-placeholder">
          <span>Observaciones a revisar</span>
        </div>
      </div>

      <div className="sidebar-description">
        <h2 className="sidebar-title">Observaciones</h2>
        <p className="sidebar-instructions">
          <small>Lista de observaciones asociadas al proyecto.</small>
        </p>
      </div>

      <ul className="sidebar__observaciones">
        {observaciones && observaciones.length > 0 ? (
          observaciones.map((observacion) => (
            <li key={observacion.id} className="sidebar__observacion">
              <div>
                <span className="observacion-estado">{observacion.estado}</span>
                <br />
                {observacion.commentText && (
                  <strong className="observacion-comment">{observacion.commentText}</strong>
                )}
                {observacion.contentText && (
                  <blockquote className="observacion-blockquote">
                    {`${observacion.contentText.slice(0, 90).trim()}…`}
                  </blockquote>
                )}
              </div>
              <div className="observacion__location">Page {observacion.boundingPage}</div>
            </li>
          ))
        ) : (
          <li className="sidebar__observacion sidebar__observacion--empty">
            No hay observaciones disponibles.
          </li>
        )}
      </ul>
    </aside>
  );
}