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
    console.log("falla al obtener obs");
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

  console.log('📤 Enviando al backend:', highlight); // ← Agrega este log

  const response = await fetch(`${apiUrl}/observacion/create-obs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(highlight),
  });

  console.log(`Solicitud a ${apiUrl}/observacion/create-obs con body:`, highlight);

  if (!response.ok) {
    throw new Error('Error al guardar la observación');
  }

  return response.json();
}

export async function cambiarEstado(id: Number, estado: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL no está configurada');
  }

  console.log(`Enviando solicitud a ${apiUrl}/observacion/cambiar-estado-obs con body:`, { id, estado });

  const response = await fetch(`${apiUrl}/observacion/cambiar-estado-obs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ id, estado }),
  });

  if (!response.ok) {
    console.log("Falla al cambiar estado de la observación");
    throw new Error(`Error al cambiar el estado: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log("RESPUESTA DE LA API cambiar estado: ", data);

  return data;
}