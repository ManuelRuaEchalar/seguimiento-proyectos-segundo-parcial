export interface LTWH {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface LTWHP extends LTWH {
  pageNumber?: number;
}

export interface Scaled {
  x1: number;
  y1: number;

  x2: number;
  y2: number;

  width: number;
  height: number;

  pageNumber?: number;
}

export interface Position {
  boundingRect: LTWHP;
  rects: Array<LTWHP>;
  pageNumber: number;
}

export interface ScaledPosition {
  boundingRect: Scaled;
  rects: Array<Scaled>;
  pageNumber: number;
  usePdfCoordinates?: boolean;
}

export interface Content {
  text?: string;
  image?: string;
}

export interface HighlightContent {
  content: Content;
}

export interface Estado {
  estado: string;
}

export interface observacionId {
  observacionId: string;
}

// ✅ Cambiados a opcionales
export interface DocumentoId {
  documento_id?: number;  // ← Opcional
}

export interface ProyectoId {
  proyecto_id?: number;   // ← Opcional
}

export interface proyecto_id {
  proyecto_id?: number;   // ← Opcional
}

export interface documento_id {
  documento_id?: number;  // ← Opcional
}

export interface Comment {
  text: string;
  emoji?: string;
}

export interface HighlightComment {
  comment: Comment;
}

// NewHighlight ahora tiene documento_id y proyecto_id opcionales
export interface NewHighlight extends HighlightContent, HighlightComment, Estado, DocumentoId, ProyectoId, observacionId {
  position: ScaledPosition;
}

// IHighlight mantiene los IDs opcionales heredados de NewHighlight
export interface IHighlight extends NewHighlight {
  id: string;
  isCorreccion?: boolean;
}

export interface ViewportHighlight extends HighlightContent, HighlightComment, Estado {
  position: Position;
}

export interface Viewport {
  convertToPdfPoint: (x: number, y: number) => Array<number>;
  convertToViewportRectangle: (pdfRectangle: Array<number>) => Array<number>;
  width: number;
  height: number;
}

export interface Page {
  node: HTMLElement;
  number: number;
}