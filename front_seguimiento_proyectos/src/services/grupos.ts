export async function obtenerGruposFinal() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const endpoint = `${apiUrl}/grupos/grupo-final`;
  console.log('📡 Solicitando lista de grupos grado2 en:', endpoint);

  const response = await fetch(endpoint, {
    method: 'GET',
    credentials: 'include', // 🔒 Envía cookies (JWT)
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('❌ Error al obtener los grupos:', response.status, response.statusText);
    const errorText = await response.text();
    console.error('🧩 Detalle del error:', errorText);

    if (response.status === 401) {
      throw new Error('Sesión no autenticada. Por favor, inicia sesión nuevamente.');
    }

    throw new Error('Error al obtener la lista de grupos.');
  }

  const data = await response.json();
  console.log('✅ Grupos grado2 obtenidos:', data);
  return data;
}

export async function unirseAGrupoGrado2(grupoId: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const endpoint = `${apiUrl}/grupos/${grupoId}/unirse-grado2`;
  console.log('📡 Enviando solicitud para unirse al grupo de grado2:', endpoint);

  const response = await fetch(endpoint, {
    method: 'POST',
    credentials: 'include', // 🔒 Incluye JWT
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error al unirse al grupo de grado2:', response.status, errorText);

    if (response.status === 401) {
      throw new Error('Sesión no autenticada. Por favor, inicia sesión nuevamente.');
    } else if (response.status === 403) {
      throw new Error('Solo los estudiantes pueden unirse a un grupo de grado2.');
    } else if (response.status === 409) {
      throw new Error('Ya estás asignado a un grupo de grado2.');
    } else if (response.status === 404) {
      throw new Error('No se encontró el grupo o el estudiante.');
    } else if (response.status === 400) {
      throw new Error('El grupo no es de grado2.');
    }

    throw new Error('Error al intentar unirse al grupo de grado2.');
  }

  const data = await response.json();
  console.log('✅ Unión exitosa al grupo de grado2:', data);
  return data;
}

// services/grupos.ts

type TipoFecha = 'tema' | 'perfil' | 'proyecto';

/**
 * Asigna par de fechas (inicio, fin) a un grupo en el campo indicado.
 * Ejemplos de uso:
 *  asignarFechasGrupo(3, 'tema', '2025-11-01T08:00:00.000Z', '2025-11-15T18:00:00.000Z')
 *  asignarFechasGrupo(3, 'perfil', '2025-11-16', '2025-11-30')
 */
export async function asignarFechasGrupo(
  grupoId: number,
  tipo: TipoFecha,
  fechaInicio: string,
  fechaFin: string
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  // Construimos el objeto de fechas según el tipo solicitado
  const fechasBody: Record<string, string> = {};
  if (tipo === 'tema') {
    fechasBody.fecha_inicio_tema = fechaInicio;
    fechasBody.fecha_fin_tema = fechaFin;
  } else if (tipo === 'perfil') {
    fechasBody.fecha_inicio_perfil = fechaInicio;
    fechasBody.fecha_fin_perfil = fechaFin;
  } else if (tipo === 'proyecto') {
    fechasBody.fecha_inicio_proyecto = fechaInicio;
    fechasBody.fecha_fin_proyecto = fechaFin;
  } else {
    throw new Error('Tipo de fecha inválido. Usa "tema", "perfil" o "proyecto".');
  }

  const endpoint = `${apiUrl}/grupos/asignar-fechas`;
  console.log('📡 Enviando fechas al grupo:', grupoId, tipo, fechasBody);

  const response = await fetch(endpoint, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: grupoId, ...fechasBody }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error al asignar fechas:', response.status, response.statusText, errorText);

    if (response.status === 401) {
      throw new Error('Sesión no autenticada. Por favor, inicia sesión nuevamente.');
    }

    throw new Error(`Error al asignar las fechas (status ${response.status}).`);
  }

  const data = await response.json();
  console.log('✅ Fechas asignadas correctamente:', data);
  return data;
}

export async function obtenerEstudiantesDeGrupo(grupoId: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL no está configurada');

  const endpoint = `${apiUrl}/grupos/${grupoId}/estudiantes`;
  console.log('📡 Solicitando estudiantes del grupo:', endpoint);

  const response = await fetch(endpoint, {
    method: 'GET',
    credentials: 'include', // ✅ Cookies con JWT
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('❌ Error al obtener estudiantes:', response.status, response.statusText);
    const errorText = await response.text();
    console.error('🧩 Detalle del error:', errorText);

    if (response.status === 401) {
      throw new Error('Sesión no autenticada. Por favor, inicia sesión nuevamente.');
    }
    if (response.status === 403) {
      throw new Error('No tienes permisos para ver los estudiantes.');
    }

    throw new Error('Error al obtener estudiantes del grupo.');
  }

  const data = await response.json();
  console.log('✅ Estudiantes del grupo obtenidos:', data);
  return data;
}

