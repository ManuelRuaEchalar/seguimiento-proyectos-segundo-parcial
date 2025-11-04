import type { IHighlight } from '@/components/documento/react-pdf-highlighter';

export const getNextId = () => String(Math.random()).slice(2);

export const convertObservacionToHighlight = (observacion: any): IHighlight => {
  let position;

  if (observacion.position) {
    position = observacion.position;
  } else if (
    observacion.bounding_x1 !== undefined &&
    observacion.bounding_y1 !== undefined
  ) {
    const pageNumber = observacion.bounding_page || 1;
    const width = 1020;
    const height = 1320;

    position = {
      boundingRect: {
        x1: observacion.bounding_x1,
        y1: observacion.bounding_y1,
        x2: observacion.bounding_x2,
        y2: observacion.bounding_y2,
        width,
        height,
        pageNumber,
      },
      rects:
        observacion.rects && Array.isArray(observacion.rects)
          ? observacion.rects.map((rect: any) => ({
            x1: rect.x1 || observacion.bounding_x1,
            y1: rect.y1 || observacion.bounding_y1,
            x2: rect.x2 || observacion.bounding_x2,
            y2: rect.y2 || observacion.bounding_y2,
            width: rect.width || width,
            height: rect.height || height,
            pageNumber: rect.pageNumber || pageNumber,
          }))
          : [
            {
              x1: observacion.bounding_x1,
              y1: observacion.bounding_y1,
              x2: observacion.bounding_x2,
              y2: observacion.bounding_y2,
              width,
              height,
              pageNumber,
            },
          ],
      pageNumber,
    };
  } else {
    position = {
      boundingRect: {
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 20,
        width: 1020,
        height: 1320,
        pageNumber: 1,
      },
      rects: [
        {
          x1: 0,
          y1: 0,
          x2: 100,
          y2: 20,
          width: 1020,
          height: 1320,
          pageNumber: 1,
        },
      ],
      pageNumber: 1,
    };
  }

  const content: any = {
    text: observacion.content_text || observacion.content?.text || "",
  };

  const highlight: IHighlight = {
    id: observacion.id?.toString() || getNextId(),
    content,
    position,
    comment: {
      text: observacion.comment_text || observacion.comment?.text || "",
      emoji: observacion.comment_emoji || observacion.comment?.emoji || "",
    },
    estado: observacion.estado || "pendiente",
    documento_id: observacion.documento_id || 0,
    proyecto_id: observacion.proyecto_id || 1,
    observacionId: ""
  };

  return highlight;
};

export const convertCorreccionToHighlight = (correccion: any): IHighlight => {
  let position;

  if (correccion.position) {
    position = correccion.position;
  } else if (
    correccion.bounding_x1 !== undefined &&
    correccion.bounding_y1 !== undefined
  ) {
    const pageNumber = correccion.bounding_page || 1;
    const width = 1020;
    const height = 1320;

    position = {
      boundingRect: {
        x1: correccion.bounding_x1,
        y1: correccion.bounding_y1,
        x2: correccion.bounding_x2,
        y2: correccion.bounding_y2,
        width,
        height,
        pageNumber,
      },
      rects:
        correccion.rects && Array.isArray(correccion.rects)
          ? correccion.rects.map((rect: any) => ({
            x1: rect.x1 || correccion.bounding_x1,
            y1: rect.y1 || correccion.bounding_y1,
            x2: rect.x2 || correccion.bounding_x2,
            y2: rect.y2 || correccion.bounding_y2,
            width: rect.width || width,
            height: rect.height || height,
            pageNumber: rect.pageNumber || pageNumber,
          }))
          : [
            {
              x1: correccion.bounding_x1,
              y1: correccion.bounding_y1,
              x2: correccion.bounding_x2,
              y2: correccion.bounding_y2,
              width,
              height,
              pageNumber,
            },
          ],
      pageNumber,
    };
  } else {
    position = {
      boundingRect: {
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 20,
        width: 1020,
        height: 1320,
        pageNumber: 1,
      },
      rects: [
        {
          x1: 0,
          y1: 0,
          x2: 100,
          y2: 20,
          width: 1020,
          height: 1320,
          pageNumber: 1,
        },
      ],
      pageNumber: 1,
    };
  }

  const content: any = {
    text: correccion.content_text || correccion.content?.text || "",
  };

  const highlight: IHighlight = {
    id: correccion.id?.toString() || getNextId(),
    content,
    position,
    comment: {
      text: correccion.comment_text || correccion.comment?.text || "",
      emoji: correccion.comment_emoji || correccion.comment?.emoji || "",
    },
    estado: correccion.estado || "pendiente",
    documento_id: correccion.documento_id || 0,
    proyecto_id: correccion.proyecto_id || 1,
    isCorreccion: true,
    observacionId: correccion.observacion_id || correccion.observacionId || ""
  };

  return highlight;
};