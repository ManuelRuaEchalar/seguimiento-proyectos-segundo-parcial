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

export async function fetchObservacionesArea(codigoDoc: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL no está configurada');
  }

  console.log(`Enviando solicitud a ${apiUrl}/observacion/get-obs con body:`, { codigoDoc });

  const response = await fetch(`${apiUrl}/observacion/get-obs-area`, {
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
  console.log("RESPUESTA DE LA API obs AREA: ", data);
  
  return data;
}

export async function fetchImageAsBase64(url: string): Promise<string | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  try {
    console.log("PEDIR IMAGEN A: ", url)
    const response = await fetch(`${apiUrl}${url}`);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob); // convierte a data:image/png;base64,...
    });
  } catch (error) {
    console.error("Error convirtiendo imagen a base64:", error);
    return null;
  }
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

export async function createObservacionArea(highlight: any, fileName: string, blob: Blob) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL no está configurada');
  }

  // Modificar el highlight para cambiar content.image por el fileName
  const modifiedHighlight = {
    ...highlight,
    content: {
      ...highlight.content,
      image: fileName
    }
  };

  // Crear FormData para enviar highlight, fileName y blob
  const formData = new FormData();
  formData.append('highlight', JSON.stringify(modifiedHighlight));
  formData.append('fileName', fileName);
  formData.append('imageFile', blob, fileName);

  const response = await fetch(`${apiUrl}/observacion/create-obs-area`, {
    method: 'POST',
    credentials: 'include',
    body: formData, // Enviar como FormData, no JSON
  });

  console.log(`solicitud a ${apiUrl}/observacion/create-obs-area con fileName:`, fileName);

  if (!response.ok) {
    throw new Error('Error al guardar la observación de área');
  }

  return response.json();
}

