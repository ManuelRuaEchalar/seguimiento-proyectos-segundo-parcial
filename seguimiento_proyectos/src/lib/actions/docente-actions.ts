// lib/actions/docente-actions.ts
'use server'

export async function getEstudiantes(grupo_id: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const response = await fetch(`${apiUrl}/users/mis-estudiantes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ grupo_id }),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching estudiantes:', error)
    throw error
  }
}

export async function getProyecto(estudianteId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const response = await fetch(`${apiUrl}/estudiante/view-project`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: estudianteId }),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudo obtener el proyecto`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching proyecto:', error)
    throw error
  }
}