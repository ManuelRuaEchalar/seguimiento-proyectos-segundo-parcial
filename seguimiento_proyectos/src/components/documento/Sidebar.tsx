import type { IHighlight } from "./react-pdf-highlighter";

interface Props {
  highlights: Array<IHighlight>;
  resetHighlights: () => void;
  onHighlightClick?: (highlight: IHighlight) => void;
}

const updateHash = (highlight: IHighlight) => {
  document.location.hash = `highlight-${highlight.id}`;
};

export function Sidebar({
  highlights,
  resetHighlights,
  onHighlightClick,
}: Props) {
  
  const handleHighlightClick = (highlight: IHighlight) => {
    // Actualizar el hash como antes
    updateHash(highlight);
    
    // Llamar a la función de navegación si está disponible
    if (onHighlightClick) {
      onHighlightClick(highlight);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-description">
        <h2 className="sidebar-title">
          Observaciones
        </h2>

        <p className="sidebar-instructions">
          <small>
            Para añadir una observación selecciona el texto y agrega una nota.
          </small>
        </p>
      </div>

      <ul className="sidebar__highlights">
        {highlights.map((highlight, index) => (
          <li
            // biome-ignore lint/suspicious/noArrayIndexKey: This is an example app
            key={index}
            className="sidebar__highlight"
            onClick={() => handleHighlightClick(highlight)}
            style={{ cursor: 'pointer' }}
          >
            <div>
              <span className="highlight-estado">{highlight.estado}</span> <br/>
              <strong>{highlight.comment.text}</strong>
              {highlight.content.text ? (
                <blockquote className="highlight-blockquote">
                  {`${highlight.content.text.slice(0, 90).trim()}…`}
                </blockquote>
              ) : null}
              {highlight.content.image ? (
                <div className="highlight__image">
                  <img src={highlight.content.image} alt={"Screenshot"} />
                </div>
              ) : null}
            </div>
            <div className="highlight__location">
              Page {highlight.position.pageNumber}
            </div>
          </li>
        ))}
      </ul>
      {highlights.length > 0 ? (
        <div className="sidebar-reset-container">
          <button type="button" onClick={resetHighlights}>
            Reset highlights
          </button>
        </div>
      ) : null}
    </div>
  );
}