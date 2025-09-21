/**
 * Servicio para obtener datos del proyecto
 */
export async function fetchProyecto(id: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL no está configurada');
  }

  const response = await fetch(`${apiUrl}/estudiante/view-project`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ id }),
  });

  console.log(`solicitud a ${apiUrl}/estudiante/view-project con body:`, { id });

  if (!response.ok) {
    throw new Error('Error al cargar el proyecto');
  }

  return response.json();
}

export async function fetchDoc(codigoDoc: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL no está configurada');
  }

  const response = await fetch(`${apiUrl}/documento/get-doc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ codigoDoc }),
  });

  console.log(`solicitud a ${apiUrl}/documento/get-doc con body:`, { codigoDoc });

  if (!response.ok) {
    throw new Error('Error al cargar el documento');
  }

  // Get the blob from the response
  const blob = await response.blob();
  return {
    blob,
    contentType: response.headers.get('Content-Type') || 'application/octet-stream'
  };
}

export async function fetchProjectObservaciones(codigoProyecto: number, codigoDoc: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL no está configurada');
  }

  const response = await fetch(`${apiUrl}/observacion/get-project-obs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ codigoProyecto, codigoDoc }),
  });

  console.log(`solicitud a ${apiUrl}/observacion/get-project-obs con body:`, { codigoProyecto, codigoDoc });

  if (!response.ok) {
    console.log("falla al obtener obs de proyecto");
    throw new Error('Error al cargar las observaciones del proyecto');
  }

  return response.json();
}

export async function fetchDocInfo(codigoDoc: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  console.log("id de doc: ", codigoDoc);
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL no está configurada');
  }

  const response = await fetch(`${apiUrl}/documento/doc-info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ codigoDoc }),
  });

  console.log(`solicitud a ${apiUrl}/documento/doc-info con body:`, { codigoDoc });

  if (!response.ok) {
    console.log("error con info doc");
    throw new Error('Error al cargar la información del documento');
  }

  const data = await response.json();
  console.log(data);
  return data; // JSON con titulo, version, file, proyectoId, etc.
}