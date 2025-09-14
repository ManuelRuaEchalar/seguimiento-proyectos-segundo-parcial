/**
 * Servicio para obtener observaciones de un documento
 */
export async function fetchObservaciones(codigoDoc: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL no está configurada');
  }

  console.log(`Enviando solicitud a ${apiUrl}/observacion/get-obs con body:`, { codigoDoc });

  const response = await fetch(`${apiUrl}/observacion/get-obs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ codigoDoc }),
  });

  if (!response.ok) {
    throw new Error(`Error al cargar las observaciones: ${response.status} ${response.statusText}`);
  }

  // Aquí está el cambio: usar await para obtener los datos
  const data = await response.json();
  console.log("RESPUESTA DE LA API: ", data);
  
  return data;
}

/**
 * Servicio para crear una nueva observación (highlight)
 */
export async function createObservacion(highlight: any) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL no está configurada');
  }

  const response = await fetch(`${apiUrl}/observacion/create-obs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(highlight),
  });

  console.log(`solicitud a ${apiUrl}/observacion/create-obs con body:`, highlight);

  if (!response.ok) {
    throw new Error('Error al guardar la observación');
  }

  return response.json();
}
