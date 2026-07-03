import { UserIcon } from '../UserIcon'

const USER_CHIPS = ['todos', 'cercanos', 'mejor calificados', 'abiertos ahora']

export function UserTalleresVista({
  valorBusqueda,
  onCambiarBusqueda,
  chipActivo,
  onCambiarChip,
  talleres,
  onIrTurnos,
}) {
  return (
    <section className="user-vista">
      <div className="user-titulo-bloque">
        <h1 className="user-titulo-pagina">Buscar talleres</h1>
        <p className="user-subtitulo-pagina">Encontra talleres cerca y pedi presupuesto o turno.</p>
      </div>

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
                  <span>{t.distancia.toFixed(1)} km</span>
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
              <button className="user-boton user-boton-secundario" type="button">
                Pedir presupuesto
              </button>
              <button className="user-boton user-boton-principal" type="button" onClick={onIrTurnos}>
                Reservar turno
              </button>
            </div>
          </article>
        ))}

        {talleres.length === 0 && (
          <div className="user-empty">
            <UserIcon name="search" size={34} />
            <p>No encontramos talleres con esa busqueda</p>
          </div>
        )}
      </div>
    </section>
  )
}
