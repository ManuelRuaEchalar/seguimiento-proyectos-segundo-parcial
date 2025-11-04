import styles from "../style/Highlight.module.css";
import type { LTWHP } from "../types.js";

interface Props {
  position: {
    boundingRect: LTWHP;
    rects: Array<LTWHP>;
  };
  onClick?: () => void;
  onMouseOver?: () => void;
  onMouseOut?: () => void;
  estado: string;
  documento_id?: number;  // ← Cambiado de codigoDoc
  proyecto_id?: number;   // ← Cambiado de codigoProyecto
  observacionId?: string;
  comment: {
    text: string;
  };
  isScrolledTo: boolean;
  isCorreccion?: boolean;
}

export function Highlight({
  position,
  onClick,
  onMouseOver,
  onMouseOut,
  comment,
  estado,
  documento_id,    // ← Cambiado de codigoDoc
  proyecto_id,     // ← Cambiado de codigoProyecto
  observacionId,
  isScrolledTo,
  isCorreccion = false,
}: Props) {
  const { rects, boundingRect } = position;

  return (
    <div
      className={`Highlight ${styles.highlight} ${isScrolledTo ? styles.scrolledTo : ""}`}
    >
      {estado && (
        <div
          className={`Highlight__estado ${styles.estado}`}
          style={{
            left: 20,
            top: boundingRect.top,
          }}
        >
          <span className={`Highlight__documento_id ${styles.documento_id}`}>
            Doc: {documento_id}    {/* ← Actualizado */}
          </span>
          <span className={`Highlight__proyecto_id ${styles.proyecto_id}`}>
            Proy: {proyecto_id}    {/* ← Actualizado */}
          </span>
          <span className={`Highlight__observacionId ${styles.observacionId}`}>
            {observacionId}
          </span>
          <span className={`Highlight__estado-text ${styles.estadoText}`}>
            {estado}
          </span>
        </div>
      )}
      <div className={`Highlight__parts ${styles.parts}`}>
        {rects.map((rect, index) => (
          <div
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
            onClick={onClick}
            key={index}
            style={rect}
            className={`Highlight__part ${styles.part} ${isCorreccion ? styles.correccion : ''}`}
          />
        ))}
      </div>
    </div>
  );
}