// components/docente/Header.tsx
interface HeaderProps {
  userName: string;
  userEmail: string;
}

export default function Header({ userName, userEmail }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-container">
        <h1 className="header-title">Panel del Docente</h1>
        <p className="header-subtitle">
          Bienvenido: <span className="header-user-name">{userName}</span> ({userEmail})
        </p>
      </div>
    </header>
  );
}