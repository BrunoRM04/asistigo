import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { asistigoApi } from './api/asistigoApi'
import { UserLoginVista } from './user/vistas/UserLoginVista'
import { UserInicioVista } from './user/vistas/UserInicioVista'
import { UserVehiculosVista } from './user/vistas/UserVehiculosVista'
import { UserTalleresVista } from './user/vistas/UserTalleresVista'
import { UserTurnosVista } from './user/vistas/UserTurnosVista'
import { UserPresupuestosVista } from './user/vistas/UserPresupuestosVista'
import { UserChatVista } from './user/vistas/UserChatVista'
import { UserChatHiloVista } from './user/vistas/UserChatHiloVista'
import { UserPerfilVista } from './user/vistas/UserPerfilVista'
import { UserNotificacionesVista } from './user/vistas/UserNotificacionesVista'
import { UserIcon } from './user/UserIcon'
import { MecanicoPanel } from './mecanico/MecanicoPanel'
import { AsistiGoLogo } from './components/AsistiGoLogo'
import { desactivarPushNotifications, iniciarPushNotifications } from './services/pushNotifications'

const sesionInicial = () => {
  try {
    return JSON.parse(window.localStorage.getItem('asistigo_sesion') || 'null')
  } catch {
    return null
  }
}

const datosClienteVacios = {
  perfil: { id: null, nombre: 'Cliente AsistiGo', inicial: 'A', email: '' },
  vehiculos: [],
  talleres: [],
  turnos: [],
  turnosHistorial: [],
  presupuestos: [],
  notificaciones: [],
  recordatorios: [],
  chats: [
    {
      id: 'ia',
      nombre: 'Asistente IA AsistiGo',
      ia: true,
      ultimo: 'Contame que sintoma notas y te ayudo a interpretarlo.',
      hora: 'Ahora',
      mensajes: [{ from: 'in', text: 'Hola, soy tu asistente. Puedo ayudarte con sintomas, mantenimiento y alertas.', time: 'Ahora' }],
    },
  ],
}

