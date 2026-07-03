import { useMemo, useState } from 'react'
import { MecanicoIcon } from './MecanicoIcon'

const mecanicoTaller = {
  nombre: 'Taller Norte Motors',
  inicial: 'TN',
  mecanico: 'Diego Torres',
  mecanicoInicial: 'D',
  correo: 'contacto@tallernorte.com',
  especialidad: 'Mecánica general · Frenos',
  direccion: 'Av. de las Instrucciones 2340, Montevideo',
  descripcion:
    'Más de 15 años de experiencia en mecánica general, frenos y suspensión. Diagnóstico computarizado y atención personalizada.',
}

const mecanicoSolicitudesIniciales = [
  {
    id: 1,
    tipo: 'turno',
    cliente: 'Martín Fernández',
    vehiculo: 'VW Vento 2019 · AB 123 CD',
    mensaje: 'Necesito cambiar las pastillas de freno delanteras, hacen ruido al frenar.',
    fecha: 'Hoy, 08:40',
    estado: 'nueva',
  },
  {
    id: 2,
    tipo: 'presupuesto',
    cliente: 'Lucía Ramírez',
    vehiculo: 'Ford Fiesta 2018 · FR 445 KL',
    mensaje: 'Quisiera un presupuesto para cambio de amortiguadores traseros.',
    fecha: 'Hoy, 07:15',
    estado: 'nueva',
  },
  {
    id: 3,
    tipo: 'turno',
    cliente: 'Sebastián Paz',
    vehiculo: 'Honda CB 500F · XYZ 789',
    mensaje: 'Necesito revisión y lubricación de cadena, ya está por vencer el service.',
    fecha: 'Ayer, 18:20',
    estado: 'nueva',
  },
  {
    id: 4,
    tipo: 'presupuesto',
    cliente: 'Carla Núñez',
    vehiculo: 'Peugeot 208 2020 · PG 902 AB',
    mensaje: 'El auto vibra al acelerar arriba de 80km/h, quisiera un diagnóstico.',
    fecha: 'Ayer, 12:05',
    estado: 'respondida',
  },
]

const mecanicoAgendaInicial = [
  { id: 1, cliente: 'Martín Fernández', vehiculo: 'VW Vento · AB 123 CD', servicio: 'Cambio de pastillas + revisión', dia: 0, hora: '10:30', estado: 'confirmado' },
  { id: 2, cliente: 'Rocío Beltrán', vehiculo: 'Chevrolet Onix · CB 556 QT', servicio: 'Alineación y balanceo', dia: 0, hora: '13:00', estado: 'confirmado' },
  { id: 3, cliente: 'Lucía Ramírez', vehiculo: 'Ford Fiesta · FR 445 KL', servicio: 'Cambio de amortiguadores', dia: 1, hora: '09:15', estado: 'pendiente' },
  { id: 4, cliente: 'Sebastián Paz', vehiculo: 'Honda CB 500F · XYZ 789', servicio: 'Lubricación de cadena', dia: 2, hora: '11:00', estado: 'confirmado' },
  { id: 5, cliente: 'Martín Fernández', vehiculo: 'VW Vento · AB 123 CD', servicio: 'Cambio de aceite y filtros', dia: 4, hora: '09:00', estado: 'pendiente' },
]

const mecanicoClientesIniciales = [
  {
    id: 1,
    nombre: 'Martín Fernández',
    vehiculo: 'VW Vento 2019',
    patente: 'AB 123 CD',
    km: 68450,
    visitas: 4,
    historial: [
      { fecha: '14 Jun 2026', servicio: 'Cambio de pastillas de freno', km: 66200, costo: 42000, etiquetas: ['Frenos'] },
      { fecha: '19 Ene 2026', servicio: 'Alineación y balanceo', km: 57800, costo: 19000, etiquetas: ['Neumáticos'] },
    ],
    diagnosticos: [
      {
        fecha: '14 Jun 2026',
        descripcion:
          'Pastillas delanteras con desgaste al 90%. Discos en buen estado, sin necesidad de rectificado. Se recomienda revisión de líquido de frenos en el próximo service.',
      },
    ],
    fotos: [{ servicio: 'Cambio de pastillas de freno', antes: true, despues: true }],
    telefono: '099 123 456',
    correo: 'martin.fernandez@mail.com',
  },
  {
    id: 2,
    nombre: 'Lucía Ramírez',
    vehiculo: 'Ford Fiesta 2018',
    patente: 'FR 445 KL',
    km: 81200,
    visitas: 2,
    historial: [{ fecha: '02 Mar 2026', servicio: 'Cambio de aceite y filtro', km: 78000, costo: 24000, etiquetas: ['Aceite'] }],
    diagnosticos: [],
    fotos: [],
    telefono: '098 654 321',
    correo: 'lucia.ramirez@mail.com',
  },
  {
    id: 3,
    nombre: 'Sebastián Paz',
    vehiculo: 'Honda CB 500F 2021',
    patente: 'XYZ 789',
    km: 15200,
    visitas: 3,
    historial: [
      { fecha: '20 May 2026', servicio: 'Cambio de aceite y filtro', km: 13800, costo: 21000, etiquetas: ['Aceite'] },
      { fecha: '11 Feb 2026', servicio: 'Cambio de cubiertas', km: 10500, costo: 65000, etiquetas: ['Neumáticos'] },
    ],
    diagnosticos: [],
    fotos: [{ servicio: 'Cambio de cubiertas', antes: true, despues: true }],
    telefono: '097 321 654',
    correo: 'sebastian.paz@mail.com',
  },
  {
    id: 4,
    nombre: 'Rocío Beltrán',
    vehiculo: 'Chevrolet Onix 2022',
    patente: 'CB 556 QT',
    km: 22300,
    visitas: 1,
    historial: [{ fecha: '28 Abr 2026', servicio: 'Alineación y balanceo', km: 20100, costo: 18000, etiquetas: ['Neumáticos'] }],
    diagnosticos: [],
    fotos: [],
    telefono: '096 789 123',
    correo: 'rocio.beltran@mail.com',
  },
  {
    id: 5,
    nombre: 'Carla Núñez',
    vehiculo: 'Peugeot 208 2020',
    patente: 'PG 902 AB',
    km: 41850,
    visitas: 2,
    historial: [{ fecha: '30 Ene 2026', servicio: 'Diagnóstico de vibración', km: 39900, costo: 9000, etiquetas: ['Diagnóstico'] }],
    diagnosticos: [
      {
        fecha: '30 Ene 2026',
        descripcion: 'Vibración asociada a desbalanceo de rueda delantera derecha. Se realizó balanceo, se recomienda control en 5.000 km.',
      },
    ],
    fotos: [],
    telefono: '095 456 789',
    correo: 'carla.nunez@mail.com',
  },
]

const mecanicoServiciosIniciales = [
  { id: 1, nombre: 'Cambio de aceite y filtro', categoria: 'Mantenimiento', precio: 24000, duracion: '40 min' },
  { id: 2, nombre: 'Cambio de pastillas de freno', categoria: 'Frenos', precio: 38000, duracion: '1h' },
  { id: 3, nombre: 'Alineación y balanceo', categoria: 'Neumáticos', precio: 18000, duracion: '45 min' },
  { id: 4, nombre: 'Diagnóstico computarizado', categoria: 'Diagnóstico', precio: 9000, duracion: '30 min' },
  { id: 5, nombre: 'Cambio de amortiguadores (par)', categoria: 'Suspensión', precio: 70000, duracion: '2h' },
  { id: 6, nombre: 'Revisión general pre-VTV', categoria: 'Inspección', precio: 15000, duracion: '50 min' },
]

const mecanicoPresupuestosIniciales = [
  {
    id: 1,
    cliente: 'Lucía Ramírez',
    vehiculo: 'Ford Fiesta · FR 445 KL',
    estado: 'pendiente',
    items: [
      { detalle: 'Amortiguadores traseros (par)', costo: 54000 },
      { detalle: 'Mano de obra', costo: 16000 },
    ],
    total: 70000,
  },
  {
    id: 2,
    cliente: 'Carla Núñez',
    vehiculo: 'Peugeot 208 · PG 902 AB',
    estado: 'aceptado',
    items: [
      { detalle: 'Escaneo computarizado', costo: 8000 },
      { detalle: 'Informe técnico', costo: 3000 },
    ],
    total: 11000,
  },
  {
    id: 3,
    cliente: 'Martín Fernández',
    vehiculo: 'VW Vento · AB 123 CD',
    estado: 'rechazado',
    items: [
      { detalle: 'Kit de distribución', costo: 48000 },
      { detalle: 'Mano de obra', costo: 22000 },
    ],
    total: 70000,
  },
]

