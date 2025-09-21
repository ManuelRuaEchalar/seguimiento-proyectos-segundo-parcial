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
  codigoDoc: number;
  codigoProyecto: number;
  comment: {
    text: string;
  };
  isScrolledTo: boolean;
}

export function Highlight({
  position,
  onClick,
  onMouseOver,
  onMouseOut,
  comment,
  estado,
  codigoDoc,
  codigoProyecto,
  isScrolledTo,
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
          <span className={`Highlight__codigo ${styles.codigo}`}>
            {codigoDoc}
          </span>
          <span className={`Highlight__codigoProyecto ${styles.codigoProyecto}`}>
            {codigoProyecto}
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
            // biome-ignore lint/suspicious/noArrayIndexKey: We can use position hash at some point in future
            key={index}
            style={rect}
            className={`Highlight__part ${styles.part}`}
          />
        ))}
      </div>
    </div>
  );
}