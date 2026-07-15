import { useState } from 'react'
import { UserIcon } from '../UserIcon'
import { useUbicacion } from '../../hooks/useUbicacion'

export function UserPerfilVista({
  perfil,
  vehiculos,
  recordatorios,
  onIr,
  onCerrarSesion,
  onActualizarPerfil,
}) {
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [direccion, setDireccion] = useState(perfil.direccion_principal?.direccion || '')
  const [direccionCiudad, setDireccionCiudad] = useState(perfil.direccion_principal?.ciudad || perfil.ciudad || '')
  const [direccionPais, setDireccionPais] = useState(perfil.direccion_principal?.pais || perfil.pais || 'Uruguay')
  const {
    coords: ubicacion,
    setCoords: setUbicacion,
    mensaje: ubicacionMensaje,
    cargando: buscandoUbicacion,
    usarUbicacionActual,
    buscarDireccion,
  } = useUbicacion()

  const abrirEdicion = () => {
    setUbicacion({
      latitud: perfil.direccion_principal?.latitud != null ? String(perfil.direccion_principal.latitud) : '',
      longitud: perfil.direccion_principal?.longitud != null ? String(perfil.direccion_principal.longitud) : '',
    })
    setEditando(true)
  }

  const usarMiUbicacion = async () => {
    const data = await usarUbicacionActual()
    if (data) {
      setDireccion(data.direccion || data.display_name || direccion)
      setDireccionCiudad(data.ciudad || direccionCiudad)
    }
  }

  const verificarDireccion = async () => {
    const data = await buscarDireccion(direccion, direccionCiudad, direccionPais)
    if (data) {
      setDireccion(data.direccion || data.display_name || direccion)
      setDireccionCiudad(data.ciudad || direccionCiudad)
    }
  }

  const guardarPerfil = async (evento) => {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    setGuardando(true)
    setError('')

    try {
      await onActualizarPerfil({
        nombre: String(datos.get('nombre') || '').trim(),
        apellido: String(datos.get('apellido') || '').trim(),
        telefono: String(datos.get('telefono') || '').trim(),
        pais: String(datos.get('pais') || '').trim(),
        ciudad: String(datos.get('ciudad') || '').trim(),
        preferencias: {
          notificaciones_email: datos.get('notificaciones_email') === 'on',
          notificaciones_push: datos.get('notificaciones_push') === 'on',
          recordatorios_mantenimiento: datos.get('recordatorios_mantenimiento') === 'on',
          idioma: String(datos.get('idioma') || 'es'),
          moneda: String(datos.get('moneda') || 'UYU'),
        },
        direccion_principal: {
          alias: String(datos.get('direccion_alias') || '').trim(),
          direccion: String(datos.get('direccion') || '').trim(),
          ciudad: String(datos.get('direccion_ciudad') || '').trim(),
          pais: String(datos.get('direccion_pais') || '').trim(),
          latitud: ubicacion.latitud,
          longitud: ubicacion.longitud,
        },
      })
      setEditando(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <section className="user-vista">
      <div className="user-perfil-cabecera">
        <div className="user-avatar user-avatar-grande">{perfil.inicial}</div>
        <p className="user-perfil-nombre">{perfil.nombre}</p>
        <p className="user-texto-mute">{perfil.email || 'Sin email cargado'}</p>
        <button className="user-boton user-boton-principal" type="button" onClick={abrirEdicion}>
          Editar perfil
        </button>
      </div>

      <div className="user-cuadricula-estadisticas">
        <article className="user-tarjeta user-tarjeta-estadistica">
          <strong>{vehiculos.length}</strong>
          <span>Vehiculos</span>
        </article>
        <article className="user-tarjeta user-tarjeta-estadistica">
          <strong>{vehiculos.reduce((t, v) => t + v.historial.length, 0)}</strong>
          <span>Servicios</span>
        </article>
        <article className="user-tarjeta user-tarjeta-estadistica">
          <strong>4.8</strong>
          <span>Tu rating prom.</span>
        </article>
      </div>

      <div className="user-menu-perfil">
        <button className="user-menu-perfil-item" type="button" onClick={() => onIr('vehiculos')}>
          <UserIcon name="car" size={19} />
          Mis vehiculos
        </button>
        <button className="user-menu-perfil-item" type="button" onClick={() => onIr('notificaciones')}>
          <UserIcon name="bell" size={19} />
          Notificaciones
        </button>
        <button className="user-menu-perfil-item user-menu-perfil-salida" type="button" onClick={onCerrarSesion}>
          <UserIcon name="logout" size={19} />
          Cerrar sesion
        </button>
      </div>

      <div className="user-tarjeta">
        <div className="user-tarjeta-encabezado user-section-head">
          <h2 className="user-titulo-seccion">Recordatorios</h2>
        </div>
        <div className="user-linea-tiempo">
          {recordatorios.map((recordatorio) => (
            <article key={recordatorio.id} className="user-linea-item">
              <div className="user-linea-rail">
                <div className="user-linea-punto" />
                <div className="user-linea-guia" />
              </div>
              <div>
                <p className="user-linea-titulo">{recordatorio.titulo}</p>
                <p className="user-linea-subtitulo">
                  {recordatorio.fecha_objetivo || `${recordatorio.kilometraje_objetivo || 0} km`} - {recordatorio.estado}
                </p>
              </div>
            </article>
          ))}
          {recordatorios.length === 0 && (
            <div className="user-empty">
              <UserIcon name="shield" size={34} />
              <p>No hay recordatorios cargados</p>
            </div>
          )}
        </div>
      </div>

      {editando && (
        <div className="user-modal-fondo">
          <div className="user-modal" role="dialog" aria-modal="true" aria-labelledby="user-perfil-form-titulo">
            <div className="user-modal-cabecera">
              <div>
                <p className="user-eyebrow">Cuenta de cliente</p>
                <h2 className="user-titulo-seccion" id="user-perfil-form-titulo">Editar perfil</h2>
              </div>
              <button className="user-boton-icono" type="button" onClick={() => setEditando(false)} aria-label="Cerrar formulario">
                <UserIcon name="back" size={18} />
              </button>
            </div>

            <form className="user-formulario-vehiculo" onSubmit={guardarPerfil}>
              <div className="user-formulario-grid">
                <label className="user-campo">
                  <span>Nombre *</span>
                  <input className="user-entrada" name="nombre" defaultValue={perfil.nombre_solo || ''} required />
                </label>
                <label className="user-campo">
                  <span>Apellido *</span>
                  <input className="user-entrada" name="apellido" defaultValue={perfil.apellido || ''} required />
                </label>
                <label className="user-campo">
                  <span>Telefono</span>
                  <input className="user-entrada" name="telefono" defaultValue={perfil.telefono || ''} />
                </label>
                <label className="user-campo">
                  <span>Ciudad</span>
                  <input className="user-entrada" name="ciudad" defaultValue={perfil.ciudad || ''} />
                </label>
                <label className="user-campo">
                  <span>Pais</span>
                  <input className="user-entrada" name="pais" defaultValue={perfil.pais || 'Uruguay'} />
                </label>
                <label className="user-campo">
                  <span>Moneda</span>
                  <select className="user-entrada" name="moneda" defaultValue={perfil.preferencias?.moneda || 'UYU'}>
                    <option value="UYU">UYU</option>
                    <option value="USD">USD</option>
                    <option value="ARS">ARS</option>
                  </select>
                </label>
                <label className="user-campo">
                  <span>Idioma</span>
                  <select className="user-entrada" name="idioma" defaultValue={perfil.preferencias?.idioma || 'es'}>
                    <option value="es">Español</option>
                    <option value="en">Ingles</option>
                    <option value="pt">Portugues</option>
                  </select>
                </label>
                <label className="user-campo">
                  <span>Alias direccion</span>
                  <input className="user-entrada" name="direccion_alias" defaultValue={perfil.direccion_principal?.alias || ''} />
                </label>
                <label className="user-campo user-campo-ancho">
                  <span>Direccion principal</span>
                  <input
                    className="user-entrada"
                    name="direccion"
                    value={direccion}
                    onChange={(evento) => setDireccion(evento.target.value)}
                  />
                </label>
                <label className="user-campo">
                  <span>Ciudad direccion</span>
                  <input
                    className="user-entrada"
                    name="direccion_ciudad"
                    value={direccionCiudad}
                    onChange={(evento) => setDireccionCiudad(evento.target.value)}
                  />
                </label>
                <label className="user-campo">
                  <span>Pais direccion</span>
                  <input
                    className="user-entrada"
                    name="direccion_pais"
                    value={direccionPais}
                    onChange={(evento) => setDireccionPais(evento.target.value)}
                  />
                </label>
                <div className="user-campo-ancho mecanico-registro-ubicacion">
                  <button className="user-boton user-boton-secundario" type="button" onClick={usarMiUbicacion} disabled={buscandoUbicacion}>
                    Usar mi ubicacion
                  </button>
                  <button className="user-boton user-boton-secundario" type="button" onClick={verificarDireccion} disabled={buscandoUbicacion}>
                    Buscar direccion
                  </button>
                  {ubicacionMensaje && <p>{ubicacionMensaje}</p>}
                </div>
                <label className="user-campo">
                  <span>Email</span>
                  <input className="user-entrada" value={perfil.email || ''} disabled readOnly />
                </label>
                <label className="user-campo">
                  <span>
                    <input name="notificaciones_email" type="checkbox" defaultChecked={perfil.preferencias?.notificaciones_email !== false} />
                    Emails
                  </span>
                </label>
                <label className="user-campo">
                  <span>
                    <input name="notificaciones_push" type="checkbox" defaultChecked={perfil.preferencias?.notificaciones_push !== false} />
                    Push
                  </span>
                </label>
                <label className="user-campo">
                  <span>
                    <input name="recordatorios_mantenimiento" type="checkbox" defaultChecked={perfil.preferencias?.recordatorios_mantenimiento !== false} />
                    Recordatorios
                  </span>
                </label>
              </div>
              <div className="user-modal-pie">
                {error && <p className="user-registro-error">{error}</p>}
                <button className="user-boton user-boton-secundario" type="button" onClick={() => setEditando(false)}>
                  Cancelar
                </button>
                <button className="user-boton user-boton-principal" type="submit" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
