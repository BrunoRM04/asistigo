import { useMemo, useState } from 'react'
import { AsistiGoLogo } from '../components/AsistiGoLogo'
import { MecanicoIcon } from './MecanicoIcon'
import { useCallback, useEffect } from 'react'
import { asistigoApi } from '../api/asistigoApi'
import { useUbicacion } from '../hooks/useUbicacion'

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

const _mecanicoSolicitudesIniciales = [
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

const _mecanicoAgendaInicial = [
  { id: 1, cliente: 'Martín Fernández', vehiculo: 'VW Vento · AB 123 CD', servicio: 'Cambio de pastillas + revisión', dia: 0, hora: '10:30', estado: 'confirmado' },
  { id: 2, cliente: 'Rocío Beltrán', vehiculo: 'Chevrolet Onix · CB 556 QT', servicio: 'Alineación y balanceo', dia: 0, hora: '13:00', estado: 'confirmado' },
  { id: 3, cliente: 'Lucía Ramírez', vehiculo: 'Ford Fiesta · FR 445 KL', servicio: 'Cambio de amortiguadores', dia: 1, hora: '09:15', estado: 'pendiente' },
  { id: 4, cliente: 'Sebastián Paz', vehiculo: 'Honda CB 500F · XYZ 789', servicio: 'Lubricación de cadena', dia: 2, hora: '11:00', estado: 'confirmado' },
  { id: 5, cliente: 'Martín Fernández', vehiculo: 'VW Vento · AB 123 CD', servicio: 'Cambio de aceite y filtros', dia: 4, hora: '09:00', estado: 'pendiente' },
]

const _mecanicoClientesIniciales = [
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

const _mecanicoServiciosIniciales = [
  { id: 1, nombre: 'Cambio de aceite y filtro', categoria: 'Mantenimiento', precio: 24000, duracion: '40 min' },
  { id: 2, nombre: 'Cambio de pastillas de freno', categoria: 'Frenos', precio: 38000, duracion: '1h' },
  { id: 3, nombre: 'Alineación y balanceo', categoria: 'Neumáticos', precio: 18000, duracion: '45 min' },
  { id: 4, nombre: 'Diagnóstico computarizado', categoria: 'Diagnóstico', precio: 9000, duracion: '30 min' },
  { id: 5, nombre: 'Cambio de amortiguadores (par)', categoria: 'Suspensión', precio: 70000, duracion: '2h' },
  { id: 6, nombre: 'Revisión general pre-VTV', categoria: 'Inspección', precio: 15000, duracion: '50 min' },
]

const _mecanicoPresupuestosIniciales = [
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

const _mecanicoChatsIniciales = [
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

const mecanicoDatosVacios = {
  taller: mecanicoTaller,
  solicitudes: [],
  agenda: [],
  clientes: [],
  servicios: [],
  presupuestos: [],
  chats: [],
  horarios: mecanicoHorariosIniciales,
  notificaciones: [],
  estadisticas: {
    facturado_mes: 0,
    servicios_mes: 0,
    clientes_activos: 0,
    presupuestos_aceptados_pct: 0,
  },
}

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

const mecanicoRegistroServicios = [
  'Cambio de aceite y filtro',
  'Cambio de pastillas de freno',
  'Alineación y balanceo',
  'Diagnóstico computarizado',
  'Cambio de amortiguadores',
  'Revisión general pre-VTV',
]

const mecanicoRegistroPagos = ['Efectivo', 'Transferencia', 'Tarjeta', 'Mercado Pago']

const mecanicoRegistroDias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

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
  const [modoRegistro, setModoRegistro] = useState(false)
  const [tipoPrestador, setTipoPrestador] = useState('Taller físico')
  const [ofreceUrgencias, setOfreceUrgencias] = useState(false)
  const [registroServicios, setRegistroServicios] = useState([])
  const [registroVehiculos, setRegistroVehiculos] = useState([])
  const [registroPagos, setRegistroPagos] = useState([])
  const [ubicacionBase, setUbicacionBase] = useState('')
  const { coords: ubicacionCoords, mensaje: ubicacionMensaje, cargando: buscandoUbicacion, usarUbicacionActual, buscarDireccion } = useUbicacion()
  const [errorAcceso, setErrorAcceso] = useState('')
  const [cargandoAcceso, setCargandoAcceso] = useState(false)

  const alternarRegistro = (valor, setSeleccionados) => {
    setSeleccionados((actuales) =>
      actuales.includes(valor) ? actuales.filter((item) => item !== valor) : [...actuales, valor],
    )
  }

  const usarMiUbicacion = async () => {
    const data = await usarUbicacionActual()
    if (data) {
      setUbicacionBase(data.direccion || data.display_name || '')
    }
  }

  const buscarUbicacionBase = async (evento) => {
    const formulario = evento.currentTarget.form
    const ciudadForm = formulario ? String(new FormData(formulario).get('ciudad') || '') : ''
    const data = await buscarDireccion(ubicacionBase, ciudadForm, 'Uruguay')
    if (data) {
      setUbicacionBase(data.direccion || data.display_name || ubicacionBase)
    }
  }

  const mapaRegistroUrl = ubicacionBase.trim()
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ubicacionBase.trim())}`
    : 'https://www.google.com/maps'

  const registrarTaller = async (evento) => {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    const horarios = Object.fromEntries(
      mecanicoRegistroDias.map((dia) => [
        dia,
        {
          abre: String(datos.get(`${dia}-abre`) || '08:30'),
          cierra: String(datos.get(`${dia}-cierra`) || '18:00'),
        },
      ]),
    )
    setErrorAcceso('')
    setCargandoAcceso(true)

    try {
      await onIngresar('registro', {
        responsable: datos.get('responsable'),
        celular: datos.get('celular'),
        cedula: datos.get('cedula'),
        email: datos.get('email'),
        tipoPrestador: tipoPrestador,
        nombreComercial: datos.get('nombreComercial'),
        ciudad: datos.get('ciudad'),
        ubicacionBase,
        latitud: ubicacionCoords.latitud,
        longitud: ubicacionCoords.longitud,
        modalidad: datos.get('modalidad'),
        zonaCobertura: datos.get('zonaCobertura'),
        servicios: registroServicios,
        vehiculos: registroVehiculos,
        pagos: registroPagos,
        nombreLegal: datos.get('nombreLegal'),
        documento: datos.get('documento'),
        fiscal: datos.get('fiscal'),
        direccion: datos.get('direccion'),
        radio: datos.get('radio'),
        ofreceUrgencias,
        urgencias: datos.get('urgencias'),
        descripcion: datos.get('descripcion'),
        experiencia: datos.get('experiencia'),
        garantia: datos.get('garantia'),
        horarios,
        password: datos.get('password'),
      })
    } catch (error) {
      setErrorAcceso(error.message)
    } finally {
      setCargandoAcceso(false)
    }
  }

  const ingresarTaller = async (evento) => {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    setErrorAcceso('')
    setCargandoAcceso(true)

    try {
      await onIngresar('login', {
        email: datos.get('email'),
        password: datos.get('password'),
      })
    } catch (error) {
      setErrorAcceso(error.message)
    } finally {
      setCargandoAcceso(false)
    }
  }

  if (modoRegistro) {
    return (
      <section className="mecanico-registro">
        <div className="mecanico-registro-contenido">
          <div className="mecanico-registro-cabecera">
            <AsistiGoLogo className="user-marca" />
            <button className="mecanico-registro-volver" type="button" onClick={() => setModoRegistro(false)}>
              Volver al login
            </button>
          </div>

          <div className="mecanico-registro-titulo">
            <p className="user-eyebrow">Registro de taller</p>
            <h1 className="user-acceso-titulo">Crear cuenta de prestador</h1>
            <p className="user-acceso-subtitulo">
              Carga los datos necesarios para operar solicitudes, agenda, servicios y perfil del taller.
            </p>
          </div>

          <form
            className="mecanico-registro-form"
            onSubmit={registrarTaller}
          >
            <section className="mecanico-registro-bloque">
              <div className="mecanico-registro-bloque-titulo">
                <p className="user-eyebrow">Responsable</p>
                <h2>Datos de contacto</h2>
              </div>
              <div className="mecanico-registro-grid">
                <label className="mecanico-registro-campo">
                  <span>Nombre y apellido *</span>
                  <input className="mecanico-entrada" name="responsable" placeholder="Diego Torres" required />
                </label>
                <label className="mecanico-registro-campo">
                  <span>Celular *</span>
                  <input className="mecanico-entrada" name="celular" type="tel" placeholder="099 123 456" required />
                </label>
                <label className="mecanico-registro-campo">
                  <span>Cédula de identidad *</span>
                  <input className="mecanico-entrada" name="cedula" inputMode="numeric" placeholder="1.234.567-8" required />
                </label>
                <label className="mecanico-registro-campo">
                  <span>Contraseña *</span>
                  <input className="mecanico-entrada" name="password" type="password" minLength="6" placeholder="Mínimo 6 caracteres" required />
                </label>
                <label className="mecanico-registro-campo">
                  <span>Email *</span>
                  <input className="mecanico-entrada" name="email" type="email" placeholder="contacto@taller.com" required />
                </label>
              </div>
            </section>

            <section className="mecanico-registro-bloque">
              <div className="mecanico-registro-bloque-titulo">
                <p className="user-eyebrow">Prestador</p>
                <h2>Perfil del taller</h2>
              </div>
              <div className="mecanico-registro-grid">
                <label className="mecanico-registro-campo">
                  <span>Tipo de prestador *</span>
                  <select
                    className="mecanico-entrada"
                    name="tipoPrestador"
                    value={tipoPrestador}
                    onChange={(evento) => setTipoPrestador(evento.target.value)}
                    required
                  >
                    <option>Taller físico</option>
                    <option>Mecánico móvil</option>
                    <option>Taller físico y móvil</option>
                  </select>
                </label>
                <label className="mecanico-registro-campo">
                  <span>Nombre comercial/profesional *</span>
                  <input className="mecanico-entrada" name="nombreComercial" placeholder="Taller Norte Motors" required />
                </label>
                <label className="mecanico-registro-campo">
                  <span>Ciudad/localidad *</span>
                  <input className="mecanico-entrada" name="ciudad" placeholder="Montevideo" required />
                </label>
                <label className="mecanico-registro-campo">
                  <span>Ubicación base *</span>
                  <input
                    className="mecanico-entrada"
                    name="ubicacionBase"
                    placeholder="Dirección, barrio o coordenadas"
                    value={ubicacionBase}
                    onChange={(evento) => setUbicacionBase(evento.target.value)}
                    required
                  />
                </label>
                <div className="mecanico-registro-ubicacion">
                  <button className="mecanico-boton mecanico-boton-fantasma mecanico-boton-compacto" type="button" onClick={usarMiUbicacion} disabled={buscandoUbicacion}>
                    Usar mi ubicación
                  </button>
                  <button className="mecanico-boton mecanico-boton-fantasma mecanico-boton-compacto" type="button" onClick={buscarUbicacionBase} disabled={buscandoUbicacion}>
                    Buscar dirección
                  </button>
                  <a className="mecanico-registro-mapa" href={mapaRegistroUrl} target="_blank" rel="noreferrer">
                    Abrir mapa
                  </a>
                  {ubicacionMensaje && <p>{ubicacionMensaje}</p>}
                </div>
                <label className="mecanico-registro-campo">
                  <span>Modalidad de atención *</span>
                  <select className="mecanico-entrada" name="modalidad" required>
                    <option>En taller</option>
                    <option>A domicilio</option>
                    <option>En taller y a domicilio</option>
                    <option>Urgencias</option>
                  </select>
                </label>
                <label className="mecanico-registro-campo">
                  <span>Zona de cobertura *</span>
                  <input className="mecanico-entrada" name="zonaCobertura" placeholder="Ej: Prado, Centro, Cordón" required />
                </label>
              </div>
            </section>

            <section className="mecanico-registro-bloque mecanico-registro-bloque-operacion">
              <div className="mecanico-registro-bloque-titulo">
                <p className="user-eyebrow">Operación</p>
                <h2>Servicios, vehículos y horarios</h2>
              </div>
              <div className="mecanico-registro-grid">
                <fieldset className="mecanico-registro-campo mecanico-registro-campo-ancho">
                  <legend>Servicios ofrecidos *</legend>
                  <input className="mecanico-registro-requerido" value={registroServicios.join(',')} onChange={() => {}} required />
                  <div className="mecanico-registro-checks">
                    {mecanicoRegistroServicios.map((servicio) => (
                      <label
                        className={registroServicios.includes(servicio) ? 'mecanico-registro-check-activo' : ''}
                        key={servicio}
                      >
                        <input
                          type="checkbox"
                          name="servicios"
                          value={servicio}
                          checked={registroServicios.includes(servicio)}
                          onChange={() => alternarRegistro(servicio, setRegistroServicios)}
                        />
                        <span>{servicio}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="mecanico-registro-campo">
                  <legend>Tipos de vehículos *</legend>
                  <input className="mecanico-registro-requerido" value={registroVehiculos.join(',')} onChange={() => {}} required />
                  <div className="mecanico-registro-checks">
                    {['Autos', 'Motos', 'Utilitarios'].map((tipo) => (
                      <label
                        className={registroVehiculos.includes(tipo) ? 'mecanico-registro-check-activo' : ''}
                        key={tipo}
                      >
                        <input
                          type="checkbox"
                          name="vehiculos"
                          value={tipo}
                          checked={registroVehiculos.includes(tipo)}
                          onChange={() => alternarRegistro(tipo, setRegistroVehiculos)}
                        />
                        <span>{tipo}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="mecanico-registro-campo">
                  <legend>Método de pago *</legend>
                  <input className="mecanico-registro-requerido" value={registroPagos.join(',')} onChange={() => {}} required />
                  <div className="mecanico-registro-checks">
                    {mecanicoRegistroPagos.map((pago) => (
                      <label
                        className={registroPagos.includes(pago) ? 'mecanico-registro-check-activo' : ''}
                        key={pago}
                      >
                        <input
                          type="checkbox"
                          name="pagos"
                          value={pago}
                          checked={registroPagos.includes(pago)}
                          onChange={() => alternarRegistro(pago, setRegistroPagos)}
                        />
                        <span>{pago}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="mecanico-registro-campo mecanico-registro-campo-ancho">
                  <legend>Horarios *</legend>
                  <div className="mecanico-registro-horarios">
                    {mecanicoRegistroDias.map((dia) => (
                      <label className="mecanico-registro-horario-fila" key={dia}>
                        <strong>{dia}</strong>
                        <div>
                          <span>Abre</span>
                          <input className="mecanico-entrada" type="time" name={`${dia}-abre`} defaultValue="08:30" />
                        </div>
                        <div>
                          <span>Cierra</span>
                          <input className="mecanico-entrada" type="time" name={`${dia}-cierra`} defaultValue="18:00" />
                        </div>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            </section>

            <section className="mecanico-registro-bloque">
              <div className="mecanico-registro-bloque-titulo">
                <p className="user-eyebrow">Datos para operar</p>
                <h2>Identificación y cobertura</h2>
              </div>
              <div className="mecanico-registro-grid">
                <label className="mecanico-registro-campo">
                  <span>Nombre legal *</span>
                  <input className="mecanico-entrada" name="nombreLegal" required />
                </label>
                <label className="mecanico-registro-campo">
                  <span>Documento legal *</span>
                  <input className="mecanico-entrada" name="documento" required />
                </label>
                <label className="mecanico-registro-campo">
                  <span>Identificación fiscal</span>
                  <input className="mecanico-entrada" name="fiscal" placeholder="Obligatorio si es empresa" />
                </label>
                {(tipoPrestador === 'Taller físico' || tipoPrestador === 'Taller físico y móvil') && (
                  <label className="mecanico-registro-campo">
                    <span>Dirección exacta</span>
                    <input className="mecanico-entrada" name="direccion" placeholder="Av. de las Instrucciones 2340" />
                  </label>
                )}
                {(tipoPrestador === 'Mecánico móvil' || tipoPrestador === 'Taller físico y móvil') && (
                  <label className="mecanico-registro-campo">
                    <span>Radio de cobertura</span>
                    <input className="mecanico-entrada" name="radio" placeholder="Ej: 10 km" />
                  </label>
                )}
                <label className="mecanico-registro-campo mecanico-registro-campo-ancho">
                  <span>Datos de urgencia</span>
                  <input
                    className="mecanico-entrada"
                    name="urgencias"
                    placeholder="Teléfono o detalle de disponibilidad"
                    disabled={!ofreceUrgencias}
                  />
                </label>
                <label className="mecanico-registro-toggle">
                  <input
                    type="checkbox"
                    checked={ofreceUrgencias}
                    onChange={(evento) => setOfreceUrgencias(evento.target.checked)}
                  />
                  <span>Ofrezco atención de urgencias</span>
                </label>
              </div>
            </section>

            <section className="mecanico-registro-bloque">
              <div className="mecanico-registro-bloque-titulo">
                <p className="user-eyebrow">Opcional</p>
                <h2>Presentación del taller</h2>
              </div>
              <div className="mecanico-registro-grid">
                <label className="mecanico-registro-campo">
                  <span>Logo</span>
                  <input className="mecanico-entrada mecanico-registro-archivo" type="file" accept="image/*" />
                </label>
                <label className="mecanico-registro-campo">
                  <span>Fotos</span>
                  <input className="mecanico-entrada mecanico-registro-archivo" type="file" accept="image/*" multiple />
                </label>
                <label className="mecanico-registro-campo mecanico-registro-campo-ancho">
                  <span>Descripción</span>
                  <textarea className="mecanico-entrada mecanico-textarea" name="descripcion" placeholder="Especialidad, experiencia y forma de trabajo" />
                </label>
                <label className="mecanico-registro-campo">
                  <span>Años de experiencia</span>
                  <input className="mecanico-entrada" name="experiencia" type="number" min="0" placeholder="15" />
                </label>
                <label className="mecanico-registro-campo">
                  <span>Garantía</span>
                  <select className="mecanico-entrada" name="garantia">
                    <option>No especificar</option>
                    <option>Garantía por mano de obra</option>
                    <option>Garantía por servicio y repuestos</option>
                  </select>
                </label>
              </div>
            </section>

            <div className="mecanico-registro-pie">
              {errorAcceso && <p className="user-registro-error">{errorAcceso}</p>}
              <button className="mecanico-boton mecanico-boton-fantasma" type="button" onClick={() => setModoRegistro(false)}>
                Cancelar
              </button>
              <button className="mecanico-boton mecanico-boton-primario" type="submit" disabled={cargandoAcceso}>
                {cargandoAcceso ? 'Creando...' : 'Crear cuenta de taller'}
              </button>
            </div>
          </form>
        </div>
      </section>
    )
  }

  return (
    <section className="user-acceso-vista">
      <div className="user-acceso-capa" />
      <div className="user-acceso-caja">
        <AsistiGoLogo className="user-marca" />
        <h1 className="user-acceso-titulo">Tu taller, siempre organizado.</h1>
        <p className="user-acceso-subtitulo">Ingresa para gestionar solicitudes, agenda e historial de tus clientes.</p>
        <form
          className="user-formulario"
          onSubmit={ingresarTaller}
        >
          <label className="user-etiqueta" htmlFor="mecanico-correo">
            Correo electronico
          </label>
          <input
            className="user-entrada"
            id="mecanico-correo"
            name="email"
            type="email"
            placeholder="contacto@taller.com"
            required
          />
          <label className="user-etiqueta" htmlFor="mecanico-clave">
            Contrasena
          </label>
          <input
            className="user-entrada"
            id="mecanico-clave"
            name="password"
            type="password"
            placeholder="********"
            required
          />
          {errorAcceso && <p className="user-registro-error">{errorAcceso}</p>}
          <button className="user-boton user-boton-principal user-boton-bloque" type="submit" disabled={cargandoAcceso}>
            {cargandoAcceso ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <button className="user-acceso-link" type="button" onClick={onCliente}>
          Entrar como cliente
        </button>
        <button className="user-acceso-link mecanico-registro-link" type="button" onClick={() => setModoRegistro(true)}>
          Crear cuenta de taller
        </button>
        <p className="user-acceso-pie">AsistiGo - Panel de talleres</p>
      </div>
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

function MecanicoTurnoFila({ turno, onChat, onConfirmar, onCompletar }) {
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
          ) : turno.estado === 'confirmado' ? (
            <MecanicoBoton tipo="borde" compacto onClick={() => onCompletar(turno.id)}>
              Marcar completado
            </MecanicoBoton>
          ) : null}
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

function MecanicoPanelPrincipal({ usuario, onCerrarSesion, pushDestino }) {
  const [vista, setVista] = useState('inicio')
  const [taller, setTaller] = useState(mecanicoDatosVacios.taller)
  const [solicitudes, setSolicitudes] = useState(mecanicoDatosVacios.solicitudes)
  const [agenda, setAgenda] = useState(mecanicoDatosVacios.agenda)
  const [clientes, setClientes] = useState(mecanicoDatosVacios.clientes)
  const [servicios, setServicios] = useState(mecanicoDatosVacios.servicios)
  const [presupuestos, setPresupuestos] = useState(mecanicoDatosVacios.presupuestos)
  const [chats, setChats] = useState(mecanicoDatosVacios.chats)
  const [horarios, setHorarios] = useState(mecanicoDatosVacios.horarios)
  const [notificaciones, setNotificaciones] = useState(mecanicoDatosVacios.notificaciones)
  const [estadisticas, setEstadisticas] = useState(mecanicoDatosVacios.estadisticas)
  const [cargandoDatos, setCargandoDatos] = useState(false)
  const [backendError, setBackendError] = useState('')
  const [filtroSolicitudes, setFiltroSolicitudes] = useState('todas')
  const [diaAgenda, setDiaAgenda] = useState(0)
  const [busquedaClientes, setBusquedaClientes] = useState('')
  const [clienteSeleccionado, setClienteSeleccionado] = useState(1)
  const [pestanaVehiculo, setPestanaVehiculo] = useState('historial')
  const [chatActivo, setChatActivo] = useState(null)
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState('')
  const [presupuestoDraft, setPresupuestoDraft] = useState({ cliente: '', vehiculo: '', items: [{ detalle: '', costo: '' }] })

  const cargarDatosMecanico = useCallback(async () => {
    if (!usuario?.id || !usuario?.taller_id) return

    setCargandoDatos(true)
    setBackendError('')

    try {
      const respuesta = await asistigoApi.cargarMecanico({
        mecanico_id: usuario.id,
        taller_id: usuario.taller_id,
      })
      const data = { ...mecanicoDatosVacios, ...respuesta.data }
      setTaller(data.taller)
      setSolicitudes(data.solicitudes)
      setAgenda(data.agenda)
      setClientes(data.clientes)
      setServicios(data.servicios)
      setPresupuestos(data.presupuestos)
      setChats(data.chats)
      setHorarios(data.horarios)
      setNotificaciones(data.notificaciones)
      setEstadisticas(data.estadisticas)
      setClienteSeleccionado((actual) => (data.clientes.some((cliente) => cliente.id === actual) ? actual : data.clientes[0]?.id || 0))
    } catch (error) {
      setBackendError(error.message)
    } finally {
      setCargandoDatos(false)
    }
  }, [usuario?.id, usuario?.taller_id])

  useEffect(() => {
    cargarDatosMecanico()
  }, [cargarDatosMecanico])

  useEffect(() => {
    const ruta = pushDestino?.ruta || ''
    if (!ruta) return

    if (ruta.includes('chat')) setVista('chat')
    else if (ruta.includes('presupuesto')) setVista('presupuestos')
    else if (ruta.includes('agenda') || ruta.includes('turno')) setVista('agenda')
    else if (ruta.includes('solicitud')) setVista('solicitudes')
    else if (ruta.includes('vehiculo') || ruta.includes('cliente')) setVista('clientes')
    else setModal({ tipo: 'notificaciones' })
    cargarDatosMecanico()
  }, [pushDestino, cargarDatosMecanico])

  const ejecutarAccionMecanico = async (accion, payload = {}, refrescar = true) => {
    if (!usuario?.id || !usuario?.taller_id) {
      throw new Error('Sesion de mecanico incompleta')
    }

    const respuesta = await asistigoApi.accionMecanico({
      accion,
      mecanico_id: usuario.id,
      taller_id: usuario.taller_id,
      ...payload,
    })

    if (refrescar) {
      await cargarDatosMecanico()
    }

    return respuesta
  }

  const solicitudesNuevas = solicitudes.filter((solicitud) => solicitud.estado === 'nueva').length
  const chatsSinLeer = chats.filter((chat) => chat.sinLeer).length
  const clienteActual = clientes.find((cliente) => cliente.id === clienteSeleccionado) || clientes[0] || {
    id: 0,
    cliente_id: 0,
    vehiculo_id: 0,
    nombre: 'Sin cliente',
    vehiculo: 'Sin vehiculo',
    patente: '',
    km: 0,
    visitas: 0,
    historial: [],
    diagnosticos: [],
    fotos: [],
    telefono: '',
    correo: '',
  }
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

  const abrirChat = (destino = null) => {
    if (typeof destino === 'number') {
      setChats((actuales) => actuales.map((chat) => (chat.id === destino ? { ...chat, sinLeer: false } : chat)))
      setChatActivo(destino)
      setVista('chat-hilo')
      return
    }

    const base = destino || clientes[0]
    if (!base) {
      mostrarToast('No hay clientes para abrir chat')
      return
    }

    const existente = chats.find((chat) =>
      (base.cliente_id && chat.cliente_id === base.cliente_id) ||
      (base.vehiculo_id && chat.vehiculo_id === base.vehiculo_id),
    )

    if (existente) {
      setChats((actuales) => actuales.map((chat) => (chat.id === existente.id ? { ...chat, sinLeer: false } : chat)))
      setChatActivo(existente.id)
      setVista('chat-hilo')
      return
    }

    const idTemporal = `nuevo-${base.cliente_id || base.id}-${base.vehiculo_id || ''}`
    setChats((actuales) => [
      {
        id: idTemporal,
        cliente_id: base.cliente_id || base.id,
        vehiculo_id: base.vehiculo_id || null,
        nombre: base.cliente || base.nombre || 'Cliente',
        ultimo: 'Conversación nueva',
        hora: 'Ahora',
        sinLeer: false,
        mensajes: [],
      },
      ...actuales,
    ])
    setChatActivo(idTemporal)
    setVista('chat-hilo')
  }

  const contadorPara = (tipo) => {
    if (tipo === 'solicitudes') return solicitudesNuevas
    if (tipo === 'chat') return chatsSinLeer
    return 0
  }

  const abrirModalPresupuesto = (solicitud) => {
    const clienteBase = solicitud
      ? clientes.find((cliente) => cliente.vehiculo_id === solicitud.vehiculo_id || cliente.cliente_id === solicitud.cliente_id)
      : clientes[0]

    if (!solicitud && !clienteBase) {
      mostrarToast('No hay clientes para presupuestar')
      return
    }

    setPresupuestoDraft({
      cliente: solicitud?.cliente || clienteBase.nombre,
      cliente_id: solicitud?.cliente_id || clienteBase.cliente_id,
      vehiculo: solicitud?.vehiculo || `${clienteBase.vehiculo} · ${clienteBase.patente}`,
      vehiculo_id: solicitud?.vehiculo_id || clienteBase.vehiculo_id,
      items: [{ detalle: '', costo: '' }],
    })
    setModal({ tipo: 'presupuesto', solicitud })
  }

  const responderSolicitud = (solicitud) => {
    if (solicitud.tipo === 'turno') {
      setModal({ tipo: 'confirmar-turno', solicitud })
    } else {
      abrirModalPresupuesto(solicitud)
    }
  }

  const descartarSolicitud = async (id) => {
    try {
      await ejecutarAccionMecanico('descartar_solicitud', { id })
      mostrarToast('Solicitud descartada')
    } catch (error) {
      mostrarToast(error.message)
    }
  }

  const confirmarTurno = async (id) => {
    try {
      await ejecutarAccionMecanico('confirmar_turno', { id })
      mostrarToast('Turno confirmado')
    } catch (error) {
      mostrarToast(error.message)
    }
  }

  const completarTurno = async (id) => {
    try {
      await ejecutarAccionMecanico('completar_turno', { id })
      mostrarToast('Turno completado')
    } catch (error) {
      mostrarToast(error.message)
    }
  }

  const confirmarSolicitudTurno = async (evento, solicitud) => {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    const fechaValor = String(datos.get('fecha') || '')
    const hora = String(datos.get('hora') || '—')

    try {
      await ejecutarAccionMecanico('confirmar_solicitud_turno', {
        solicitud_id: solicitud.id,
        fecha: fechaValor,
        hora,
        nota: String(datos.get('nota') || ''),
      })
      setModal(null)
      mostrarToast('Turno confirmado y agregado a la agenda')
    } catch (error) {
      mostrarToast(error.message)
    }
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

  const enviarPresupuesto = async () => {
    const itemsValidos = presupuestoDraft.items.filter((item) => item.detalle.trim() && Number(item.costo) > 0)
    if (!itemsValidos.length) {
      mostrarToast('Agregá al menos un ítem con monto')
      return
    }

    try {
      await ejecutarAccionMecanico('enviar_presupuesto', {
        solicitud_id: modal?.solicitud?.id || null,
        cliente_id: presupuestoDraft.cliente_id,
        vehiculo_id: presupuestoDraft.vehiculo_id,
        titulo: modal?.solicitud?.asunto || 'Presupuesto del taller',
        items: itemsValidos.map((item) => ({ detalle: item.detalle, costo: Number(item.costo) })),
      })
      setModal(null)
      mostrarToast(`Presupuesto enviado a ${presupuestoDraft.cliente}`)
    } catch (error) {
      mostrarToast(error.message)
    }
  }

  const agregarServicioRealizado = async (evento) => {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    const servicioId = Number(datos.get('servicio_id') || 0)
    const servicioNombre = servicios.find((servicio) => servicio.id === servicioId)?.nombre || String(datos.get('servicio') || '')
    const km = Number(datos.get('km') || 0)
    const costo = Number(datos.get('costo') || 0)

    try {
      await ejecutarAccionMecanico('registrar_servicio', {
        cliente_id: clienteActual.cliente_id,
        vehiculo_id: clienteActual.vehiculo_id,
        servicio_id: servicioId,
        titulo: servicioNombre,
        km,
        costo,
      })
      setModal(null)
      mostrarToast('Servicio registrado en el historial')
    } catch (error) {
      mostrarToast(error.message)
    }
  }

  const agregarTurnoManual = async (evento) => {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    const cliente = clientes.find((item) => item.id === Number(datos.get('clienteId'))) || clientes[0]
    if (!cliente) {
      mostrarToast('No hay clientes para agendar')
      return
    }
    const servicio = String(datos.get('servicio') || '')
    const fechaValor = String(datos.get('fecha') || '')
    const hora = String(datos.get('hora') || '—')

    try {
      await ejecutarAccionMecanico('crear_turno', {
        cliente_id: cliente.cliente_id,
        vehiculo_id: cliente.vehiculo_id,
        servicio,
        fecha: fechaValor,
        hora,
      })
      if (fechaValor) {
        const elegida = new Date(`${fechaValor}T00:00:00`)
        const hoy = new Date(new Date().toDateString())
        const dia = Math.max(0, Math.round((elegida - hoy) / 86400000))
        if (dia <= 13) setDiaAgenda(dia)
      }
      setModal(null)
      mostrarToast('Turno agregado a la agenda')
    } catch (error) {
      mostrarToast(error.message)
    }
  }

  const guardarServicioCatalogo = async (evento) => {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    const nombre = String(datos.get('nombre') || '')
    const categoria = String(datos.get('categoria') || '')
    const precio = Number(datos.get('precio') || 0)
    const duracion = String(datos.get('duracion') || '')

    try {
      await ejecutarAccionMecanico('guardar_servicio_catalogo', {
        id: modal?.servicio?.id || null,
        nombre,
        categoria,
        precio,
        duracion,
      })
      mostrarToast(modal?.servicio ? 'Servicio actualizado' : 'Servicio agregado al catálogo')
      setModal(null)
    } catch (error) {
      mostrarToast(error.message)
    }
  }

  const eliminarServicioCatalogo = async (id) => {
    try {
      await ejecutarAccionMecanico('eliminar_servicio_catalogo', { id })
      setModal(null)
      mostrarToast('Servicio eliminado')
    } catch (error) {
      mostrarToast(error.message)
    }
  }

  const agregarDiagnostico = async (evento) => {
    const textarea = evento.currentTarget.parentElement.querySelector('textarea')
    const descripcion = textarea?.value?.trim() || ''
    if (!descripcion) {
      mostrarToast('Escribí un diagnóstico')
      return
    }

    try {
      await ejecutarAccionMecanico('guardar_diagnostico', {
        vehiculo_id: clienteActual.vehiculo_id,
        descripcion,
      })
      if (textarea) textarea.value = ''
      mostrarToast('Diagnóstico guardado')
    } catch (error) {
      mostrarToast(error.message)
    }
  }

  const enviarMensaje = async (evento) => {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    const texto = String(datos.get('mecanico-mensaje') || '').trim()
    if (!texto || !chatActivo) return

    try {
      const respuesta = await ejecutarAccionMecanico('enviar_mensaje', {
        conversacion_id: typeof chatActivo === 'number' ? chatActivo : 0,
        cliente_id: chatActual?.cliente_id || 0,
        vehiculo_id: chatActual?.vehiculo_id || 0,
        contenido: texto,
      })
      if (respuesta.conversacion_id) {
        setChatActivo(respuesta.conversacion_id)
      }
      evento.currentTarget.reset()
    } catch (error) {
      mostrarToast(error.message)
    }
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
    { icono: 'solicitudes', valor: solicitudesNuevas, etiqueta: 'Solicitudes nuevas', delta: 'en bandeja' },
    { icono: 'agenda', valor: hoyTurnos.length, etiqueta: 'Turnos para hoy', delta: `${hoyTurnos.filter((turno) => turno.estado === 'confirmado').length} confirmados` },
    { icono: 'moneda', valor: mecanicoFormatoMoneda(estadisticas.facturado_mes || 0), etiqueta: 'Facturado este mes', delta: `${estadisticas.servicios_mes || 0} servicios` },
    { icono: 'estrella', valor: taller.rating?.toFixed ? taller.rating.toFixed(1) : '0.0', etiqueta: 'Rating promedio', delta: `${taller.total_calificaciones || 0} calificaciones` },
  ]

  const diasAgenda = Array.from({ length: 14 }, (_, indice) => {
    const fecha = new Date()
    fecha.setDate(fecha.getDate() + indice)
    const nombres = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']
    return { indice, numero: fecha.getDate(), dia: indice === 0 ? 'Hoy' : nombres[fecha.getDay()] }
  })

  return (
    <div className="mecanico-aplicacion">
      <aside className="mecanico-lateral">
        <AsistiGoLogo className="mecanico-marca mecanico-marca-lateral" />
        <p className="mecanico-marca-etiqueta">Panel de talleres</p>
        <div className="mecanico-taller-lateral">
          <span className="mecanico-taller-icono">
            <MecanicoIcon nombre="servicios" tamano={19} />
          </span>
          <div>
            <p className="mecanico-taller-nombre">{taller.nombre}</p>
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
          {taller.mecanico}
          <span>Cuenta verificada</span>
          <button type="button" onClick={onCerrarSesion}>
            Cerrar sesión
          </button>
        </p>
      </aside>

      <div className="mecanico-principal">
        <header className="mecanico-barra-superior">
          <div className="mecanico-barra-cuenta">
            <div className="mecanico-avatar">{taller.mecanicoInicial}</div>
            <div>
              <p className="mecanico-barra-saludo">{saludo}</p>
              <p className="mecanico-barra-nombre">{taller.mecanico}</p>
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
          {(backendError || cargandoDatos) && (
            <div className="user-alerta">
              <span className="user-alerta-icono"><MecanicoIcon nombre={backendError ? 'alerta' : 'servicios'} tamano={20} /></span>
              <div>
                <p className="user-linea-titulo">{backendError ? 'Backend sin respuesta correcta' : 'Cargando datos reales'}</p>
                <p className="user-linea-subtitulo">{backendError || 'Leyendo informacion del taller desde MySQL.'}</p>
              </div>
            </div>
          )}

          {vista === 'inicio' && (
            <section className="mecanico-vista">
              <p className="mecanico-titulo-pagina">Panel general</p>
              <p className="mecanico-subtitulo-pagina">
                Así viene el día en <b>{taller.nombre}</b>.
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
                          onChat={() => abrirChat(solicitud)}
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
                      <MecanicoTurnoFila key={turno.id} turno={turno} onChat={() => abrirChat(turno)} onConfirmar={confirmarTurno} onCompletar={completarTurno} />
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
                    onChat={() => abrirChat(solicitud)}
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
                turnosDelDia.map((turno) => <MecanicoTurnoFila key={turno.id} turno={turno} onChat={() => abrirChat(turno)} onConfirmar={confirmarTurno} onCompletar={completarTurno} />)
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
                    className="mecanico-entrada"
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
                  <MecanicoBoton bloque onClick={() => abrirChat(clienteActual)}>
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
                  <MecanicoPresupuestoTarjeta key={presupuesto.id} presupuesto={presupuesto} onChat={() => abrirChat(presupuesto)} />
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
                  { icono: 'moneda', valor: mecanicoFormatoMoneda(estadisticas.facturado_mes || 0), etiqueta: 'Facturado este mes', delta: 'historial real' },
                  { icono: 'servicios', valor: estadisticas.servicios_mes || 0, etiqueta: 'Servicios realizados', delta: 'este mes' },
                  { icono: 'clientes', valor: estadisticas.clientes_activos || clientes.length, etiqueta: 'Clientes activos', delta: 'con actividad' },
                  { icono: 'presupuestos', valor: `${estadisticas.presupuestos_aceptados_pct || 0}%`, etiqueta: 'Presupuestos aceptados', delta: 'según respuestas' },
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
                    <strong>{taller.rating?.toFixed ? taller.rating.toFixed(1) : '0.0'}</strong>
                    <div>
                      {[1, 2, 3, 4, 5].map((numero) => <MecanicoIcon key={numero} nombre="estrella" tamano={22} />)}
                    </div>
                    <p>Basado en {taller.total_calificaciones || 0} calificaciones</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {vista === 'chat' && (
            <section className="mecanico-vista">
              <p className="mecanico-titulo-pagina">Chat</p>
              <p className="mecanico-subtitulo-pagina">Conversaciones con clientes de AsistiGo.</p>
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
                  <small>Cliente de AsistiGo</small>
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
                <div className="mecanico-avatar mecanico-avatar-grande">{taller.inicial}</div>
                <p className="mecanico-perfil-nombre">{taller.nombre}</p>
                <p className="mecanico-linea-subtitulo">{taller.correo}</p>
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
                  className="mecanico-tarjeta mecanico-perfil-formulario"
                  onSubmit={async (evento) => {
                    evento.preventDefault()
                    const datos = new FormData(evento.currentTarget)
                    try {
                      await ejecutarAccionMecanico('guardar_perfil', {
                        nombre: String(datos.get('perfil-nombre') || ''),
                        especialidad: String(datos.get('perfil-especialidad') || ''),
                        direccion: String(datos.get('perfil-direccion') || ''),
                        ciudad: String(datos.get('perfil-ciudad') || taller.ciudad || ''),
                        descripcion: String(datos.get('perfil-descripcion') || ''),
                        horarios,
                      })
                      mostrarToast('Perfil actualizado')
                    } catch (error) {
                      mostrarToast(error.message)
                    }
                  }}
                >
                  <label className="mecanico-etiqueta">Nombre del taller</label>
                  <input className="mecanico-entrada" name="perfil-nombre" defaultValue={taller.nombre} />
                  <label className="mecanico-etiqueta">Especialidad</label>
                  <input className="mecanico-entrada" name="perfil-especialidad" defaultValue={taller.especialidad} />
                  <label className="mecanico-etiqueta">Dirección</label>
                  <input className="mecanico-entrada" name="perfil-direccion" defaultValue={taller.direccion} />
                  <label className="mecanico-etiqueta">Ciudad</label>
                  <input className="mecanico-entrada" name="perfil-ciudad" defaultValue={taller.ciudad || ''} />
                  <label className="mecanico-etiqueta">Descripción</label>
                  <textarea className="mecanico-entrada mecanico-textarea" name="perfil-descripcion" defaultValue={taller.descripcion} />
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
                            <input
                              className="mecanico-entrada"
                              type="time"
                              value={horario.abre}
                              onChange={(evento) =>
                                setHorarios((actuales) =>
                                  actuales.map((item, itemIndice) => (itemIndice === indice ? { ...item, abre: evento.target.value } : item)),
                                )
                              }
                            />
                            <small>a</small>
                            <input
                              className="mecanico-entrada"
                              type="time"
                              value={horario.cierra}
                              onChange={(evento) =>
                                setHorarios((actuales) =>
                                  actuales.map((item, itemIndice) => (itemIndice === indice ? { ...item, cierra: evento.target.value } : item)),
                                )
                              }
                            />
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
                {notificaciones.some((notificacion) => !notificacion.leida) && (
                  <MecanicoBoton
                    compacto
                    onClick={async () => {
                      try {
                        await ejecutarAccionMecanico('marcar_notificaciones', { id: 0 })
                        mostrarToast('Notificaciones marcadas')
                      } catch (error) {
                        mostrarToast(error.message)
                      }
                    }}
                  >
                    Marcar todas como leídas
                  </MecanicoBoton>
                )}
                {notificaciones.map((notificacion) => (
                  <article className="mecanico-notificacion" key={notificacion.id}>
                    <span className="mecanico-celda-icono">
                      <MecanicoIcon nombre={notificacion.tipo === 'presupuesto' ? 'presupuestos' : notificacion.tipo === 'resena' ? 'estrella' : 'solicitudes'} tamano={17} />
                    </span>
                    <div>
                      <p>{notificacion.titulo}</p>
                      <span>{notificacion.mensaje || notificacion.fecha}</span>
                      {!notificacion.leida && (
                        <button
                          className="mecanico-enlace-seccion"
                          type="button"
                          onClick={async () => {
                            try {
                              await ejecutarAccionMecanico('marcar_notificaciones', { id: notificacion.id })
                            } catch (error) {
                              mostrarToast(error.message)
                            }
                          }}
                        >
                          Marcar leída
                        </button>
                      )}
                    </div>
                  </article>
                ))}
                {notificaciones.length === 0 && <p className="mecanico-linea-subtitulo">No hay notificaciones.</p>}
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
                  value={presupuestoDraft.vehiculo_id || ''}
                  onChange={(evento) => {
                    const clienteElegido = clientes.find((cliente) => cliente.vehiculo_id === Number(evento.target.value))
                    setPresupuestoDraft((actual) => ({
                      ...actual,
                      cliente: clienteElegido ? clienteElegido.nombre : actual.cliente,
                      cliente_id: clienteElegido ? clienteElegido.cliente_id : actual.cliente_id,
                      vehiculo: clienteElegido ? `${clienteElegido.vehiculo} · ${clienteElegido.patente}` : actual.vehiculo,
                      vehiculo_id: clienteElegido ? clienteElegido.vehiculo_id : actual.vehiculo_id,
                    }))
                  }}
                >
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.vehiculo_id}>{cliente.nombre} · {cliente.vehiculo}</option>
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
              <form className="mecanico-modal-formulario" onSubmit={agregarServicioRealizado}>
                <label className="mecanico-etiqueta">Cliente / vehículo</label>
                <select className="mecanico-entrada" value={clienteSeleccionado} onChange={(evento) => setClienteSeleccionado(Number(evento.target.value))}>
                  {clientes.map((cliente) => (
                    <option value={cliente.id} key={cliente.id}>{cliente.nombre} · {cliente.vehiculo}</option>
                  ))}
                </select>
                <label className="mecanico-etiqueta">Servicio realizado</label>
                <select className="mecanico-entrada" name="servicio_id">
                  {servicios.map((servicio) => (
                    <option key={servicio.id} value={servicio.id}>{servicio.nombre}</option>
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
                <select className="mecanico-entrada" name="clienteId" defaultValue={clientes[0]?.id || ''}>
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

export function MecanicoPanel({ autenticado, usuario, onIngresar, onCerrarSesion, onCliente, pushDestino }) {
  if (!autenticado) {
    return <MecanicoLogin onIngresar={onIngresar} onCliente={onCliente} />
  }

  return <MecanicoPanelPrincipal usuario={usuario} onCerrarSesion={onCerrarSesion} pushDestino={pushDestino} />
}
