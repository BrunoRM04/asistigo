import { useMemo, useState } from 'react'
import './App.css'
import { UserLoginVista } from './user/vistas/UserLoginVista'
import { UserInicioVista } from './user/vistas/UserInicioVista'
import { UserVehiculosVista } from './user/vistas/UserVehiculosVista'
import { UserTalleresVista } from './user/vistas/UserTalleresVista'
import { UserTurnosVista } from './user/vistas/UserTurnosVista'
import { UserPresupuestosVista } from './user/vistas/UserPresupuestosVista'
import { UserChatVista } from './user/vistas/UserChatVista'
import { UserChatHiloVista } from './user/vistas/UserChatHiloVista'
import { UserPerfilVista } from './user/vistas/UserPerfilVista'
import { UserIcon } from './user/UserIcon'
import { MecanicoPanel } from './mecanico/MecanicoPanel'

function App() {
  const [area_activa, setAreaActiva] = useState('usuario')
  const [user_autenticado, setUserAutenticado] = useState(false)
  const [mecanico_autenticado, setMecanicoAutenticado] = useState(false)
  const [user_vista_activa, setUserVistaActiva] = useState('inicio')
  const [user_tab_turnos, setUserTabTurnos] = useState('proximos')
  const [user_filtro_taller, setUserFiltroTaller] = useState('')
  const [user_chip_taller, setUserChipTaller] = useState('todos')
  const [user_hilo_chat, setUserHiloChat] = useState(null)

  const user_perfil = { nombre: 'Martin Fernandez', inicial: 'M' }

  const [user_vehiculos] = useState([
    {
      id: 1,
      marca: 'Volkswagen',
      modelo: 'Vento 2.0',
      patente: 'AB 123 CD',
      anio: 2019,
      km: 68450,
      salud: 82,
      proximo_servicio: 'Cambio de aceite y filtros',
      proximo_km: 70000,
      historial: [
        { fecha: '14 Jun 2026', servicio: 'Cambio de pastillas de freno', costo: 42000, taller: 'Taller Norte Motors' },
        { fecha: '02 Abr 2026', servicio: 'Cambio de aceite y filtro', costo: 28500, taller: 'Lubricentro Rex' },
        { fecha: '19 Ene 2026', servicio: 'Alineacion y balanceo', costo: 19000, taller: 'Taller Norte Motors' },
      ],
    },
    {
      id: 2,
      marca: 'Honda',
      modelo: 'CB 500F',
      patente: 'XYZ 789',
      anio: 2021,
      km: 15200,
      salud: 95,
      proximo_servicio: 'Lubricacion de cadena',
      proximo_km: 16000,
      historial: [
        { fecha: '20 May 2026', servicio: 'Cambio de aceite y filtro', costo: 21000, taller: 'MotoService Palermo' },
        { fecha: '11 Feb 2026', servicio: 'Cambio de cubiertas', costo: 65000, taller: 'MotoService Palermo' },
      ],
    },
  ])

  const [user_turnos] = useState([
    {
      id: 1,
      taller: 'Taller Norte Motors',
      servicio: 'Cambio de pastillas + revision',
      vehiculo: 'Vento - AB 123 CD',
      fecha: '08 JUL',
      hora: '10:30',
      estado: 'confirmado',
    },
    {
      id: 2,
      taller: 'Lubricentro Rex',
      servicio: 'Cambio de aceite y filtros',
      vehiculo: 'Vento - AB 123 CD',
      fecha: '22 JUL',
      hora: '09:00',
      estado: 'pendiente',
    },
  ])

  const [user_turnos_historial] = useState([
    {
      id: 3,
      taller: 'MotoService Palermo',
      servicio: 'Cambio de aceite y filtro',
      vehiculo: 'CB 500F - XYZ 789',
      fecha: '20 MAY',
      hora: '11:00',
      estado: 'completado',
    },
  ])

  const [user_presupuestos, setUserPresupuestos] = useState([
    {
      id: 1,
      taller: 'Taller Norte Motors',
      servicio: 'Cambio de amortiguadores traseros',
      vehiculo: 'Vento - AB 123 CD',
      estado: 'pendiente',
      total: 70000,
      items: [
        { detalle: 'Amortiguadores traseros', costo: 52000 },
        { detalle: 'Mano de obra', costo: 18000 },
      ],
    },
    {
      id: 2,
      taller: 'ElectroAuto SRL',
      servicio: 'Diagnostico luz check engine',
      vehiculo: 'Vento - AB 123 CD',
      estado: 'aceptado',
      total: 11000,
      items: [
        { detalle: 'Escaneo computarizado', costo: 8000 },
        { detalle: 'Informe tecnico', costo: 3000 },
      ],
    },
  ])

  const [user_chats, setUserChats] = useState([
    {
      id: 'ia',
      nombre: 'Asistente IA Asistigo',
      ia: true,
      ultimo: 'Contame que sintoma notas y te ayudo a interpretarlo.',
      hora: 'Ahora',
      mensajes: [
        {
          from: 'in',
          text: 'Hola Martin, soy tu asistente. Puedo ayudarte con sintomas, mantenimiento y alertas.',
          time: '09:12',
        },
      ],
    },
    {
      id: '1',
      nombre: 'Taller Norte Motors',
      ia: false,
      ultimo: 'Te confirmamos el turno del 8/7 a las 10:30.',
      hora: 'Ayer',
      mensajes: [
        { from: 'in', text: 'Recibimos tu solicitud de turno.', time: '11:02' },
        { from: 'out', text: 'Perfecto, gracias.', time: '11:05' },
      ],
    },
  ])

  const user_talleres = useMemo(
    () => [
      {
        id: 1,
        nombre: 'Taller Norte Motors',
        especialidad: 'Mecanica general y frenos',
        rating: 4.8,
        distancia: 1.2,
        abierto: true,
        tags: ['Frenos', 'Mecanica', 'Diagnostico'],
      },
      {
        id: 2,
        nombre: 'Lubricentro Rex',
        especialidad: 'Cambio de aceite express',
        rating: 4.6,
        distancia: 2,
        abierto: true,
        tags: ['Aceite', 'Filtros', 'Express'],
      },
      {
        id: 3,
        nombre: 'ElectroAuto SRL',
        especialidad: 'Electricidad y diagnostico',
        rating: 4.9,
        distancia: 2.8,
        abierto: false,
        tags: ['Electricidad', 'Scanner', 'Bateria'],
      },
    ],
    [],
  )

  const user_nav_items = [
    { id: 'inicio', label: 'Inicio', icono: 'home' },
    { id: 'vehiculos', label: 'Vehiculos', icono: 'car' },
    { id: 'talleres', label: 'Talleres', icono: 'wrench' },
    { id: 'turnos', label: 'Turnos', icono: 'calendar' },
    { id: 'chat', label: 'Chat', icono: 'chat' },
    { id: 'perfil', label: 'Perfil', icono: 'user' },
  ]

  const user_saludo = useMemo(() => {
    const hora = new Date().getHours()
    if (hora < 12) return 'Buen dia'
    if (hora < 19) return 'Buenas tardes'
    return 'Buenas noches'
  }, [])

  const user_talleres_filtrados = useMemo(() => {
    let lista = [...user_talleres]
    const q = user_filtro_taller.trim().toLowerCase()

    if (q) {
      lista = lista.filter(
        (t) => t.nombre.toLowerCase().includes(q) || t.especialidad.toLowerCase().includes(q),
      )
    }

    if (user_chip_taller === 'cercanos') lista.sort((a, b) => a.distancia - b.distancia)
    if (user_chip_taller === 'mejor calificados') lista.sort((a, b) => b.rating - a.rating)
    if (user_chip_taller === 'abiertos ahora') lista = lista.filter((t) => t.abierto)

    return lista
  }, [user_talleres, user_filtro_taller, user_chip_taller])

  const user_chat_activo = user_chats.find((c) => c.id === user_hilo_chat)

  const user_ir = (vista) => {
    setUserVistaActiva(vista)
    if (vista !== 'chat-hilo') setUserHiloChat(null)
  }

  const user_abrir_chat = (chatId) => {
    setUserHiloChat(chatId)
    setUserVistaActiva('chat-hilo')
  }

  const user_enviar_mensaje = (texto) => {
    const valor = texto.trim()
    if (!valor || !user_hilo_chat) return

    const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    setUserChats((prev) =>
      prev.map((chat) =>
        chat.id !== user_hilo_chat
          ? chat
          : {
              ...chat,
              ultimo: valor,
              hora: 'Ahora',
              mensajes: [...chat.mensajes, { from: 'out', text: valor, time: hora }],
            },
      ),
    )

    window.setTimeout(() => {
      setUserChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== user_hilo_chat) return chat
          const respuesta = chat.ia
            ? 'Segun lo que describes, te recomiendo agendar una revision general para prevenir fallas mayores.'
            : 'Gracias por el mensaje, en breve te respondemos.'
          return {
            ...chat,
            ultimo: respuesta,
            hora: 'Ahora',
            mensajes: [
              ...chat.mensajes,
              {
                from: 'in',
                text: respuesta,
                time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
              },
            ],
          }
        }),
      )
    }, 700)
  }

  const user_badge_estado = (estado) => {
    const textos = {
      confirmado: 'Confirmado',
      pendiente: 'Pendiente',
      completado: 'Completado',
      aceptado: 'Aceptado',
      rechazado: 'Rechazado',
    }

    return <span className={`user-etiqueta-estado user-etiqueta-estado-${estado}`}>{textos[estado] || estado}</span>
  }

  if (area_activa === 'mecanico') {
    return (
      <MecanicoPanel
        autenticado={mecanico_autenticado}
        onIngresar={() => setMecanicoAutenticado(true)}
        onCerrarSesion={() => setMecanicoAutenticado(false)}
        onCliente={() => setAreaActiva('usuario')}
      />
    )
  }

  if (!user_autenticado) {
    return (
      <UserLoginVista
        onIngresar={() => setUserAutenticado(true)}
        onElegirMecanico={() => setAreaActiva('mecanico')}
      />
    )
  }

  return (
    <div className="user-aplicacion">
      <aside className="user-lateral">
        <div className="user-marca user-marca-lateral">
          <span className="user-marca-punto" />
          <span>ASISTIGO</span>
        </div>

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
      </aside>

      <div className="user-principal">
        <header className="user-barra-superior">
          <div className="user-barra-superior-cuenta">
            <div className="user-avatar">{user_perfil.inicial}</div>
            <div>
              <p className="user-barra-superior-saludo">{user_saludo}</p>
              <p className="user-barra-superior-nombre">{user_perfil.nombre}</p>
            </div>
          </div>
          <div className="user-barra-acciones">
            <button className="user-boton-icono" type="button" aria-label="Notificaciones" onClick={() => user_ir('presupuestos')}>
              <UserIcon name="bell" size={18} />
              <span className="user-ping" />
            </button>
            <button className="user-boton user-boton-secundario user-boton-ia" type="button" onClick={() => user_abrir_chat('ia')}>
              <UserIcon name="spark" size={17} />
              <span>Asistente IA</span>
            </button>
          </div>
        </header>

        <main className="user-contenido">
          {user_vista_activa === 'inicio' && (
            <UserInicioVista
              vehiculo={user_vehiculos[0]}
              vehiculos={user_vehiculos}
              onIr={user_ir}
              onAbrirIA={() => user_abrir_chat('ia')}
            />
          )}

          {user_vista_activa === 'vehiculos' && <UserVehiculosVista vehiculos={user_vehiculos} />}

          {user_vista_activa === 'talleres' && (
            <UserTalleresVista
              valorBusqueda={user_filtro_taller}
              onCambiarBusqueda={setUserFiltroTaller}
              chipActivo={user_chip_taller}
              onCambiarChip={setUserChipTaller}
              talleres={user_talleres_filtrados}
              onIrTurnos={() => user_ir('turnos')}
            />
          )}

          {user_vista_activa === 'turnos' && (
            <UserTurnosVista
              tabActiva={user_tab_turnos}
              onCambiarTab={setUserTabTurnos}
              turnos={user_turnos}
              turnosHistorial={user_turnos_historial}
              badgeEstado={user_badge_estado}
            />
          )}

          {user_vista_activa === 'presupuestos' && (
            <UserPresupuestosVista
              presupuestos={user_presupuestos}
              badgeEstado={user_badge_estado}
              onCambiarEstado={(id, estado) =>
                setUserPresupuestos((prev) => prev.map((p) => (p.id === id ? { ...p, estado } : p)))
              }
            />
          )}

          {user_vista_activa === 'chat' && <UserChatVista chats={user_chats} onAbrirChat={user_abrir_chat} />}

          {user_vista_activa === 'chat-hilo' && user_chat_activo && (
            <UserChatHiloVista
              chat={user_chat_activo}
              onVolver={() => user_ir('chat')}
              onEnviar={user_enviar_mensaje}
            />
          )}

          {user_vista_activa === 'perfil' && (
            <UserPerfilVista
              perfil={user_perfil}
              vehiculos={user_vehiculos}
              onIr={user_ir}
              onCerrarSesion={() => setUserAutenticado(false)}
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