const mecanicoChatsIniciales = [
  {
    id: 1,
    nombre: 'Martín Fernández',
    ultimo: 'Perfecto, ¿tienen disponibilidad el martes por la mañana?',
    hora: 'Ayer',
    sinLeer: true,
    mensajes: [
      { de: 'entrada', texto: 'Hola, recibí su presupuesto para el cambio de pastillas.', hora: '11:02' },
      { de: 'salida', texto: 'Hola Martín, sí, quedó confirmado el turno del 8/7 a las 10:30hs.', hora: '11:05' },
      { de: 'entrada', texto: 'Perfecto, ¿tienen disponibilidad el martes por la mañana?', hora: '11:07' },
    ],
  },
  {
    id: 2,
    nombre: 'Lucía Ramírez',
    ultimo: 'Genial, muchas gracias por el presupuesto.',
    hora: 'Lunes',
    sinLeer: false,
    mensajes: [
      { de: 'salida', texto: 'Hola! Le dejamos el presupuesto del cambio de amortiguadores.', hora: '10:00' },
      { de: 'entrada', texto: 'Genial, muchas gracias por el presupuesto.', hora: '10:14' },
    ],
  },
  {
    id: 3,
    nombre: 'Sebastián Paz',
    ultimo: 'Dale, te aviso cuando esté listo.',
    hora: 'Lunes',
    sinLeer: false,
    mensajes: [{ de: 'salida', texto: 'Dale, te aviso cuando esté listo.', hora: '09:30' }],
  },
]

const mecanicoHorariosIniciales = [
  { dia: 'Lunes', abre: '08:30', cierra: '18:00', activo: true },
  { dia: 'Martes', abre: '08:30', cierra: '18:00', activo: true },
  { dia: 'Miércoles', abre: '08:30', cierra: '18:00', activo: true },
  { dia: 'Jueves', abre: '08:30', cierra: '18:00', activo: true },
  { dia: 'Viernes', abre: '08:30', cierra: '17:00', activo: true },
  { dia: 'Sábado', abre: '09:00', cierra: '13:00', activo: true },
  { dia: 'Domingo', abre: '', cierra: '', activo: false },
]

const mecanicoNavegacion = [
  { id: 'inicio', etiqueta: 'Inicio', icono: 'inicio' },
  { id: 'solicitudes', etiqueta: 'Solicitudes', icono: 'solicitudes', contador: 'solicitudes' },
  { id: 'agenda', etiqueta: 'Agenda', icono: 'agenda' },
  { id: 'clientes', etiqueta: 'Clientes', icono: 'clientes' },
  { id: 'servicios', etiqueta: 'Servicios', icono: 'servicios' },
  { id: 'presupuestos', etiqueta: 'Presupuestos', icono: 'presupuestos' },
  { id: 'estadisticas', etiqueta: 'Estadísticas', icono: 'estadisticas' },
  { id: 'chat', etiqueta: 'Chat', icono: 'chat', contador: 'chat' },
  { id: 'perfil', etiqueta: 'Perfil', icono: 'perfil' },
]

const mecanicoNavegacionMovil = ['inicio', 'solicitudes', 'agenda', 'clientes', 'perfil']

function mecanicoFormatoMoneda(valor) {
  return `$${valor.toLocaleString('es-AR')}`
}

function mecanicoTextoEstado(estado) {
  const mapa = {
    confirmado: 'Confirmado',
    pendiente: 'Pendiente',
    completado: 'Completado',
    aceptado: 'Aceptado',
    rechazado: 'Rechazado',
    nueva: 'Nueva',
    respondida: 'Respondida',
  }
  return mapa[estado] || estado
}

function MecanicoBadge({ estado }) {
  return <span className={`mecanico-insignia mecanico-insignia-${estado}`}>{mecanicoTextoEstado(estado)}</span>
}

