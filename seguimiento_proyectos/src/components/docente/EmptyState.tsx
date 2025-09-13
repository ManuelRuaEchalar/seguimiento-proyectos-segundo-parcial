// components/docente/EmptyState.tsx
export default function EmptyState() {
  return (
    <div className="empty-state">
      <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 48 48">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.712-3.714M14 40v-4a9.971 9.971 0 01.712-3.714M26 20.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z" />
      </svg>
      <h3 className="empty-title">No hay estudiantes</h3>
      <p className="empty-description">No tienes estudiantes asignados en este grupo.</p>
    </div>
  );
}