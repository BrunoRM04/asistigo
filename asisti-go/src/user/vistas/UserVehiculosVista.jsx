import { UserIcon } from '../UserIcon'

export function UserVehiculosVista({ vehiculos }) {
  return (
    <section className="user-vista">
      <div className="user-titulo-bloque">
        <h1 className="user-titulo-pagina">Mis vehiculos</h1>
        <p className="user-subtitulo-pagina">Registra, revisa y actualiza tus autos y motos.</p>
      </div>

      <div className="user-cuadricula-vehiculos">
        {vehiculos.map((v) => (
          <article key={v.id} className="user-vehiculo-card">
            <span className="user-vehiculo-card-icono"><UserIcon name="car" size={28} /></span>
            <div className="user-vehiculo-card-info">
              <p className="user-vehiculo-nombre">
                {v.marca} {v.modelo}
              </p>
              <p className="user-patente user-patente-inline">{v.patente}</p>
              <div className="user-vehiculo-meta">
                <span><b>{v.anio}</b> modelo</span>
                <span><b>{v.km.toLocaleString('es-AR')}</b> km</span>
                <span><b>{v.salud}%</b> salud</span>
              </div>
            </div>
            <UserIcon name="arrow" size={20} className="user-chev" />
          </article>
        ))}

        <article className="user-vehiculo-card user-vehiculo-card-agregar">
          <span className="user-vehiculo-card-icono"><UserIcon name="plus" size={25} /></span>
          <div className="user-vehiculo-card-info">
            <p className="user-linea-titulo">Agregar vehiculo</p>
            <p className="user-linea-subtitulo">Auto, moto o utilitario</p>
          </div>
        </article>
      </div>

      <div className="user-tarjeta user-detalle-vehiculo">
        <div className="user-detalle-top">
          <span className="user-icono-redondo"><UserIcon name="shield" size={24} /></span>
          <div>
            <p className="user-eyebrow">Documentacion y mantenimiento</p>
            <h2 className="user-titulo-seccion">Resumen operativo</h2>
          </div>
        </div>
        <div className="user-cuadricula-estadisticas">
          <article className="user-tarjeta-estadistica">
            <strong>{vehiculos.length}</strong>
            <span>Vehiculos activos</span>
          </article>
          <article className="user-tarjeta-estadistica">
            <strong>{vehiculos.reduce((total, v) => total + v.historial.length, 0)}</strong>
            <span>Servicios cargados</span>
          </article>
          <article className="user-tarjeta-estadistica">
            <strong>{Math.round(vehiculos.reduce((total, v) => total + v.salud, 0) / vehiculos.length)}%</strong>
            <span>Salud promedio</span>
          </article>
        </div>
      </div>
    </section>
  )
}