function MecanicoBoton({ tipo = 'fantasma', compacto = false, bloque = false, children, onClick, submit = false }) {
  return (
    <button
      className={`mecanico-boton mecanico-boton-${tipo} ${compacto ? 'mecanico-boton-compacto' : ''} ${bloque ? 'mecanico-boton-bloque' : ''}`}
      type={submit ? 'submit' : 'button'}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function MecanicoLogin({ onIngresar, onCliente }) {
  return (
    <section className="mecanico-login">
      <div className="mecanico-login-contenido">
        <div className="mecanico-marca">
          <span className="mecanico-marca-punto" />
          <span>ASISTIGO</span>
        </div>
        <p className="mecanico-marca-etiqueta">Panel de talleres</p>
        <h1 className="mecanico-login-titulo">Tu taller, siempre organizado.</h1>
        <p className="mecanico-login-subtitulo">Ingresá para gestionar solicitudes, agenda e historial de tus clientes.</p>
        <form
          className="mecanico-formulario"
          onSubmit={(evento) => {
            evento.preventDefault()
            onIngresar()
          }}
        >
          <label className="mecanico-etiqueta">Correo electrónico</label>
          <input className="mecanico-entrada" type="email" defaultValue="contacto@tallernorte.com" />
          <label className="mecanico-etiqueta">Contraseña</label>
          <input className="mecanico-entrada" type="password" defaultValue="asistigo123" />
          <MecanicoBoton tipo="primario" bloque submit>
            Ingresar
          </MecanicoBoton>
        </form>
        <button className="mecanico-login-alterno" type="button" onClick={onCliente}>
          Entrar como cliente
        </button>
      </div>
      <p className="mecanico-login-pie">Asistigo · Panel del mecánico</p>
    </section>
  )
}

function MecanicoKpi({ icono, valor, etiqueta, delta }) {
  return (
    <article className="mecanico-kpi-tarjeta">
      <span className="mecanico-kpi-icono">
        <MecanicoIcon nombre={icono} tamano={18} />
      </span>
      <p className="mecanico-kpi-valor">{valor}</p>
      <p className="mecanico-kpi-etiqueta">{etiqueta}</p>
      <p className="mecanico-kpi-delta">
        <MecanicoIcon nombre="check" tamano={11} />
        {delta}
      </p>
    </article>
  )
}

function MecanicoSolicitudTarjeta({ solicitud, onAccion, onChat, onDescartar }) {
  return (
    <article className={`mecanico-solicitud-tarjeta ${solicitud.estado === 'nueva' ? 'mecanico-solicitud-nueva' : ''}`}>
      <span className="mecanico-solicitud-icono">
        <MecanicoIcon nombre={solicitud.tipo === 'turno' ? 'agenda' : 'presupuestos'} tamano={21} />
      </span>
      <div className="mecanico-solicitud-cuerpo">
        <div className="mecanico-solicitud-superior">
          <p className="mecanico-solicitud-titulo">
            {solicitud.tipo === 'turno' ? 'Pedido de turno' : 'Pedido de presupuesto'} · {solicitud.cliente}
          </p>
          <span className="mecanico-solicitud-fecha">{solicitud.fecha}</span>
        </div>
        <p className="mecanico-solicitud-subtitulo">{solicitud.vehiculo}</p>
        <p className="mecanico-solicitud-mensaje">"{solicitud.mensaje}"</p>
        <div className="mecanico-solicitud-acciones">
          {solicitud.estado === 'nueva' ? (
            <>
              <MecanicoBoton tipo="primario" compacto onClick={() => onAccion(solicitud)}>
                {solicitud.tipo === 'turno' ? 'Confirmar turno' : 'Enviar presupuesto'}
              </MecanicoBoton>
              <MecanicoBoton compacto onClick={onChat}>
                Responder en chat
              </MecanicoBoton>
              <MecanicoBoton tipo="borde" compacto onClick={() => onDescartar(solicitud.id)}>
                Descartar
              </MecanicoBoton>
            </>
          ) : (
            <MecanicoBadge estado={solicitud.estado} />
          )}
        </div>
      </div>
    </article>
  )
}

function MecanicoTurnoFila({ turno, onChat, onConfirmar }) {
  return (
    <article className="mecanico-turno-fila">
      <div className="mecanico-turno-hora">
        <b>{turno.hora}</b>
        <span>hs</span>
      </div>
      <div className="mecanico-turno-linea" />
      <div className="mecanico-turno-cuerpo">
        <div className="mecanico-turno-superior">
          <p className="mecanico-turno-titulo">{turno.servicio}</p>
          <MecanicoBadge estado={turno.estado} />
        </div>
        <p className="mecanico-turno-subtitulo">
          {turno.cliente} · {turno.vehiculo}
        </p>
        <div className="mecanico-turno-acciones">
          <MecanicoBoton compacto onClick={onChat}>
            Chat
          </MecanicoBoton>
          {turno.estado === 'pendiente' ? (
            <MecanicoBoton tipo="borde" compacto onClick={() => onConfirmar(turno.id)}>
              Confirmar
            </MecanicoBoton>
          ) : (
            <MecanicoBoton tipo="borde" compacto>
              Marcar completado
            </MecanicoBoton>
          )}
        </div>
      </div>
    </article>
  )
}

function MecanicoPresupuestoTarjeta({ presupuesto, onChat }) {
  return (
    <article className="mecanico-presupuesto-tarjeta">
      <div className="mecanico-presupuesto-superior">
        <div>
          <p className="mecanico-linea-titulo">{presupuesto.cliente}</p>
          <p className="mecanico-linea-subtitulo">{presupuesto.vehiculo}</p>
        </div>
        <MecanicoBadge estado={presupuesto.estado} />
      </div>
      <div className="mecanico-presupuesto-items">
        {presupuesto.items.map((item) => (
          <div className="mecanico-presupuesto-linea" key={item.detalle}>
            <span>{item.detalle}</span>
            <b>{mecanicoFormatoMoneda(item.costo)}</b>
          </div>
        ))}
      </div>
      <div className="mecanico-presupuesto-total">
        <span>Total estimado</span>
        <strong>{mecanicoFormatoMoneda(presupuesto.total)}</strong>
      </div>
      <MecanicoBoton bloque compacto onClick={onChat}>
        Ir al chat con el cliente
      </MecanicoBoton>
    </article>
  )
}

function MecanicoPanelPrincipal({ onCerrarSesion }) {
  const [vista, setVista] = useState('inicio')
  const [solicitudes, setSolicitudes] = useState(mecanicoSolicitudesIniciales)
  const [agenda, setAgenda] = useState(mecanicoAgendaInicial)
  const [clientes, setClientes] = useState(mecanicoClientesIniciales)
  const [servicios, setServicios] = useState(mecanicoServiciosIniciales)
  const [presupuestos, setPresupuestos] = useState(mecanicoPresupuestosIniciales)
  const [chats, setChats] = useState(mecanicoChatsIniciales)
  const [horarios, setHorarios] = useState(mecanicoHorariosIniciales)
  const [filtroSolicitudes, setFiltroSolicitudes] = useState('todas')
  const [diaAgenda, setDiaAgenda] = useState(0)
  const [busquedaClientes, setBusquedaClientes] = useState('')
  const [clienteSeleccionado, setClienteSeleccionado] = useState(1)
  const [pestanaVehiculo, setPestanaVehiculo] = useState('historial')
  const [chatActivo, setChatActivo] = useState(null)
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState('')
  const [presupuestoDraft, setPresupuestoDraft] = useState({ cliente: '', vehiculo: '', items: [{ detalle: '', costo: '' }] })

  const solicitudesNuevas = solicitudes.filter((solicitud) => solicitud.estado === 'nueva').length
  const chatsSinLeer = chats.filter((chat) => chat.sinLeer).length
  const clienteActual = clientes.find((cliente) => cliente.id === clienteSeleccionado) || clientes[0]
  const chatActual = chats.find((chat) => chat.id === chatActivo)

  const saludo = useMemo(() => {
    const hora = new Date().getHours()
    if (hora < 12) return 'Buen día'
    if (hora < 19) return 'Buenas tardes'
    return 'Buenas noches'
  }, [])

  const mostrarToast = (mensaje) => {
    setToast(mensaje)
    window.setTimeout(() => setToast(''), 2600)
  }

  const ir = (id) => {
    setVista(id)
    if (id !== 'chat-hilo') setChatActivo(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const abrirChat = (id = chats[0].id) => {
    setChats((actuales) => actuales.map((chat) => (chat.id === id ? { ...chat, sinLeer: false } : chat)))
    setChatActivo(id)
    setVista('chat-hilo')
  }

  const contadorPara = (tipo) => {
    if (tipo === 'solicitudes') return solicitudesNuevas
    if (tipo === 'chat') return chatsSinLeer
    return 0
  }

  const abrirModalPresupuesto = (solicitud) => {
    const cliente = solicitud?.cliente || clientes[0].nombre
    const vehiculo = solicitud?.vehiculo || `${clientes[0].vehiculo} · ${clientes[0].patente}`
    setPresupuestoDraft({ cliente, vehiculo, items: [{ detalle: '', costo: '' }] })
    setModal({ tipo: 'presupuesto', solicitud })
  }

  const responderSolicitud = (solicitud) => {
    if (solicitud.tipo === 'turno') {
      setModal({ tipo: 'confirmar-turno', solicitud })
    } else {
      abrirModalPresupuesto(solicitud)
    }
  }

  const descartarSolicitud = (id) => {
    setSolicitudes((actuales) => actuales.filter((solicitud) => solicitud.id !== id))
    mostrarToast('Solicitud descartada')
  }

  const confirmarTurno = (id) => {
    setAgenda((actuales) => actuales.map((turno) => (turno.id === id ? { ...turno, estado: 'confirmado' } : turno)))
    mostrarToast('Turno confirmado')
  }

  const confirmarSolicitudTurno = (evento, solicitud) => {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    const fechaValor = String(datos.get('fecha') || '')
    const hora = String(datos.get('hora') || '—')
    let dia = 1
    if (fechaValor) {
      const elegida = new Date(`${fechaValor}T00:00:00`)
      const hoy = new Date(new Date().toDateString())
      dia = Math.max(0, Math.round((elegida - hoy) / 86400000))
    }
    setSolicitudes((actuales) => actuales.map((item) => (item.id === solicitud.id ? { ...item, estado: 'respondida' } : item)))
    setAgenda((actuales) => [
      { id: Date.now(), cliente: solicitud.cliente, vehiculo: solicitud.vehiculo, servicio: solicitud.mensaje.slice(0, 42), dia, hora, estado: 'confirmado' },
      ...actuales,
    ])
    setModal(null)
    mostrarToast('Turno confirmado y agregado a la agenda')
  }

  const actualizarItemPresupuesto = (indice, campo, valor) => {
    setPresupuestoDraft((actual) => ({
      ...actual,
      items: actual.items.map((item, itemIndice) => (itemIndice === indice ? { ...item, [campo]: valor } : item)),
    }))
  }

  const agregarItemPresupuesto = () => {
    setPresupuestoDraft((actual) => ({ ...actual, items: [...actual.items, { detalle: '', costo: '' }] }))
  }

  const totalPresupuestoDraft = presupuestoDraft.items.reduce((total, item) => total + (Number(item.costo) || 0), 0)

  const enviarPresupuesto = () => {
    const itemsValidos = presupuestoDraft.items.filter((item) => item.detalle.trim() && Number(item.costo) > 0)
    if (!itemsValidos.length) {
      mostrarToast('Agregá al menos un ítem con monto')
      return
    }
    const total = itemsValidos.reduce((suma, item) => suma + Number(item.costo), 0)
    setPresupuestos((actuales) => [
      {
        id: Date.now(),
        cliente: presupuestoDraft.cliente,
        vehiculo: presupuestoDraft.vehiculo,
        estado: 'pendiente',
        items: itemsValidos.map((item) => ({ detalle: item.detalle, costo: Number(item.costo) })),
        total,
      },
      ...actuales,
    ])
    const solicitud = modal?.solicitud
    if (solicitud) {
      setSolicitudes((actuales) => actuales.map((item) => (item.id === solicitud.id ? { ...item, estado: 'respondida' } : item)))
    }
    setModal(null)
    mostrarToast(`Presupuesto enviado a ${presupuestoDraft.cliente}`)
  }

  const agregarServicioRealizado = (evento) => {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    const servicioNombre = String(datos.get('servicio') || '')
    const km = Number(datos.get('km') || 0)
    const costo = Number(datos.get('costo') || 0)
    const categoria = servicios.find((servicio) => servicio.nombre === servicioNombre)?.categoria || 'General'
    const hoy = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
    setClientes((actuales) =>
      actuales.map((cliente) =>
        cliente.id === clienteSeleccionado
          ? {
              ...cliente,
              visitas: cliente.visitas + 1,
              km: km > cliente.km ? km : cliente.km,
              historial: [
                { fecha: hoy, servicio: servicioNombre, km: km || cliente.km, costo, etiquetas: [categoria] },
                ...cliente.historial,
              ],
            }
          : cliente,
      ),
    )
    setModal(null)
    mostrarToast('Servicio registrado en el historial')
  }

  const agregarTurnoManual = (evento) => {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    const cliente = clientes.find((item) => item.id === Number(datos.get('clienteId'))) || clientes[0]
    const servicio = String(datos.get('servicio') || '')
    const fechaValor = String(datos.get('fecha') || '')
    const hora = String(datos.get('hora') || '—')
    let dia = diaAgenda
    if (fechaValor) {
      const elegida = new Date(`${fechaValor}T00:00:00`)
      const hoy = new Date(new Date().toDateString())
      dia = Math.max(0, Math.round((elegida - hoy) / 86400000))
    }
    setAgenda((actuales) => [
      { id: Date.now(), cliente: cliente.nombre, vehiculo: `${cliente.vehiculo} · ${cliente.patente}`, servicio, dia, hora, estado: 'confirmado' },
      ...actuales,
    ])
    if (dia <= 6) setDiaAgenda(dia)
    setModal(null)
    mostrarToast('Turno agregado a la agenda')
  }

  const guardarServicioCatalogo = (evento) => {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    const nombre = String(datos.get('nombre') || '')
    const categoria = String(datos.get('categoria') || '')
    const precio = Number(datos.get('precio') || 0)
    const duracion = String(datos.get('duracion') || '')
    if (modal?.servicio) {
      setServicios((actuales) => actuales.map((servicio) => (servicio.id === modal.servicio.id ? { ...servicio, nombre, categoria, precio, duracion } : servicio)))
      mostrarToast('Servicio actualizado')
    } else {
      setServicios((actuales) => [...actuales, { id: Date.now(), nombre, categoria, precio, duracion }])
      mostrarToast('Servicio agregado al catálogo')
    }
    setModal(null)
  }

  const eliminarServicioCatalogo = (id) => {
    setServicios((actuales) => actuales.filter((servicio) => servicio.id !== id))
    setModal(null)
    mostrarToast('Servicio eliminado')
  }

  const agregarDiagnostico = () => {
    setClientes((actuales) =>
      actuales.map((cliente) =>
        cliente.id === clienteSeleccionado
          ? {
              ...cliente,
              diagnosticos: [
                {
                  fecha: 'Hoy',
                  descripcion: 'Diagnóstico guardado desde el panel. Se recomienda seguimiento en el próximo service.',
                },
                ...cliente.diagnosticos,
              ],
            }
          : cliente,
      ),
    )
    mostrarToast('Diagnóstico guardado')
  }

  const enviarMensaje = (evento) => {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    const texto = String(datos.get('mecanico-mensaje') || '').trim()
    if (!texto || !chatActivo) return
    const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    setChats((actuales) =>
      actuales.map((chat) =>
        chat.id === chatActivo
          ? {
              ...chat,
              ultimo: texto,
              hora: 'Ahora',
              mensajes: [...chat.mensajes, { de: 'salida', texto, hora }],
            }
          : chat,
      ),
    )
    evento.currentTarget.reset()
  }

  const solicitudesFiltradas = solicitudes.filter((solicitud) => {
    if (filtroSolicitudes === 'todas') return true
    if (filtroSolicitudes === 'respondidas') return solicitud.estado !== 'nueva'
    return solicitud.tipo === filtroSolicitudes
  })

  const clientesFiltrados = clientes.filter((cliente) => {
    const texto = `${cliente.nombre} ${cliente.vehiculo} ${cliente.patente}`.toLowerCase()
    return texto.includes(busquedaClientes.toLowerCase())
  })

  const turnosDelDia = agenda.filter((turno) => turno.dia === diaAgenda).sort((a, b) => a.hora.localeCompare(b.hora))
  const hoyTurnos = agenda.filter((turno) => turno.dia === 0)
  const actividadReciente = clientes
    .flatMap((cliente) => cliente.historial.map((item) => ({ ...item, cliente: cliente.nombre })))
    .slice(0, 4)
  const topServiciosMes = servicios.slice().sort((a, b) => b.precio - a.precio).slice(0, 4)
  const serviciosRealizadosTotal = clientes.reduce((total, cliente) => total + cliente.historial.length, 0)
  const kpis = [
    { icono: 'solicitudes', valor: solicitudesNuevas, etiqueta: 'Solicitudes nuevas', delta: '+2 hoy' },
    { icono: 'agenda', valor: hoyTurnos.length, etiqueta: 'Turnos para hoy', delta: '2 confirmados' },
    { icono: 'moneda', valor: '$182.500', etiqueta: 'Facturado esta semana', delta: '+12% vs. anterior' },
    { icono: 'estrella', valor: '4.8', etiqueta: 'Rating promedio', delta: '63 calificaciones' },
  ]

  const diasAgenda = Array.from({ length: 7 }, (_, indice) => {
    const fecha = new Date()
    fecha.setDate(fecha.getDate() + indice)
    const nombres = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']
    return { indice, numero: fecha.getDate(), dia: indice === 0 ? 'Hoy' : nombres[fecha.getDay()] }
  })

  return (
    <div className="mecanico-aplicacion">
      <aside className="mecanico-lateral">
        <div className="mecanico-marca mecanico-marca-lateral">
          <span className="mecanico-marca-punto" />
          <span>ASISTIGO</span>
        </div>
        <p className="mecanico-marca-etiqueta">Panel de talleres</p>
        <div className="mecanico-taller-lateral">
          <span className="mecanico-taller-icono">
            <MecanicoIcon nombre="servicios" tamano={19} />
          </span>
          <div>
            <p className="mecanico-taller-nombre">{mecanicoTaller.nombre}</p>
            <p className="mecanico-taller-estado">
              <i />
              Abierto ahora
            </p>
          </div>
        </div>
        <nav className="mecanico-menu-lateral">
          {mecanicoNavegacion.map((item) => {
            const contador = contadorPara(item.contador)
            return (
              <button
                className={`mecanico-menu-opcion ${vista === item.id ? 'mecanico-menu-opcion-activa' : ''}`}
                key={item.id}
                type="button"
                onClick={() => ir(item.id)}
              >
                <MecanicoIcon nombre={item.icono} tamano={19} />
                <span>{item.etiqueta}</span>
                {contador > 0 && <span className="mecanico-menu-contador">{contador}</span>}
              </button>
            )
          })}
        </nav>
        <div className="mecanico-lateral-divisor" />
        <p className="mecanico-lateral-pie">
          Diego Torres
          <span>Cuenta verificada</span>
          <button type="button" onClick={onCerrarSesion}>
            Cerrar sesión
          </button>
        </p>
      </aside>

      <div className="mecanico-principal">
        <header className="mecanico-barra-superior">
          <div className="mecanico-barra-cuenta">
            <div className="mecanico-avatar">{mecanicoTaller.mecanicoInicial}</div>
            <div>
              <p className="mecanico-barra-saludo">{saludo}</p>
              <p className="mecanico-barra-nombre">{mecanicoTaller.mecanico}</p>
            </div>
          </div>
          <div className="mecanico-busqueda-superior">
            <MecanicoIcon nombre="buscar" tamano={16} />
            <input type="text" placeholder="Buscar cliente, patente o servicio..." onChange={(evento) => setBusquedaClientes(evento.target.value)} />
          </div>
          <div className="mecanico-barra-acciones">
            <button className="mecanico-boton-icono" type="button" onClick={() => setModal({ tipo: 'notificaciones' })} aria-label="Notificaciones">
              <MecanicoIcon nombre="campana" tamano={18} />
              {solicitudesNuevas > 0 && <span className="mecanico-punto-alerta" />}
            </button>
            <button className="mecanico-boton-icono mecanico-boton-icono-naranja" type="button" onClick={() => ir('chat')} aria-label="Chat">
              <MecanicoIcon nombre="chat" tamano={18} />
            </button>
            <MecanicoBoton tipo="primario" compacto onClick={() => setModal({ tipo: 'registrar-servicio' })}>
              <MecanicoIcon nombre="mas" tamano={15} />
              <span>Registrar servicio</span>
            </MecanicoBoton>
          </div>
        </header>

        <main className="mecanico-contenido">
          {vista === 'inicio' && (
            <section className="mecanico-vista">
              <p className="mecanico-titulo-pagina">Panel general</p>
              <p className="mecanico-subtitulo-pagina">
                Así viene el día en <b>{mecanicoTaller.nombre}</b>.
              </p>
              <div className="mecanico-kpi-grilla">
                {kpis.map((kpi) => (
                  <MecanicoKpi key={kpi.etiqueta} {...kpi} />
                ))}
              </div>
              <div className="mecanico-inicio-grilla">
                <div>
                  <div className="mecanico-seccion">
                    <div className="mecanico-seccion-cabecera">
                      <h2 className="mecanico-titulo-seccion">Solicitudes nuevas</h2>
                      <button className="mecanico-enlace-seccion" type="button" onClick={() => ir('solicitudes')}>
                        Ver todo
                      </button>
                    </div>
                    {solicitudes
                      .filter((solicitud) => solicitud.estado === 'nueva')
                      .slice(0, 2)
                      .map((solicitud) => (
                        <MecanicoSolicitudTarjeta
                          key={solicitud.id}
                          solicitud={solicitud}
                          onAccion={responderSolicitud}
                          onChat={() => abrirChat()}
                          onDescartar={descartarSolicitud}
                        />
                      ))}
                  </div>
                  <div className="mecanico-seccion">
                    <div className="mecanico-seccion-cabecera">
                      <h2 className="mecanico-titulo-seccion">Agenda de hoy</h2>
                      <button className="mecanico-enlace-seccion" type="button" onClick={() => ir('agenda')}>
                        Ver agenda
                      </button>
                    </div>
                    {hoyTurnos.map((turno) => (
                      <MecanicoTurnoFila key={turno.id} turno={turno} onChat={() => abrirChat()} onConfirmar={confirmarTurno} />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mecanico-seccion">
                    <div className="mecanico-seccion-cabecera">
                      <h2 className="mecanico-titulo-seccion">Actividad reciente</h2>
                    </div>
                    <div className="mecanico-tarjeta">
                      {actividadReciente.length ? (
                        actividadReciente.map((item, indice) => (
                          <div className="mecanico-actividad-fila" key={`${item.cliente}-${item.fecha}-${indice}`}>
                            <span className="mecanico-celda-icono">
                              <MecanicoIcon nombre="servicios" tamano={16} />
                            </span>
                            <div>
                              <p className="mecanico-linea-titulo">{item.servicio}</p>
                              <p className="mecanico-linea-subtitulo">
                                {item.cliente} · {item.fecha}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="mecanico-linea-subtitulo">Sin actividad reciente</p>
                      )}
                    </div>
                  </div>
                  <div className="mecanico-seccion">
                    <div className="mecanico-seccion-cabecera">
                      <h2 className="mecanico-titulo-seccion">Top servicios del mes</h2>
                    </div>
                    <div className="mecanico-tarjeta">
                      {topServiciosMes.map((servicio, indice) => (
                        <div className="mecanico-renglon-rank" key={servicio.id}>
                          <span>{indice + 1}. {servicio.nombre}</span>
                          <b>{mecanicoFormatoMoneda(servicio.precio)}</b>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {vista === 'solicitudes' && (
            <section className="mecanico-vista">
              <div className="mecanico-seccion-cabecera">
                <div>
                  <p className="mecanico-titulo-pagina">Solicitudes</p>
                  <p className="mecanico-subtitulo-pagina">Pedidos de turno y presupuesto que llegaron de tus clientes.</p>
                </div>
              </div>
              <div className="mecanico-chips">
                {['todas', 'turno', 'presupuesto', 'respondidas'].map((chip) => (
                  <button
                    className={`mecanico-chip ${filtroSolicitudes === chip ? 'mecanico-chip-activo' : ''}`}
                    type="button"
                    key={chip}
                    onClick={() => setFiltroSolicitudes(chip)}
                  >
                    {chip[0].toUpperCase() + chip.slice(1)}
                  </button>
                ))}
              </div>
              {solicitudesFiltradas.length ? (
                solicitudesFiltradas.map((solicitud) => (
                  <MecanicoSolicitudTarjeta
                    key={solicitud.id}
                    solicitud={solicitud}
                    onAccion={responderSolicitud}
                    onChat={() => abrirChat()}
                    onDescartar={descartarSolicitud}
                  />
                ))
              ) : (
                <div className="mecanico-vacio">
                  <MecanicoIcon nombre="solicitudes" tamano={36} />
                  <p>No hay solicitudes en esta categoría</p>
                </div>
              )}
            </section>
          )}

          {vista === 'agenda' && (
            <section className="mecanico-vista">
              <div className="mecanico-seccion-cabecera">
                <div>
                  <p className="mecanico-titulo-pagina">Agenda</p>
                  <p className="mecanico-subtitulo-pagina">Turnos confirmados y pendientes de tu taller.</p>
                </div>
                <MecanicoBoton tipo="primario" compacto onClick={() => setModal({ tipo: 'agregar-turno' })}>
                  <MecanicoIcon nombre="mas" tamano={15} />
                  Agregar turno
                </MecanicoBoton>
              </div>
              <div className="mecanico-agenda-dias">
                {diasAgenda.map((dia) => (
                  <button
                    className={`mecanico-agenda-dia ${diaAgenda === dia.indice ? 'mecanico-agenda-dia-activo' : ''}`}
                    type="button"
                    key={dia.indice}
                    onClick={() => setDiaAgenda(dia.indice)}
                  >
                    <span>{dia.dia}</span>
                    <b>{dia.numero}</b>
                    {agenda.some((turno) => turno.dia === dia.indice) && <i />}
                  </button>
                ))}
              </div>
              {turnosDelDia.length ? (
                turnosDelDia.map((turno) => <MecanicoTurnoFila key={turno.id} turno={turno} onChat={() => abrirChat()} onConfirmar={confirmarTurno} />)
              ) : (
                <div className="mecanico-vacio">
                  <MecanicoIcon nombre="agenda" tamano={36} />
                  <p>No hay turnos agendados para este día</p>
                </div>
              )}
            </section>
          )}

          {vista === 'clientes' && (
            <section className="mecanico-vista">
              <p className="mecanico-titulo-pagina">Clientes y vehículos</p>
              <p className="mecanico-subtitulo-pagina">Historial completo de cada vehículo que pasó por tu taller.</p>
              <div className="mecanico-busqueda-fila">
                <div className="mecanico-busqueda-caja">
                  <MecanicoIcon nombre="buscar" tamano={18} />
                  <input
                    value={busquedaClientes}
                    type="text"
                    placeholder="Buscar por nombre, patente o modelo..."
                    onChange={(evento) => setBusquedaClientes(evento.target.value)}
                  />
                </div>
              </div>
              <div className="mecanico-tabla-contenedor">
                <table className="mecanico-tabla">
                  <thead>
                    <tr>
                      <th>Cliente / vehículo</th>
                      <th>Último servicio</th>
                      <th>Km</th>
                      <th>Visitas</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {clientesFiltrados.map((cliente) => (
                      <tr
                        className="mecanico-fila-clicable"
                        key={cliente.id}
                        onClick={() => {
                          setClienteSeleccionado(cliente.id)
                          setPestanaVehiculo('historial')
                          ir('vehiculo-detalle')
                        }}
                      >
                        <td>
                          <div className="mecanico-celda-principal">
                            <span className="mecanico-celda-icono">
                              <MecanicoIcon nombre="auto" tamano={16} />
                            </span>
                            <div>
                              <p className="mecanico-celda-titulo">{cliente.nombre}</p>
                              <p className="mecanico-celda-subtitulo">
                                {cliente.vehiculo} · {cliente.patente}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>{cliente.historial[0]?.servicio || 'Sin historial'}</td>
                        <td>{cliente.km.toLocaleString('es-AR')}</td>
                        <td>{cliente.visitas}</td>
                        <td>
                          <MecanicoBoton compacto>Ver ficha</MecanicoBoton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {vista === 'vehiculo-detalle' && (
            <section className="mecanico-vista">
              <MecanicoBoton compacto onClick={() => ir('clientes')}>
                <MecanicoIcon nombre="volver" tamano={15} />
                Volver a clientes
              </MecanicoBoton>
              <div className="mecanico-detalle-hero">
                <div className="mecanico-detalle-hero-superior">
                  <div>
                    <span className="mecanico-detalle-icono">
                      <MecanicoIcon nombre="auto" tamano={30} />
                    </span>
                    <h2>{clienteActual.vehiculo}</h2>
                    <p>{clienteActual.patente}</p>
                  </div>
                  <MecanicoBadge estado="confirmado" />
                </div>
                <div className="mecanico-detalle-estadisticas">
                  <div>
                    <b>{clienteActual.km.toLocaleString('es-AR')}</b>
                    <span>Km actuales</span>
                  </div>
                  <div>
                    <b>{clienteActual.visitas}</b>
                    <span>Visitas</span>
                  </div>
                  <div>
                    <b>{clienteActual.historial.length}</b>
                    <span>Servicios</span>
                  </div>
                </div>
              </div>
              <div className="mecanico-pestanas">
                {[
                  ['historial', 'Historial'],
                  ['diagnostico', 'Diagnóstico'],
                  ['fotos', 'Fotos antes / después'],
                  ['datos', 'Datos del cliente'],
                ].map(([id, etiqueta]) => (
                  <button className={`mecanico-pestana ${pestanaVehiculo === id ? 'mecanico-pestana-activa' : ''}`} type="button" key={id} onClick={() => setPestanaVehiculo(id)}>
                    {etiqueta}
                  </button>
                ))}
              </div>
              {pestanaVehiculo === 'historial' && (
                <div className="mecanico-linea-tiempo">
                  {clienteActual.historial.map((item) => (
                    <article className="mecanico-historial-item" key={`${item.fecha}-${item.servicio}`}>
                      <span className="mecanico-historial-punto" />
                      <div>
                        <p className="mecanico-linea-titulo">{item.servicio}</p>
                        <p className="mecanico-linea-subtitulo">
                          {item.fecha} · {item.km.toLocaleString('es-AR')} km · {mecanicoFormatoMoneda(item.costo)}
                        </p>
                        <div className="mecanico-etiquetas">
                          {item.etiquetas.map((etiqueta) => (
                            <span className="mecanico-etiqueta-mini" key={etiqueta}>{etiqueta}</span>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                  <MecanicoBoton tipo="primario" compacto onClick={() => setModal({ tipo: 'registrar-servicio' })}>
                    Registrar servicio realizado
                  </MecanicoBoton>
                </div>
              )}
              {pestanaVehiculo === 'diagnostico' && (
                <div className="mecanico-tarjeta">
                  <label className="mecanico-etiqueta">Nuevo diagnóstico</label>
                  <textarea className="mecanico-entrada mecanico-textarea" placeholder="Describí hallazgos, piezas revisadas y recomendaciones..." />
                  <MecanicoBoton tipo="primario" compacto onClick={agregarDiagnostico}>
                    Guardar diagnóstico
                  </MecanicoBoton>
                  {clienteActual.diagnosticos.map((diagnostico) => (
                    <div className="mecanico-diagnostico" key={`${diagnostico.fecha}-${diagnostico.descripcion}`}>
                      <b>{diagnostico.fecha}</b>
                      <p>{diagnostico.descripcion}</p>
                    </div>
                  ))}
                </div>
              )}
              {pestanaVehiculo === 'fotos' && (
                <div className="mecanico-tarjeta">
                  {clienteActual.fotos.length > 0 && (
                    <>
                      <p className="mecanico-etiqueta">Antes / después</p>
                      {clienteActual.fotos.map((foto) => (
                        <article className="mecanico-foto-par" key={foto.servicio}>
                          <p className="mecanico-linea-titulo">{foto.servicio}</p>
                          <div className="mecanico-foto-cajas">
                            <div className="mecanico-foto-caja-llena">
                              <MecanicoIcon nombre="camara" tamano={26} />
                              <span>Foto "antes" cargada</span>
                            </div>
                            <div className="mecanico-foto-caja-llena">
                              <MecanicoIcon nombre="camara" tamano={26} />
                              <span>Foto "después" cargada</span>
                            </div>
                          </div>
                        </article>
                      ))}
                    </>
                  )}
                  <p className="mecanico-etiqueta">Subir nuevas fotos</p>
                  <div className="mecanico-foto-cajas">
                    <button type="button" className="mecanico-foto-caja-subir" onClick={() => mostrarToast('Selector de archivos simulado (antes)')}>
                      <MecanicoIcon nombre="camara" tamano={26} />
                      <span>Subir foto "antes"</span>
                    </button>
                    <button type="button" className="mecanico-foto-caja-subir" onClick={() => mostrarToast('Selector de archivos simulado (después)')}>
                      <MecanicoIcon nombre="camara" tamano={26} />
                      <span>Subir foto "después"</span>
                    </button>
                  </div>
                </div>
              )}
              {pestanaVehiculo === 'datos' && (
                <div className="mecanico-tarjeta mecanico-datos-cliente">
                  <label className="mecanico-etiqueta">Nombre del cliente</label>
                  <input className="mecanico-entrada" value={clienteActual.nombre} readOnly />
                  <label className="mecanico-etiqueta">Teléfono</label>
                  <input className="mecanico-entrada" value={clienteActual.telefono} readOnly />
                  <label className="mecanico-etiqueta">Correo electrónico</label>
                  <input className="mecanico-entrada" value={clienteActual.correo} readOnly />
                  <label className="mecanico-etiqueta">Vehículo</label>
                  <input className="mecanico-entrada" value={`${clienteActual.vehiculo} · ${clienteActual.patente}`} readOnly />
                  <MecanicoBoton bloque onClick={() => abrirChat()}>
                    <MecanicoIcon nombre="chat" tamano={16} />
                    Contactar por chat
                  </MecanicoBoton>
                </div>
              )}
            </section>
          )}

          {vista === 'servicios' && (
            <section className="mecanico-vista">
              <div className="mecanico-seccion-cabecera">
                <div>
                  <p className="mecanico-titulo-pagina">Servicios y precios</p>
                  <p className="mecanico-subtitulo-pagina">Catálogo que tus clientes ven al pedir presupuesto.</p>
                </div>
                <MecanicoBoton tipo="primario" compacto onClick={() => setModal({ tipo: 'nuevo-servicio' })}>
                  <MecanicoIcon nombre="mas" tamano={15} />
                  Nuevo servicio
                </MecanicoBoton>
              </div>
              <div className="mecanico-servicios-grilla">
                {servicios.map((servicio) => (
                  <article className="mecanico-servicio-tarjeta" key={servicio.id}>
                    <span className="mecanico-servicio-icono">
                      <MecanicoIcon nombre="servicios" tamano={22} />
                    </span>
                    <div className="mecanico-servicio-info">
                      <p>{servicio.nombre}</p>
                      <span>{servicio.categoria} · {servicio.duracion}</span>
                    </div>
                    <button className="mecanico-servicio-precio" type="button" onClick={() => setModal({ tipo: 'editar-servicio', servicio })}>
                      {mecanicoFormatoMoneda(servicio.precio)}
                      <span>editar</span>
                    </button>
                  </article>
                ))}
                <button className="mecanico-servicio-tarjeta mecanico-servicio-agregar" type="button" onClick={() => setModal({ tipo: 'nuevo-servicio' })}>
                  <MecanicoIcon nombre="mas" tamano={18} />
                  Agregar servicio
                </button>
              </div>
            </section>
          )}

          {vista === 'presupuestos' && (
            <section className="mecanico-vista">
              <div className="mecanico-seccion-cabecera">
                <div>
                  <p className="mecanico-titulo-pagina">Presupuestos</p>
                  <p className="mecanico-subtitulo-pagina">Presupuestos enviados a tus clientes.</p>
                </div>
                <MecanicoBoton tipo="primario" compacto onClick={() => abrirModalPresupuesto()}>
                  <MecanicoIcon nombre="mas" tamano={15} />
                  Nuevo presupuesto
                </MecanicoBoton>
              </div>
              <div className="mecanico-presupuesto-lista">
                {presupuestos.map((presupuesto) => (
                  <MecanicoPresupuestoTarjeta key={presupuesto.id} presupuesto={presupuesto} onChat={() => abrirChat()} />
                ))}
              </div>
            </section>
          )}

          {vista === 'estadisticas' && (
            <section className="mecanico-vista">
              <p className="mecanico-titulo-pagina">Estadísticas</p>
              <p className="mecanico-subtitulo-pagina">Cómo viene funcionando tu taller este mes.</p>
              <div className="mecanico-kpi-grilla">
                {[
                  { icono: 'moneda', valor: '$742.000', etiqueta: 'Facturado este mes', delta: '+8%' },
                  { icono: 'servicios', valor: '48', etiqueta: 'Servicios realizados', delta: '+6' },
                  { icono: 'clientes', valor: '86', etiqueta: 'Clientes activos', delta: '+14' },
                  { icono: 'presupuestos', valor: '71%', etiqueta: 'Presupuestos aceptados', delta: 'estable' },
                ].map((kpi) => <MecanicoKpi key={kpi.etiqueta} {...kpi} />)}
              </div>
              <div className="mecanico-estadisticas-grilla">
                <div>
                  <p className="mecanico-antetitulo">Facturación (últimos 6 meses)</p>
                  <div className="mecanico-grafico-tarjeta">
                    <div className="mecanico-barras">
                      {[
                        ['Feb', 70],
                        ['Mar', 82],
                        ['Abr', 65],
                        ['May', 93],
                        ['Jun', 99],
                        ['Jul', 100],
                      ].map(([mes, alto]) => (
                        <div className="mecanico-barra-columna" key={mes}>
                          <div className="mecanico-barra" style={{ height: `${alto}%` }} />
                          <span>{mes}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="mecanico-antetitulo">Servicios más pedidos</p>
                  <div className="mecanico-grafico-tarjeta">
                    {servicios.slice().sort((a, b) => b.precio - a.precio).slice(0, 5).map((servicio, indice) => (
                      <div className="mecanico-renglon-rank" key={servicio.id}>
                        <span>{indice + 1}. {servicio.nombre}</span>
                        <b>{mecanicoFormatoMoneda(servicio.precio)}</b>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mecanico-antetitulo">Origen de solicitudes</p>
                  <div className="mecanico-grafico-tarjeta">
                    <div className="mecanico-donut">
                      <svg viewBox="0 0 140 140">
                        <circle cx="70" cy="70" r="52" />
                        <circle cx="70" cy="70" r="52" className="mecanico-donut-segmento-a" />
                        <circle cx="70" cy="70" r="52" className="mecanico-donut-segmento-b" />
                        <circle cx="70" cy="70" r="52" className="mecanico-donut-segmento-c" />
                      </svg>
                      <div className="mecanico-donut-leyenda">
                        <p><span className="mecanico-donut-punto-a" /><span className="mecanico-donut-nombre">Búsqueda en la app</span><b>52%</b></p>
                        <p><span className="mecanico-donut-punto-b" /><span className="mecanico-donut-nombre">Clientes recurrentes</span><b>33%</b></p>
                        <p><span className="mecanico-donut-punto-c" /><span className="mecanico-donut-nombre">Recomendados</span><b>15%</b></p>
                      </div>
                    </div>
                  </div>
                  <p className="mecanico-antetitulo">Calificación promedio</p>
                  <div className="mecanico-grafico-tarjeta mecanico-rating">
                    <strong>4.8</strong>
                    <div>
                      {[1, 2, 3, 4, 5].map((numero) => <MecanicoIcon key={numero} nombre="estrella" tamano={22} />)}
                    </div>
                    <p>Basado en 63 calificaciones</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {vista === 'chat' && (
            <section className="mecanico-vista">
              <p className="mecanico-titulo-pagina">Chat</p>
              <p className="mecanico-subtitulo-pagina">Conversaciones con clientes de Asistigo.</p>
              <div className="mecanico-tarjeta mecanico-chat-lista">
                {chats.map((chat) => (
                  <button className="mecanico-chat-item" type="button" key={chat.id} onClick={() => abrirChat(chat.id)}>
                    <span className="mecanico-chat-avatar"><MecanicoIcon nombre="perfil" tamano={20} /></span>
                    <div>
                      <p>{chat.nombre}<span>{chat.hora}</span></p>
                      <small>{chat.ultimo}</small>
                    </div>
                    {chat.sinLeer && <i />}
                  </button>
                ))}
              </div>
            </section>
          )}

          {vista === 'chat-hilo' && chatActual && (
            <section className="mecanico-vista mecanico-chat-hilo">
              <div className="mecanico-chat-cabecera">
                <button className="mecanico-boton-icono" type="button" onClick={() => ir('chat')} aria-label="Volver">
                  <MecanicoIcon nombre="volver" tamano={18} />
                </button>
                <span className="mecanico-chat-avatar"><MecanicoIcon nombre="perfil" tamano={20} /></span>
                <div>
                  <p>{chatActual.nombre}</p>
                  <small>Cliente de Asistigo</small>
                </div>
              </div>
              <div className="mecanico-mensajes">
                {chatActual.mensajes.map((mensaje, indice) => (
                  <article className={`mecanico-mensaje mecanico-mensaje-${mensaje.de}`} key={`${mensaje.hora}-${indice}`}>
                    {mensaje.texto}
                    <span>{mensaje.hora}</span>
                  </article>
                ))}
              </div>
              <form className="mecanico-chat-envio" onSubmit={enviarMensaje}>
                <input name="mecanico-mensaje" placeholder="Escribí un mensaje" />
                <button className="mecanico-boton-icono mecanico-boton-icono-primario" type="submit" aria-label="Enviar">
                  <MecanicoIcon nombre="enviar" tamano={18} />
                </button>
              </form>
            </section>
          )}

          {vista === 'perfil' && (
            <section className="mecanico-vista">
              <div className="mecanico-perfil-cabecera">
                <div className="mecanico-avatar mecanico-avatar-grande">{mecanicoTaller.inicial}</div>
                <p className="mecanico-perfil-nombre">{mecanicoTaller.nombre}</p>
                <p className="mecanico-linea-subtitulo">{mecanicoTaller.correo}</p>
                <div className="mecanico-perfil-estadisticas">
                  <div>
                    <b>{serviciosRealizadosTotal}</b>
                    <span>Servicios realizados</span>
                  </div>
                  <div>
                    <b>{clientes.length}</b>
                    <span>Clientes</span>
                  </div>
                  <div>
                    <b>4.8</b>
                    <span>Rating</span>
                  </div>
                </div>
              </div>

              <div className="mecanico-seccion">
                <p className="mecanico-antetitulo">Perfil profesional</p>
                <form
                  className="mecanico-tarjeta"
                  onSubmit={(evento) => {
                    evento.preventDefault()
                    mostrarToast('Perfil actualizado')
                  }}
                >
                  <label className="mecanico-etiqueta">Nombre del taller</label>
                  <input className="mecanico-entrada" name="perfil-nombre" defaultValue={mecanicoTaller.nombre} />
                  <label className="mecanico-etiqueta">Especialidad</label>
                  <input className="mecanico-entrada" name="perfil-especialidad" defaultValue={mecanicoTaller.especialidad} />
                  <label className="mecanico-etiqueta">Dirección</label>
                  <input className="mecanico-entrada" name="perfil-direccion" defaultValue={mecanicoTaller.direccion} />
                  <label className="mecanico-etiqueta">Descripción</label>
                  <textarea className="mecanico-entrada mecanico-textarea" name="perfil-descripcion" defaultValue={mecanicoTaller.descripcion} />
                  <MecanicoBoton tipo="primario" submit>
                    Guardar cambios
                  </MecanicoBoton>
                </form>
              </div>

              <div className="mecanico-seccion">
                <p className="mecanico-antetitulo">Horarios de atención</p>
                <div className="mecanico-tarjeta">
                  {horarios.map((horario, indice) => (
                    <div className="mecanico-horario-fila" key={horario.dia}>
                      <span>{horario.dia}</span>
                      <div>
                        {horario.activo ? (
                          <>
                            <input className="mecanico-entrada" type="time" value={horario.abre} readOnly />
                            <small>a</small>
                            <input className="mecanico-entrada" type="time" value={horario.cierra} readOnly />
                          </>
                        ) : (
                          <p>Cerrado</p>
                        )}
                      </div>
                      <button
                        className={`mecanico-switch ${horario.activo ? 'mecanico-switch-activo' : ''}`}
                        type="button"
                        onClick={() =>
                          setHorarios((actuales) =>
                            actuales.map((item, itemIndice) => (itemIndice === indice ? { ...item, activo: !item.activo } : item)),
                          )
                        }
                        aria-label={`Cambiar horario ${horario.dia}`}
                      >
                        <span />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mecanico-seccion">
                <p className="mecanico-antetitulo">Cuenta</p>
                <div className="mecanico-menu-lista">
                  <button className="mecanico-menu-item" type="button" onClick={() => ir('servicios')}>
                    <span className="mecanico-menu-item-icono">
                      <MecanicoIcon nombre="servicios" tamano={18} />
                    </span>
                    <span className="mecanico-menu-item-texto">Servicios y precios</span>
                    <MecanicoIcon nombre="adelante" tamano={17} className="mecanico-menu-item-chev" />
                  </button>
                  <button className="mecanico-menu-item" type="button" onClick={() => mostrarToast('Próximamente disponible')}>
                    <span className="mecanico-menu-item-icono">
                      <MecanicoIcon nombre="moneda" tamano={18} />
                    </span>
                    <span className="mecanico-menu-item-texto">Facturación</span>
                    <MecanicoIcon nombre="adelante" tamano={17} className="mecanico-menu-item-chev" />
                  </button>
                  <button className="mecanico-menu-item" type="button" onClick={() => setModal({ tipo: 'notificaciones' })}>
                    <span className="mecanico-menu-item-icono">
                      <MecanicoIcon nombre="campana" tamano={18} />
                    </span>
                    <span className="mecanico-menu-item-texto">Notificaciones</span>
                    <MecanicoIcon nombre="adelante" tamano={17} className="mecanico-menu-item-chev" />
                  </button>
                </div>
              </div>

              <div className="mecanico-seccion">
                <p className="mecanico-antetitulo">Soporte</p>
                <div className="mecanico-menu-lista">
                  <button className="mecanico-menu-item" type="button" onClick={() => mostrarToast('Abriendo ayuda...')}>
                    <span className="mecanico-menu-item-icono">
                      <MecanicoIcon nombre="ayuda" tamano={18} />
                    </span>
                    <span className="mecanico-menu-item-texto">Ayuda y preguntas frecuentes</span>
                    <MecanicoIcon nombre="adelante" tamano={17} className="mecanico-menu-item-chev" />
                  </button>
                  <button className="mecanico-menu-item mecanico-menu-item-peligro" type="button" onClick={onCerrarSesion}>
                    <span className="mecanico-menu-item-icono">
                      <MecanicoIcon nombre="salir" tamano={18} />
                    </span>
                    <span className="mecanico-menu-item-texto">Cerrar sesión</span>
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>

        <nav className="mecanico-navegacion-movil">
          {mecanicoNavegacion.filter((item) => mecanicoNavegacionMovil.includes(item.id)).map((item) => {
            const contador = contadorPara(item.contador)
            return (
              <button
                className={`mecanico-navegacion-item ${vista === item.id ? 'mecanico-navegacion-item-activo' : ''}`}
                key={item.id}
                type="button"
                onClick={() => ir(item.id)}
              >
                {contador > 0 && <span className="mecanico-navegacion-contador">{contador}</span>}
                <MecanicoIcon nombre={item.icono} tamano={21} />
                <span>{item.etiqueta}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {modal && (
        <div className="mecanico-modal-fondo" role="presentation">
          <div className="mecanico-modal">
            <div className="mecanico-modal-cabecera">
              <h3>
                {modal.tipo === 'notificaciones' && 'Notificaciones'}
                {modal.tipo === 'confirmar-turno' && 'Confirmar turno'}
                {modal.tipo === 'presupuesto' && 'Nuevo presupuesto'}
                {modal.tipo === 'registrar-servicio' && 'Registrar servicio realizado'}
                {modal.tipo === 'agregar-turno' && 'Agregar turno'}
                {modal.tipo === 'nuevo-servicio' && 'Nuevo servicio'}
                {modal.tipo === 'editar-servicio' && 'Editar servicio'}
              </h3>
              <button className="mecanico-modal-cerrar" type="button" onClick={() => setModal(null)} aria-label="Cerrar">
                <MecanicoIcon nombre="cerrar" tamano={16} />
              </button>
            </div>
            {modal.tipo === 'notificaciones' && (
              <div className="mecanico-notificaciones">
                {[
                  ['solicitudes', 'Nueva solicitud de turno', 'Martín Fernández · cambio de pastillas'],
                  ['estrella', 'Nueva calificación recibida', 'Sebastián Paz te calificó con 5 estrellas'],
                  ['presupuestos', 'Presupuesto aceptado', 'Carla Núñez aceptó tu presupuesto'],
                ].map(([icono, titulo, detalle]) => (
                  <article className="mecanico-notificacion" key={titulo}>
                    <span className="mecanico-celda-icono"><MecanicoIcon nombre={icono} tamano={17} /></span>
                    <div>
                      <p>{titulo}</p>
                      <span>{detalle}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
            {modal.tipo === 'confirmar-turno' && (
              <form onSubmit={(evento) => confirmarSolicitudTurno(evento, modal.solicitud)}>
                <p className="mecanico-linea-subtitulo" style={{ margin: '-8px 0 16px' }}>
                  {modal.solicitud.cliente} · {modal.solicitud.vehiculo}
                </p>
                <div className="mecanico-modal-fila">
                  <div>
                    <label className="mecanico-etiqueta">Fecha</label>
                    <input className="mecanico-entrada" type="date" name="fecha" required />
                  </div>
                  <div>
                    <label className="mecanico-etiqueta">Hora</label>
                    <input className="mecanico-entrada" type="time" name="hora" required />
                  </div>
                </div>
                <label className="mecanico-etiqueta">Nota para el cliente (opcional)</label>
                <textarea className="mecanico-entrada mecanico-textarea" name="nota" placeholder="Ej: traer cédula verde del vehículo" />
                <div className="mecanico-modal-pie">
                  <MecanicoBoton onClick={() => setModal(null)}>Cancelar</MecanicoBoton>
                  <MecanicoBoton tipo="primario" submit>Confirmar turno</MecanicoBoton>
                </div>
              </form>
            )}
            {modal.tipo === 'presupuesto' && (
              <div>
                <label className="mecanico-etiqueta">Cliente</label>
                <select
                  className="mecanico-entrada"
                  value={presupuestoDraft.cliente}
                  onChange={(evento) => {
                    const clienteElegido = clientes.find((cliente) => cliente.nombre === evento.target.value)
                    setPresupuestoDraft((actual) => ({
                      ...actual,
                      cliente: evento.target.value,
                      vehiculo: clienteElegido ? `${clienteElegido.vehiculo} · ${clienteElegido.patente}` : actual.vehiculo,
                    }))
                  }}
                >
                  {clientes.map((cliente) => (
                    <option key={cliente.id}>{cliente.nombre}</option>
                  ))}
                </select>
                <label className="mecanico-etiqueta">Ítems del presupuesto</label>
                {presupuestoDraft.items.map((item, indice) => (
                  <div className="mecanico-presupuesto-linea-fila" key={indice}>
                    <input
                      className="mecanico-entrada"
                      placeholder="Descripción del ítem"
                      value={item.detalle}
                      onChange={(evento) => actualizarItemPresupuesto(indice, 'detalle', evento.target.value)}
                    />
                    <input
                      className="mecanico-entrada mecanico-entrada-cantidad"
                      type="number"
                      placeholder="$"
                      value={item.costo}
                      onChange={(evento) => actualizarItemPresupuesto(indice, 'costo', evento.target.value)}
                    />
                  </div>
                ))}
                <MecanicoBoton compacto onClick={agregarItemPresupuesto}>
                  + Agregar ítem
                </MecanicoBoton>
                <div className="mecanico-presupuesto-total" style={{ marginTop: 16 }}>
                  <span>Total</span>
                  <strong>{mecanicoFormatoMoneda(totalPresupuestoDraft)}</strong>
                </div>
                <div className="mecanico-modal-pie">
                  <MecanicoBoton onClick={() => setModal(null)}>Cancelar</MecanicoBoton>
                  <MecanicoBoton tipo="primario" onClick={enviarPresupuesto}>Enviar presupuesto</MecanicoBoton>
                </div>
              </div>
            )}
            {modal.tipo === 'registrar-servicio' && (
              <form onSubmit={agregarServicioRealizado}>
                <label className="mecanico-etiqueta">Cliente / vehículo</label>
                <select className="mecanico-entrada" value={clienteSeleccionado} onChange={(evento) => setClienteSeleccionado(Number(evento.target.value))}>
                  {clientes.map((cliente) => (
                    <option value={cliente.id} key={cliente.id}>{cliente.nombre} · {cliente.vehiculo}</option>
                  ))}
                </select>
                <label className="mecanico-etiqueta">Servicio realizado</label>
                <select className="mecanico-entrada" name="servicio">
                  {servicios.map((servicio) => (
                    <option key={servicio.id}>{servicio.nombre}</option>
                  ))}
                </select>
                <div className="mecanico-modal-fila">
                  <div>
                    <label className="mecanico-etiqueta">Kilometraje</label>
                    <input className="mecanico-entrada" type="number" name="km" placeholder="0" required />
                  </div>
                  <div>
                    <label className="mecanico-etiqueta">Costo total</label>
                    <input className="mecanico-entrada" type="number" name="costo" placeholder="0" required />
                  </div>
                </div>
                <div className="mecanico-modal-pie">
                  <MecanicoBoton onClick={() => setModal(null)}>Cancelar</MecanicoBoton>
                  <MecanicoBoton tipo="primario" submit>Guardar en historial</MecanicoBoton>
                </div>
              </form>
            )}
            {modal.tipo === 'agregar-turno' && (
              <form onSubmit={agregarTurnoManual}>
                <label className="mecanico-etiqueta">Cliente</label>
                <select className="mecanico-entrada" name="clienteId" defaultValue={clientes[0].id}>
                  {clientes.map((cliente) => (
                    <option value={cliente.id} key={cliente.id}>{cliente.nombre} · {cliente.vehiculo}</option>
                  ))}
                </select>
                <label className="mecanico-etiqueta">Servicio</label>
                <input className="mecanico-entrada" name="servicio" placeholder="Ej: Cambio de aceite" required />
                <div className="mecanico-modal-fila">
                  <div>
                    <label className="mecanico-etiqueta">Fecha</label>
                    <input className="mecanico-entrada" type="date" name="fecha" required />
                  </div>
                  <div>
                    <label className="mecanico-etiqueta">Hora</label>
                    <input className="mecanico-entrada" type="time" name="hora" required />
                  </div>
                </div>
                <div className="mecanico-modal-pie">
                  <MecanicoBoton onClick={() => setModal(null)}>Cancelar</MecanicoBoton>
                  <MecanicoBoton tipo="primario" submit>Agregar turno</MecanicoBoton>
                </div>
              </form>
            )}
            {(modal.tipo === 'nuevo-servicio' || modal.tipo === 'editar-servicio') && (
              <form onSubmit={guardarServicioCatalogo}>
                <label className="mecanico-etiqueta">Nombre del servicio</label>
                <input className="mecanico-entrada" name="nombre" defaultValue={modal.servicio?.nombre || ''} placeholder="Ej: Cambio de correa de distribución" required />
                <label className="mecanico-etiqueta">Categoría</label>
                <input className="mecanico-entrada" name="categoria" defaultValue={modal.servicio?.categoria || ''} placeholder="Ej: Motor" required />
                <div className="mecanico-modal-fila">
                  <div>
                    <label className="mecanico-etiqueta">Precio ($)</label>
                    <input className="mecanico-entrada" type="number" name="precio" defaultValue={modal.servicio?.precio || ''} placeholder="0" required />
                  </div>
                  <div>
                    <label className="mecanico-etiqueta">Duración estimada</label>
                    <input className="mecanico-entrada" name="duracion" defaultValue={modal.servicio?.duracion || ''} placeholder="Ej: 1h 30min" required />
                  </div>
                </div>
                <div className="mecanico-modal-pie">
                  {modal.tipo === 'editar-servicio' && (
                    <MecanicoBoton tipo="borde" onClick={() => eliminarServicioCatalogo(modal.servicio.id)}>
                      Eliminar
                    </MecanicoBoton>
                  )}
                  <MecanicoBoton onClick={() => setModal(null)}>Cancelar</MecanicoBoton>
                  <MecanicoBoton tipo="primario" submit>Guardar servicio</MecanicoBoton>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <div className={`mecanico-toast ${toast ? 'mecanico-toast-visible' : ''}`}>
        <span />
        {toast}
      </div>
    </div>
  )
}

export function MecanicoPanel({ autenticado, onIngresar, onCerrarSesion, onCliente }) {
  if (!autenticado) {
    return <MecanicoLogin onIngresar={onIngresar} onCliente={onCliente} />
  }

  return <MecanicoPanelPrincipal onCerrarSesion={onCerrarSesion} />
}

