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
    console.log('Error en la respuesta del servidor:', response.status, response.statusText);
    throw new Error('Error al cargar el proyecto');
  }

  const data = await response.json();
  console.log('Respuesta del servidor:', data);
  return data;
}

// proyecto.ts
export async function fetchDoc(id: number) {
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
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    throw new Error(`Error al cargar el documento: ${response.status}`);
  }

  // ✅ USAR ARRAYBUFFER PARA GARANTIZAR DESCARGA COMPLETA
  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get('Content-Type') || 'application/pdf';
  
  // Crear Blob desde ArrayBuffer (más confiable)
  const blob = new Blob([arrayBuffer], { type: contentType });
  
  console.log('✅ Documento descargado:', blob.size, 'bytes, tipo:', contentType);

  return { blob, contentType };
}

/**
 * Obtener observaciones de un proyecto por documento
 */
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
    console.log("falla al obtener observaciones del proyecto");
    throw new Error('Error al cargar las observaciones del proyecto');
  }

  return response.json();
}

/**
 * Obtener información del documento (metadatos)
 */
export async function fetchDocInfo(id: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  console.log("id de documento:", id);

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL no está configurada');
  }

  const response = await fetch(`${apiUrl}/documento/doc-info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ id }),
  });

  console.log(`solicitud a ${apiUrl}/documento/doc-info con body:`, { id });

  if (!response.ok) {
    console.log("error al obtener información del documento");
    throw new Error('Error al cargar la información del documento');
  }

  const data = await response.json();
  console.log('Información del documento:', data);
  
  // Retorna: { id, titulo, version, estado, activo, created_at, file, proyecto_id }
  return data;
}

/**
 * Servicio para cambiar la fase de un proyecto
 */
export async function changeProyectoFase(id: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL no está configurada');
  }

  const response = await fetch(`${apiUrl}/proyecto/cambiar-fase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 🔒 incluye cookies (JWT)
    body: JSON.stringify({ id }),
  });

  console.log(`Solicitud a ${apiUrl}/proyecto/cambiar-fase con body:`, { id });

  if (!response.ok) {
    console.error('Error al cambiar la fase:', response.status, response.statusText);
    throw new Error('No se pudo cambiar la fase del proyecto');
  }

  const data = await response.json();
  console.log('Respuesta del servidor (cambio de fase):', data);
  return data;
}

/**
 * Servicio para obtener todos los datos de un proyecto
 */
export async function fetchProyectoById(id: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL no está configurada');
  }

  const response = await fetch(`${apiUrl}/proyecto/obtener`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 🔒 Envia cookies (JWT)
    body: JSON.stringify({ id }),
  });

  console.log(`Solicitud a ${apiUrl}/proyecto/obtener con body:`, { id });

  if (!response.ok) {
    console.error('Error en la respuesta del servidor:', response.status, response.statusText);
    throw new Error('Error al obtener el proyecto');
  }

  const data = await response.json();
  console.log('Respuesta del servidor:', data);
  return data;
}
