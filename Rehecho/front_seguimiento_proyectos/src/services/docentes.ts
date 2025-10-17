export async function fetchEstudianteById(id: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  // NO obtener token manualmente ni enviar en header
  // Solo verificar si hay sesión (opcional, via otro endpoint)

  console.log('URL de solicitud:', `${apiUrl}/estudiante/get-by-id`);

  const response = await fetch(`${apiUrl}/estudiante/get-by-id`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
    credentials: 'include',  // ⭐ Clave: envía cookies cross-origin
  });

  if (!response.ok) {
    console.log('Error en la respuesta del servidor:', response.status, response.statusText);
    const errorData = await response.text();
    console.log('Detalle del error:', errorData);
    
    if (response.status === 401) {
      throw new Error('Sesión no autenticada. Por favor, inicia sesión nuevamente.');  // Mensaje más preciso
    } else if (response.status === 403) {  // Para authz (rol)
      throw new Error('No tienes permiso para acceder a este estudiante. Asegúrate de estar autenticado como docente.');
    } else if (response.status === 404) {
      throw new Error('Estudiante no encontrado');
    }
    
    throw new Error('Error al obtener los datos del estudiante');
  }

  const data = await response.json();
  console.log('Respuesta del servidor:', data);
  return data;
}