function App() {
  const [area_activa, setAreaActiva] = useState('usuario')
  const [sesion, setSesion] = useState(sesionInicial)
  const [user_vista_activa, setUserVistaActiva] = useState('inicio')
  const [user_tab_turnos, setUserTabTurnos] = useState('proximos')
  const [user_filtro_taller, setUserFiltroTaller] = useState('')
  const [user_chip_taller, setUserChipTaller] = useState('todos')
  const [user_hilo_chat, setUserHiloChat] = useState(null)
  const [datosCliente, setDatosCliente] = useState(datosClienteVacios)
  const [cargandoDatos, setCargandoDatos] = useState(false)
  const [backendError, setBackendError] = useState('')
  const [pushDestino, setPushDestino] = useState(null)

  const user_autenticado = sesion?.tipo === 'cliente'
  const mecanico_autenticado = sesion?.tipo === 'mecanico'

  useEffect(() => {
    if (!sesion) {
      window.localStorage.removeItem('asistigo_sesion')
      return
    }

    window.localStorage.setItem('asistigo_sesion', JSON.stringify(sesion))

    if (sesion.tipo === 'cliente') {
      cargarDatosCliente(sesion.usuario.id)
    }
  }, [sesion])

  useEffect(() => {
    if (mecanico_autenticado) {
      setAreaActiva('mecanico')
    }
  }, [mecanico_autenticado])

  useEffect(() => {
    if (!sesion) return

    iniciarPushNotifications(sesion, (ruta) => {
      setPushDestino({ ruta, recibidoEn: Date.now() })
      if (sesion.tipo === 'cliente') {
        if (ruta.includes('chat')) setUserVistaActiva('chat')
        else if (ruta.includes('presupuesto')) setUserVistaActiva('presupuestos')
        else if (ruta.includes('turno')) setUserVistaActiva('turnos')
        else if (ruta.includes('vehiculo')) setUserVistaActiva('vehiculos')
        else setUserVistaActiva('notificaciones')
        cargarDatosCliente(sesion.usuario.id)
      }
    }).catch((error) => console.error('No se pudieron iniciar las notificaciones push', error))
  }, [sesion])

  const cargarDatosCliente = async (clienteId = sesion?.usuario?.id) => {
    if (!clienteId) return

    setCargandoDatos(true)
    setBackendError('')

    try {
      const respuesta = await asistigoApi.cargarCliente(clienteId)
      setDatosCliente({
        ...datosClienteVacios,
        ...respuesta.data,
      })
    } catch (error) {
      setBackendError(error.message)
    } finally {
      setCargandoDatos(false)
    }
  }

  const ingresarCliente = async (modo, datos) => {
    const respuesta = modo === 'registro'
      ? await asistigoApi.registrarCliente(datos)
      : await asistigoApi.loginCliente(datos)

    setSesion({ tipo: 'cliente', usuario: respuesta.usuario })
    setAreaActiva('usuario')
    setUserVistaActiva('inicio')
  }

  const ingresarMecanico = async (modo = 'login', datos = {}) => {
    const respuesta = modo === 'registro'
      ? await asistigoApi.registrarMecanico(datos)
      : await asistigoApi.loginMecanico(datos)

    setSesion({ tipo: 'mecanico', usuario: respuesta.usuario })
    setAreaActiva('mecanico')
  }

  const cerrarSesion = async () => {
    await desactivarPushNotifications(sesion).catch(() => {})
    setSesion(null)
    setDatosCliente(datosClienteVacios)
    setAreaActiva('usuario')
    setUserVistaActiva('inicio')
  }

  const user_nav_items = [
    { id: 'inicio', label: 'Inicio', icono: 'home' },
    { id: 'vehiculos', label: 'Vehiculos', icono: 'car' },
    { id: 'talleres', label: 'Talleres', icono: 'wrench' },
    { id: 'turnos', label: 'Turnos', icono: 'calendar' },
    { id: 'chat', label: 'Chat', icono: 'chat' },
    { id: 'notificaciones', label: 'Avisos', icono: 'bell' },
    { id: 'perfil', label: 'Perfil', icono: 'user' },
  ]

  const user_saludo = useMemo(() => {
    const hora = new Date().getHours()
    if (hora < 12) return 'Buen dia'
    if (hora < 19) return 'Buenas tardes'
    return 'Buenas noches'
  }, [])

  const user_talleres_filtrados = useMemo(() => {
    let lista = [...datosCliente.talleres]
    const q = user_filtro_taller.trim().toLowerCase()

    if (q) {
      lista = lista.filter(
        (t) =>
          t.nombre.toLowerCase().includes(q)
          || t.especialidad.toLowerCase().includes(q)
          || (t.ciudad || '').toLowerCase().includes(q)
          || (t.direccion || '').toLowerCase().includes(q)
          || (Array.isArray(t.tags) ? t.tags.join(' ').toLowerCase().includes(q) : false),
      )
    }

    if (user_chip_taller === 'cercanos') {
      lista.sort((a, b) => {
        const valorA = Number(a.distancia)
        const valorB = Number(b.distancia)
        const distanciaA = Number.isFinite(valorA) ? valorA : Number.MAX_SAFE_INTEGER
        const distanciaB = Number.isFinite(valorB) ? valorB : Number.MAX_SAFE_INTEGER
        return distanciaA - distanciaB
      })
    }
    if (user_chip_taller === 'mejor calificados') lista.sort((a, b) => b.rating - a.rating)
    if (user_chip_taller === 'abiertos ahora') lista = lista.filter((t) => t.abierto)

    return lista
  }, [datosCliente.talleres, user_filtro_taller, user_chip_taller])

  const user_chat_activo = datosCliente.chats.find((c) => c.id === user_hilo_chat)
  const user_notificaciones_pendientes = datosCliente.notificaciones.filter((n) => !n.leida).length

  const user_ir = (vista) => {
    setUserVistaActiva(vista)
    if (vista !== 'chat-hilo') setUserHiloChat(null)
  }

  const user_abrir_chat = (chatId) => {
    setUserHiloChat(chatId)
    setUserVistaActiva('chat-hilo')
  }

  const user_seleccionar_vehiculo_ia = (vehiculoId) => {
    setDatosCliente((actual) => ({
      ...actual,
      chats: actual.chats.map((chat) =>
        chat.id === 'ia' ? { ...chat, vehiculo_id: vehiculoId ? Number(vehiculoId) : null } : chat,
      ),
    }))
  }

  const user_enviar_mensaje = async ({ texto = '', archivo = null, videoFrames = [] }) => {
    const valor = texto.trim()
    if ((!valor && !archivo) || !user_hilo_chat) return

    if (user_chat_activo && !user_chat_activo.ia) {
      await asistigoApi.enviarMensajeCliente({
        cliente_id: sesion.usuario.id,
        conversacion_id: user_chat_activo.id,
        taller_id: user_chat_activo.taller_id,
        vehiculo_id: user_chat_activo.vehiculo_id,
        contenido: valor,
      })
      await cargarDatosCliente(sesion.usuario.id)
      return
    }

    const hora = new Date().toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    const archivoEsVideo = archivo?.type.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(archivo?.name || '')
    const textoVisible = valor || (archivoEsVideo ? 'Video adjunto' : 'Imagen adjunta')
    const adjuntosOptimistas = archivo
      ? [{
          tipo: archivoEsVideo ? 'video' : 'imagen',
          nombre: archivo.name,
          mime: archivo.type,
          url: URL.createObjectURL(archivo),
        }]
      : []
    setDatosCliente((actual) => ({
      ...actual,
      chats: actual.chats.map((chat) =>
        chat.id !== user_hilo_chat
          ? chat
          : {
              ...chat,
              ultimo: textoVisible,
              hora: 'Ahora',
              mensajes: [...chat.mensajes, { from: 'out', text: textoVisible, time: hora, attachments: adjuntosOptimistas }],
            },
      ),
    }))

    const respuesta = await asistigoApi.consultarAsistenteIA({
      cliente_id: sesion.usuario.id,
      vehiculo_id: user_chat_activo?.vehiculo_id || null,
      pregunta: valor,
      archivo,
      video_frames: videoFrames,
    })
    setDatosCliente((actual) => ({
      ...actual,
      chats: actual.chats.map((chat) =>
        chat.id !== user_hilo_chat
          ? chat
          : {
              ...chat,
              ultimo: respuesta.data.respuesta,
              hora: 'Ahora',
              mensajes: [...chat.mensajes, { from: 'in', text: respuesta.data.respuesta, time: respuesta.data.hora }],
            },
      ),
    }))
  }

  const agregarVehiculo = async (vehiculo) => {
    await asistigoApi.crearVehiculo({
      ...vehiculo,
      cliente_id: sesion.usuario.id,
    })
    await cargarDatosCliente(sesion.usuario.id)
  }

  const actualizarVehiculo = async (vehiculo) => {
    await asistigoApi.actualizarVehiculo({
      ...vehiculo,
      cliente_id: sesion.usuario.id,
    })
    await cargarDatosCliente(sesion.usuario.id)
  }

  const eliminarVehiculo = async (id) => {
    await asistigoApi.eliminarVehiculo({
      id,
      cliente_id: sesion.usuario.id,
    })
    await cargarDatosCliente(sesion.usuario.id)
  }

  const actualizarPerfil = async (perfil) => {
    await asistigoApi.actualizarPerfil({
      ...perfil,
      cliente_id: sesion.usuario.id,
    })
    await cargarDatosCliente(sesion.usuario.id)
  }

  const reservarTurno = async (turno) => {
    await asistigoApi.reservarTurno({
      ...turno,
      cliente_id: sesion.usuario.id,
    })
    await cargarDatosCliente(sesion.usuario.id)
    setUserVistaActiva('turnos')
    setUserTabTurnos('proximos')
  }

  const cancelarTurno = async (id) => {
    await asistigoApi.cancelarTurno({
      id,
      cliente_id: sesion.usuario.id,
    })
    await cargarDatosCliente(sesion.usuario.id)
  }

  const pedirPresupuesto = async (solicitud) => {
    await asistigoApi.pedirPresupuesto({
      ...solicitud,
      cliente_id: sesion.usuario.id,
    })
    await cargarDatosCliente(sesion.usuario.id)
    setUserVistaActiva('presupuestos')
  }

  const calificarTurno = async (resena) => {
    await asistigoApi.calificarTurno({
      ...resena,
      cliente_id: sesion.usuario.id,
    })
    await cargarDatosCliente(sesion.usuario.id)
  }

  const marcarNotificacion = async (id = 0) => {
    await asistigoApi.marcarNotificacion({
      id,
      cliente_id: sesion.usuario.id,
    })
    await cargarDatosCliente(sesion.usuario.id)
  }

  const cambiarEstadoPresupuesto = async (id, estado) => {
    await asistigoApi.cambiarEstadoPresupuesto(id, estado, sesion.usuario.id)
    setDatosCliente((actual) => ({
      ...actual,
      presupuestos: actual.presupuestos.map((p) => (p.id === id ? { ...p, estado } : p)),
    }))
  }

  const user_badge_estado = (estado) => {
    const textos = {
      confirmado: 'Confirmado',
      pendiente: 'Pendiente',
      completado: 'Completado',
      aceptado: 'Aceptado',
      rechazado: 'Rechazado',
      cancelado: 'Cancelado',
      solicitado: 'Solicitado',
      respondida: 'Respondida',
    }

    return <span className={`user-etiqueta-estado user-etiqueta-estado-${estado}`}>{textos[estado] || estado}</span>
  }

  if (area_activa === 'mecanico') {
    return (
      <MecanicoPanel
        autenticado={mecanico_autenticado}
        usuario={sesion?.usuario}
        onIngresar={ingresarMecanico}
        onCerrarSesion={cerrarSesion}
        onCliente={() => setAreaActiva('usuario')}
        pushDestino={pushDestino}
      />
    )
  }

  if (!user_autenticado) {
    return (
      <UserLoginVista
        onIngresar={ingresarCliente}
        onElegirMecanico={() => setAreaActiva('mecanico')}
      />
    )
  }

  return (
    <div className="user-aplicacion">
      <aside className="user-lateral">
        <AsistiGoLogo className="user-marca user-marca-lateral" />

        <nav className="user-menu-lateral">
          {user_nav_items.map((item) => (
            <button
              key={item.id}
              className={`user-menu-opcion ${user_vista_activa === item.id ? 'user-menu-opcion-activo' : ''}`}
              type="button"
              onClick={() => user_ir(item.id)}
            >
              <UserIcon name={item.icono} size={19} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="user-lateral-divisor" />
        <div className="user-lateral-pie">
          <div>
            <p>{datosCliente.perfil.nombre}</p>
            <span>Cuenta de cliente</span>
          </div>
          <button type="button" onClick={cerrarSesion}>
            <UserIcon name="logout" size={17} />
            Cerrar sesion
          </button>
        </div>
      </aside>

      <div className={`user-principal ${user_vista_activa === 'chat-hilo' ? 'user-principal-chat' : ''}`}>
        <header className="user-barra-superior">
          <div className="user-barra-superior-cuenta">
            <div className="user-avatar">{datosCliente.perfil.inicial}</div>
            <div>
              <p className="user-barra-superior-saludo">{user_saludo}</p>
              <p className="user-barra-superior-nombre">{datosCliente.perfil.nombre}</p>
            </div>
          </div>
          <div className="user-barra-acciones">
            <button className="user-boton-icono" type="button" aria-label="Notificaciones" onClick={() => user_ir('notificaciones')}>
              <UserIcon name="bell" size={18} />
              {user_notificaciones_pendientes > 0 && <span className="user-ping" />}
            </button>
            <button className="user-boton user-boton-secundario user-boton-ia" type="button" onClick={() => user_abrir_chat('ia')}>
              <UserIcon name="spark" size={17} />
              <span>Asistente IA</span>
            </button>
          </div>
        </header>

        <main className={`user-contenido ${user_vista_activa === 'chat-hilo' ? 'user-contenido-chat' : ''}`}>
          {(backendError || cargandoDatos) && (
            <div className="user-alerta">
              <span className="user-alerta-icono"><UserIcon name={backendError ? 'alert' : 'spark'} size={20} /></span>
              <div>
                <p className="user-linea-titulo">{backendError ? 'Backend sin respuesta correcta' : 'Cargando datos reales'}</p>
                <p className="user-linea-subtitulo">{backendError || 'Leyendo informacion desde MySQL en XAMPP.'}</p>
              </div>
            </div>
          )}

          {user_vista_activa === 'inicio' && (
            <UserInicioVista
              vehiculo={datosCliente.vehiculos[0]}
              vehiculos={datosCliente.vehiculos}
              recordatorios={datosCliente.recordatorios}
              onIr={user_ir}
              onAbrirIA={() => user_abrir_chat('ia')}
            />
          )}

          {user_vista_activa === 'vehiculos' && (
            <UserVehiculosVista
              vehiculos={datosCliente.vehiculos}
              onAgregarVehiculo={agregarVehiculo}
              onActualizarVehiculo={actualizarVehiculo}
              onEliminarVehiculo={eliminarVehiculo}
            />
          )}

          {user_vista_activa === 'talleres' && (
            <UserTalleresVista
              valorBusqueda={user_filtro_taller}
              onCambiarBusqueda={setUserFiltroTaller}
              chipActivo={user_chip_taller}
              onCambiarChip={setUserChipTaller}
              talleres={user_talleres_filtrados}
              ubicacionCliente={datosCliente.perfil.direccion_principal}
              ubicacionConfigurada={datosCliente.perfil.direccion_principal?.latitud != null}
              onIrPerfil={() => user_ir('perfil')}
              vehiculos={datosCliente.vehiculos}
              onIrVehiculos={() => user_ir('vehiculos')}
              onReservarTurno={reservarTurno}
              onPedirPresupuesto={pedirPresupuesto}
            />
          )}

          {user_vista_activa === 'turnos' && (
            <UserTurnosVista
              tabActiva={user_tab_turnos}
              onCambiarTab={setUserTabTurnos}
              turnos={datosCliente.turnos}
              turnosHistorial={datosCliente.turnosHistorial}
              badgeEstado={user_badge_estado}
              onCancelarTurno={cancelarTurno}
              onCalificarTurno={calificarTurno}
              onAbrirChat={() => user_ir('chat')}
            />
          )}

          {user_vista_activa === 'presupuestos' && (
            <UserPresupuestosVista
              presupuestos={datosCliente.presupuestos}
              badgeEstado={user_badge_estado}
              onCambiarEstado={cambiarEstadoPresupuesto}
            />
          )}

          {user_vista_activa === 'chat' && <UserChatVista chats={datosCliente.chats} onAbrirChat={user_abrir_chat} />}

          {user_vista_activa === 'chat-hilo' && user_chat_activo && (
            <UserChatHiloVista
              chat={user_chat_activo}
              vehiculos={datosCliente.vehiculos}
              onVolver={() => user_ir('chat')}
              onEnviar={user_enviar_mensaje}
              onSeleccionarVehiculo={user_seleccionar_vehiculo_ia}
            />
          )}

          {user_vista_activa === 'perfil' && (
            <UserPerfilVista
              perfil={datosCliente.perfil}
              vehiculos={datosCliente.vehiculos}
              recordatorios={datosCliente.recordatorios}
              onIr={user_ir}
              onCerrarSesion={cerrarSesion}
              onActualizarPerfil={actualizarPerfil}
            />
          )}

          {user_vista_activa === 'notificaciones' && (
            <UserNotificacionesVista
              notificaciones={datosCliente.notificaciones}
              onMarcarNotificacion={marcarNotificacion}
              onIr={user_ir}
            />
          )}
        </main>

        <nav className="user-navegacion-movil">
          {user_nav_items.map((item) => (
            <button
              key={item.id}
              className={`user-navegacion-movil-item ${user_vista_activa === item.id ? 'user-navegacion-movil-item-activo' : ''}`}
              type="button"
              onClick={() => user_ir(item.id)}
            >
              <UserIcon name={item.icono} size={22} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default App
