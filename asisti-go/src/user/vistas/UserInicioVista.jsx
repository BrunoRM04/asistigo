import { UserIcon } from '../UserIcon'

export function UserInicioVista({ vehiculo, vehiculos, recordatorios = [], onIr, onAbrirIA }) {
  if (!vehiculo) {
    return (
      <section className="user-vista">
        <div className="user-tarjeta user-empty">
          <UserIcon name="car" size={34} />
          <p>Todavia no tenes vehiculos cargados.</p>
          <button className="user-boton user-boton-principal" type="button" onClick={() => onIr('vehiculos')}>
            Agregar primer vehiculo
          </button>
        </div>
      </section>
    )
  }

  const circunferencia = 2 * Math.PI * 48
  const progreso = circunferencia - (vehiculo.salud / 100) * circunferencia

  return (
    <section className="user-vista">
      <div className="user-cuadricula-inicio">
        <div className="user-tarjeta user-tarjeta-salud">
          <div className="user-gauge-top">
            <div>
              <p className="user-eyebrow">Vehiculo principal</p>
              <h2 className="user-vehiculo-nombre">
                {vehiculo.marca} {vehiculo.modelo}
              </h2>
            </div>
            <span className="user-patente">{vehiculo.patente}</span>
          </div>

          <div className="user-salud-fila">
            <div className="user-salud-circulo" aria-label={`Salud del vehiculo ${vehiculo.salud}%`}>
              <svg viewBox="0 0 120 120">
                <circle className="user-salud-base" cx="60" cy="60" r="48" />
                <circle
                  className="user-salud-progreso"
                  cx="60"
                  cy="60"
                  r="48"
                  strokeDasharray={circunferencia}
                  strokeDashoffset={progreso}
                />
              </svg>
              <div>
                <strong>{vehiculo.salud}%</strong>
                <span>salud</span>
              </div>
            </div>
            <div className="user-gauge-info">
              <p className="user-km-dato">{vehiculo.km.toLocaleString('es-AR')} <span>km actuales</span></p>
              <p className="user-texto-mute">
                Proximo servicio: <b>{vehiculo.proximo_servicio}</b>
              </p>
              <p className="user-texto-mute">
                Recomendado a los {vehiculo.proximo_km.toLocaleString('es-AR')} km
              </p>
            </div>
          </div>
        </div>

        <div className="user-tarjeta">
          <div className="user-tarjeta-encabezado user-section-head">
            <h2 className="user-titulo-seccion">Acciones rapidas</h2>
          </div>
          <div className="user-cuadricula-acciones">
            <button className="user-accion" type="button" onClick={() => onIr('talleres')}>
              <span><UserIcon name="search" size={20} /></span>
              Buscar taller
            </button>
            <button className="user-accion" type="button" onClick={() => onIr('turnos')}>
              <span><UserIcon name="calendar" size={20} /></span>
              Nuevo turno
            </button>
            <button className="user-accion" type="button" onClick={onAbrirIA}>
              <span><UserIcon name="spark" size={20} /></span>
              IA: sintomas
            </button>
            <button className="user-accion" type="button" onClick={() => onIr('vehiculos')}>
              <span><UserIcon name="file" size={20} /></span>
              Historial
            </button>
          </div>
        </div>

        {recordatorios.length > 0 && (
          <div className="user-alerta user-recordatorio-inicio">
            <span className="user-alerta-icono"><UserIcon name="alert" size={20} /></span>
            <div>
              <p className="user-linea-titulo">{recordatorios[0].titulo}</p>
              <p className="user-linea-subtitulo">
                {recordatorios[0].descripcion || recordatorios[0].fecha_objetivo || 'Tenes un mantenimiento pendiente.'}
              </p>
            </div>
          </div>
        )}

        <div className="user-tarjeta">
          <div className="user-tarjeta-encabezado user-section-head">
            <h2 className="user-titulo-seccion">Actividad reciente</h2>
          </div>
          <div className="user-linea-tiempo">
            {vehiculo.historial.map((h) => (
              <article key={`${h.fecha}-${h.servicio}`} className="user-linea-item">
                <div className="user-linea-rail">
                  <div className="user-linea-punto" />
                  <div className="user-linea-guia" />
                </div>
                <div>
                  <p className="user-linea-titulo">{h.servicio}</p>
                  <p className="user-linea-subtitulo">
                    {h.taller} - {h.fecha} - ${h.costo.toLocaleString('es-AR')}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="user-tarjeta">
          <div className="user-tarjeta-encabezado user-section-head">
            <h2 className="user-titulo-seccion">Mis vehiculos</h2>
            <button className="user-link-seccion" type="button" onClick={() => onIr('vehiculos')}>
              Ver todos <UserIcon name="arrow" size={14} />
            </button>
          </div>
          <div className="user-scroll-horizontal">
            {vehiculos.map((v) => (
              <article key={v.id} className="user-mini-vehiculo">
                <div className="user-mini-top">
                  <span className="user-icono-redondo"><UserIcon name="car" size={21} /></span>
                  <div>
                    <p className="user-linea-titulo">{v.marca} {v.modelo}</p>
                    <p className="user-linea-subtitulo">{v.patente}</p>
                  </div>
                </div>
                <div className="user-mini-barra"><i style={{ width: `${v.salud}%` }} /></div>
                <div className="user-fila-resumen user-mini-foot">
                  <span>{v.km.toLocaleString('es-AR')} km</span>
                  <span>{v.salud}%</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
