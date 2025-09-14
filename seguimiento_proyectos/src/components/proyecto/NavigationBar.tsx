// components/proyecto/NavigationBar.tsx
interface NavigationBarProps {
  codigoProyecto: number;
  titulo: string;
  documentosCount: number;
}

export default function NavigationBar({ codigoProyecto, titulo, documentosCount }: NavigationBarProps) {
  return (
    <nav className="navigation-bar">
      <div className="navigation-container">
        <div className="navigation-left">
          <h1 className="navigation-title">
            Proyecto #{codigoProyecto}
          </h1>
          <span className="navigation-separator">|</span>
          <h2 className="navigation-subtitle">{titulo}</h2>
        </div>
        <div className="navigation-right">
          <span className="documents-count">
            {documentosCount} documento(s)
          </span>
        </div>
      </div>
    </nav>
  );
}