import { useState } from 'react'
import { UserIcon } from '../UserIcon'
import { MapaUbicacionesTaller } from '../componentes/MapaUbicacionesTaller'

const USER_CHIPS = ['todos', 'cercanos', 'mejor calificados', 'abiertos ahora']

export function UserTalleresVista({
  valorBusqueda,
  onCambiarBusqueda,
  chipActivo,
  onCambiarChip,
  talleres,
  ubicacionCliente,
  ubicacionConfigurada,
  onIrPerfil,
  vehiculos,
  onIrVehiculos,
  onReservarTurno,
  onPedirPresupuesto,
}) {
  const [accion, setAccion] = useState(null)
  const [tallerMapa, setTallerMapa] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const abrirAccion = (tipo, taller) => {
    setAccion({ tipo, taller })
    setError('')
  }

  const abrirMapaTaller = (taller) => {
    setTallerMapa(taller)
  }

  const cerrarMapaTaller = () => {
    setTallerMapa(null)
  }

  const cerrarAccion = () => {
    setAccion(null)
    setGuardando(false)
    setError('')
  }

  const enviarAccion = async (evento) => {
    evento.preventDefault()
    if (!accion) return

    const datos = new FormData(evento.currentTarget)
    const vehiculoId = Number(datos.get('vehiculo_id') || 0)
    const servicioId = Number(datos.get('taller_servicio_id') || 0)
    const servicio = accion.taller.servicios.find((item) => item.id === servicioId)

    setGuardando(true)
    setError('')

    try {
      if (accion.tipo === 'turno') {
        await onReservarTurno({
          taller_id: accion.taller.id,
          vehiculo_id: vehiculoId,
          taller_servicio_id: servicioId || null,
          servicio_descripcion: servicio?.nombre || String(datos.get('servicio_descripcion') || ''),
          fecha: String(datos.get('fecha') || ''),
          hora: String(datos.get('hora') || ''),
          notas_cliente: String(datos.get('mensaje') || '').trim(),
        })
      } else {
        await onPedirPresupuesto({
          taller_id: accion.taller.id,
          vehiculo_id: vehiculoId,
          asunto: servicio?.nombre || String(datos.get('asunto') || 'Solicitud de presupuesto'),
          mensaje: String(datos.get('mensaje') || '').trim(),
        })
      }
      cerrarAccion()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const textoDistancia = (distancia) => {
    const valor = Number(distancia)
    return Number.isFinite(valor) ? `${valor.toFixed(1)} km` : 'Distancia no disponible'
  }

  return (
    <section className="user-vista">
      <div className="user-titulo-bloque">
        <h1 className="user-titulo-pagina">Buscar talleres</h1>
        <p className="user-subtitulo-pagina">Encontra talleres cerca y pedi presupuesto o turno.</p>
      </div>

      {!ubicacionConfigurada && (
        <div className="user-aviso-ubicacion">
          <UserIcon name="search" size={18} />
          <p>
            No tenes una direccion guardada, asi que estamos mostrando talleres sin poder calcular la distancia real. {' '}
            <button className="user-acceso-link" type="button" onClick={onIrPerfil}>
              Configura tu direccion
            </button>{' '}
            para ver solo los talleres a menos de 30 km tuyo.
          </p>
        </div>
      )}

      <div className="user-fila-busqueda">
        <UserIcon name="search" size={18} />
        <input
          className="user-entrada"
          type="text"
          placeholder="Buscar taller, servicio o zona"
          value={valorBusqueda}
          onChange={(e) => onCambiarBusqueda(e.target.value)}
        />
      </div>

      <div className="user-fila-chips">
        {USER_CHIPS.map((chip) => (
          <button
            key={chip}
            className={`user-ficha-filtro ${chipActivo === chip ? 'user-ficha-filtro-activa' : ''}`}
            type="button"
            onClick={() => onCambiarChip(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="user-lista-talleres">
        {talleres.map((t) => (
          <article key={t.id} className="user-taller-card">
            <div className="user-taller-top">
              <span className="user-icono-redondo"><UserIcon name="wrench" size={23} /></span>
              <div className="user-taller-info">
                <p className="user-linea-titulo">{t.nombre}</p>
                <div className="user-taller-meta">
                  <span className="user-stars">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <UserIcon key={n} name="star" size={13} />
                    ))}
                  </span>
                  <span>{t.rating.toFixed(1)}</span>
                  <span>{textoDistancia(t.distancia)}</span>
                  <span className={t.abierto ? 'user-estado-abierto' : 'user-estado-cerrado'}>
                    {t.abierto ? 'Abierto ahora' : 'Cerrado'}
                  </span>
                </div>
              </div>
            </div>
            <p className="user-texto-mute">{t.especialidad}</p>
            <div className="user-tags">
              {t.tags.map((tag) => (
                <span className="user-tag" key={tag}>{tag}</span>
              ))}
            </div>
            <div className="user-fila-botones">
              <button className="user-boton user-boton-outline" type="button" onClick={() => abrirMapaTaller(t)}>
                Ver ubicacion
              </button>
              <button className="user-boton user-boton-secundario" type="button" onClick={() => abrirAccion('presupuesto', t)}>
                Pedir presupuesto
              </button>
              <button className="user-boton user-boton-principal" type="button" onClick={() => abrirAccion('turno', t)}>
                Reservar turno
              </button>
            </div>
          </article>
        ))}

        {talleres.length === 0 && (
          <div className="user-empty">
            <UserIcon name="search" size={34} />
            <p>
              {ubicacionConfigurada
                ? 'No encontramos talleres a menos de 30 km de tu direccion'
                : 'No encontramos talleres con esa busqueda'}
            </p>
          </div>
        )}
      </div>

      {accion && (
        <div className="user-modal-fondo">
          <div className="user-modal" role="dialog" aria-modal="true" aria-labelledby="user-taller-accion-titulo">
            <div className="user-modal-cabecera">
              <div>
                <p className="user-eyebrow">{accion.taller.nombre}</p>
                <h2 className="user-titulo-seccion" id="user-taller-accion-titulo">
                  {accion.tipo === 'turno' ? 'Reservar turno' : 'Pedir presupuesto'}
                </h2>
              </div>
              <button className="user-boton-icono" type="button" onClick={cerrarAccion} aria-label="Cerrar formulario">
                <UserIcon name="back" size={18} />
              </button>
            </div>

            {vehiculos.length === 0 ? (
              <div className="user-empty">
                <UserIcon name="car" size={34} />
                <p>Primero carga un vehiculo para continuar</p>
                <button className="user-boton user-boton-principal" type="button" onClick={onIrVehiculos}>
                  Ir a mis vehiculos
                </button>
              </div>
            ) : (
              <form className="user-formulario-vehiculo" onSubmit={enviarAccion}>
                <div className="user-formulario-grid">
                  <label className="user-campo user-campo-ancho">
                    <span>Vehiculo *</span>
                    <select className="user-entrada" name="vehiculo_id" required>
                      <option value="">Seleccionar</option>
                      {vehiculos.map((vehiculo) => (
                        <option key={vehiculo.id} value={vehiculo.id}>
                          {vehiculo.marca} {vehiculo.modelo} - {vehiculo.patente}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="user-campo user-campo-ancho">
                    <span>Servicio</span>
                    <select className="user-entrada" name="taller_servicio_id">
                      <option value="">Consulta general</option>
                      {accion.taller.servicios.map((servicio) => (
                        <option key={servicio.id} value={servicio.id}>
                          {servicio.nombre}
                        </option>
                      ))}
                    </select>
                  </label>

                  {accion.tipo === 'turno' && (
                    <>
                      <label className="user-campo">
                        <span>Fecha *</span>
                        <input className="user-entrada" type="date" name="fecha" required />
                      </label>
                      <label className="user-campo">
                        <span>Hora *</span>
                        <input className="user-entrada" type="time" name="hora" required />
                      </label>
                      <label className="user-campo user-campo-ancho">
                        <span>Servicio si no esta listado</span>
                        <input className="user-entrada" name="servicio_descripcion" placeholder="Ej: revision general, frenos, electricidad" />
                      </label>
                    </>
                  )}

                  <label className="user-campo user-campo-ancho">
                    <span>{accion.tipo === 'turno' ? 'Notas para el taller' : 'Detalle del pedido *'}</span>
                    <textarea
                      className="user-entrada user-textarea"
                      name="mensaje"
                      placeholder="Conta brevemente que necesitas"
                      required={accion.tipo !== 'turno'}
                    />
                  </label>
                </div>

                <div className="user-modal-pie">
                  {error && <p className="user-registro-error">{error}</p>}
                  <button className="user-boton user-boton-secundario" type="button" onClick={cerrarAccion}>
                    Cancelar
                  </button>
                  <button className="user-boton user-boton-principal" type="submit" disabled={guardando}>
                    {guardando ? 'Enviando...' : accion.tipo === 'turno' ? 'Reservar' : 'Enviar pedido'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {tallerMapa && (
        <MapaUbicacionesTaller
          taller={tallerMapa}
          ubicacionCliente={ubicacionCliente}
          onCerrar={cerrarMapaTaller}
        />
      )}
    </section>
  )
}
