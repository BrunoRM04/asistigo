import { UserIcon } from '../UserIcon'

export function UserNotificacionesVista({ notificaciones, onMarcarNotificacion, onIr }) {
  return (
    <section className="user-vista">
      <div className="user-titulo-bloque">
        <h1 className="user-titulo-pagina">Notificaciones</h1>
        <p className="user-subtitulo-pagina">Revisa avisos de turnos, presupuestos y actividad de tu cuenta.</p>
      </div>

      <div className="user-tarjeta">
        <div className="user-tarjeta-encabezado user-section-head">
          <h2 className="user-titulo-seccion">Centro de notificaciones</h2>
          {notificaciones.some((notificacion) => !notificacion.leida) && (
            <button className="user-link-seccion" type="button" onClick={() => onMarcarNotificacion(0)}>
              Marcar todas <UserIcon name="arrow" size={14} />
            </button>
          )}
        </div>

        <div className="user-linea-tiempo user-notificaciones-lista">
          {notificaciones.map((notificacion) => (
            <article
              key={notificacion.id}
              className={`user-linea-item user-notificacion-item ${notificacion.leida ? '' : 'user-notificacion-item-nueva'}`}
            >
              <div className="user-linea-rail">
                <div className="user-linea-punto" />
                <div className="user-linea-guia" />
              </div>
              <div>
                <p className="user-linea-titulo">{notificacion.titulo}</p>
                <p className="user-linea-subtitulo">{notificacion.mensaje || notificacion.fecha}</p>
                <div className="user-fila-botones user-notificacion-acciones">
                  {notificacion.url_accion && (
                    <button className="user-boton user-boton-secundario" type="button" onClick={() => onIr(notificacion.url_accion)}>
                      Abrir
                    </button>
                  )}
                  {!notificacion.leida && (
                    <button className="user-boton user-boton-secundario user-boton-outline" type="button" onClick={() => onMarcarNotificacion(notificacion.id)}>
                      Marcar leida
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}

          {notificaciones.length === 0 && (
            <div className="user-empty">
              <UserIcon name="bell" size={34} />
              <p>No tenes notificaciones</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
