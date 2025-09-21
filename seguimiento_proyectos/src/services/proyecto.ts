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

  // Llamar response.json() solo UNA vez y almacenar el resultado
  const data = await response.json();
  console.log('Respuesta del servidor:', data);
  return data;
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