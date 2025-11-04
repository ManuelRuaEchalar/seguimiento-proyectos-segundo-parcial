/**
 * Servicio para obtener correcciones de un documento
 */
export async function fetchCorrecciones(codigoDoc: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL no está configurada');
  }

  console.log(`Enviando solicitud a ${apiUrl}/correccion/get-corr con body:`, { codigoDoc });

  const response = await fetch(`${apiUrl}/correccion/get-corr`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ codigoDoc }),
  });

  if (!response.ok) {
    console.log("falla al obtener correcciones");
    throw new Error(`Error al cargar las correcciones: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log("RESPUESTA DE LA API (correcciones): ", data);

  return data;
}

/**
 * Servicio para crear una nueva corrección (highlight)
 */
export async function createCorreccion(highlight: any) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL no está configurada');
  }

  console.log(`Enviando solicitud a ${apiUrl}/correccion/create-corr con body:`, highlight);

  const response = await fetch(`${apiUrl}/correccion/create-corr`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(highlight),
  });

  if (!response.ok) {
    throw new Error('Error al guardar la corrección');
  }

  return response.json();
}

/**
 * Servicio para eliminar una corrección por observacionId
 */
export async function deleteCorreccionByObservacionId(observacionId: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL no está configurada');
  }

  console.log(`Enviando solicitud a ${apiUrl}/correccion/delete-by-observacion con body:`, { observacionId });

  const response = await fetch(`${apiUrl}/correccion/delete-by-observacion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ observacionId }),
  });

  if (!response.ok) {
    throw new Error('Error al eliminar la corrección');
  }

  return response.json();
}
