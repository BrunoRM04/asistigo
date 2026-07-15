const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/asistigo/backend/api'

async function request(path, options = {}) {
  const esFormulario = typeof FormData !== 'undefined' && options.body instanceof FormData
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      ...(!esFormulario ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await response.json().catch(() => ({ ok: false, error: 'Respuesta invalida del servidor' }))

  if (!response.ok || data.ok === false) {
    throw new Error(data.error || data.detail || 'Error de backend')
  }

  return data
}

export const asistigoApi = {
  loginCliente: ({ email, password }) =>
    request('/auth.php', {
      method: 'POST',
      body: JSON.stringify({ accion: 'login_cliente', email, password }),
    }),

  registrarCliente: (datos) =>
    request('/auth.php', {
      method: 'POST',
      body: JSON.stringify({ accion: 'registro_cliente', ...datos }),
    }),

  loginMecanico: ({ email, password }) =>
    request('/auth.php', {
      method: 'POST',
      body: JSON.stringify({ accion: 'login_mecanico', email, password }),
    }),

  registrarMecanico: (datos) =>
    request('/auth.php', {
      method: 'POST',
      body: JSON.stringify({ accion: 'registro_mecanico', ...datos }),
    }),

  cargarCliente: (clienteId) => request(`/app-data.php?cliente_id=${encodeURIComponent(clienteId)}`),

  crearVehiculo: (vehiculo) =>
    request('/vehiculos.php', {
      method: 'POST',
      body: JSON.stringify(vehiculo),
    }),

  actualizarVehiculo: (vehiculo) =>
    request('/vehiculos.php', {
      method: 'PUT',
      body: JSON.stringify(vehiculo),
    }),

  eliminarVehiculo: ({ id, cliente_id }) =>
    request('/vehiculos.php', {
      method: 'DELETE',
      body: JSON.stringify({ id, cliente_id }),
    }),

  actualizarPerfil: (perfil) =>
    request('/perfil.php', {
      method: 'PUT',
      body: JSON.stringify(perfil),
    }),

  reservarTurno: (turno) =>
    request('/turnos.php', {
      method: 'POST',
      body: JSON.stringify(turno),
    }),

  cancelarTurno: ({ id, cliente_id }) =>
    request('/turnos.php', {
      method: 'PATCH',
      body: JSON.stringify({ id, cliente_id, estado: 'cancelado' }),
    }),

  pedirPresupuesto: (solicitud) =>
    request('/solicitudes.php', {
      method: 'POST',
      body: JSON.stringify({ tipo: 'presupuesto', ...solicitud }),
    }),

  enviarMensajeCliente: (mensaje) =>
    request('/chat.php', {
      method: 'POST',
      body: JSON.stringify({ accion: 'enviar_cliente', ...mensaje }),
    }),

  consultarAsistenteIA: (consulta) => {
    const formulario = new FormData()
    formulario.append('cliente_id', String(consulta.cliente_id))
    formulario.append('vehiculo_id', consulta.vehiculo_id ? String(consulta.vehiculo_id) : '')
    formulario.append('pregunta', consulta.pregunta || '')
    if (consulta.archivo) formulario.append('archivo', consulta.archivo)
    if (consulta.video_frames?.length) formulario.append('video_frames', JSON.stringify(consulta.video_frames))
    return request('/asistente-ia.php', { method: 'POST', body: formulario })
  },

  resolverUbicacion: ({ latitud, longitud }) =>
    request(`/geocode.php?latitud=${encodeURIComponent(latitud)}&longitud=${encodeURIComponent(longitud)}`),

  buscarDireccion: ({ direccion, ciudad = '', pais = '' }) =>
    request(
      `/geocode.php?direccion=${encodeURIComponent(direccion)}&ciudad=${encodeURIComponent(ciudad)}&pais=${encodeURIComponent(pais)}`,
    ),

  calificarTurno: (resena) =>
    request('/resenas.php', {
      method: 'POST',
      body: JSON.stringify(resena),
    }),

  marcarNotificacion: ({ id, cliente_id }) =>
    request('/notificaciones.php', {
      method: 'PATCH',
      body: JSON.stringify({ id, cliente_id }),
    }),

  registrarPushToken: (dispositivo) =>
    request('/push-tokens.php', {
      method: 'POST',
      body: JSON.stringify({ accion: 'registrar', ...dispositivo }),
    }),

  desactivarPushToken: (dispositivo) =>
    request('/push-tokens.php', {
      method: 'POST',
      body: JSON.stringify({ accion: 'desactivar', ...dispositivo }),
    }),

  cargarMecanico: ({ mecanico_id, taller_id }) =>
    request(`/mecanico.php?mecanico_id=${encodeURIComponent(mecanico_id)}&taller_id=${encodeURIComponent(taller_id)}`),

  accionMecanico: (payload) =>
    request('/mecanico.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  cambiarEstadoPresupuesto: (id, estado, cliente_id) =>
    request('/presupuestos.php', {
      method: 'PATCH',
      body: JSON.stringify({ id, estado, cliente_id }),
    }),
}
