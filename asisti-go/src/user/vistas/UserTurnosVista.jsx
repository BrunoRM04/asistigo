import { UserIcon } from '../UserIcon'

export function UserTurnosVista({ tabActiva, onCambiarTab, turnos, turnosHistorial, badgeEstado }) {
  const lista = tabActiva === 'proximos' ? turnos : turnosHistorial

  return (
    <section className="user-vista">
      <div className="user-titulo-bloque">
        <h1 className="user-titulo-pagina">Mis turnos</h1>
        <p className="user-subtitulo-pagina">Gestiona tus reservas en talleres.</p>
      </div>

      <div className="user-pestanas">
        <button
          className={`user-pestana ${tabActiva === 'proximos' ? 'user-pestana-activa' : ''}`}
          type="button"
          onClick={() => onCambiarTab('proximos')}
        >
          Proximos
        </button>
        <button
          className={`user-pestana ${tabActiva === 'historial' ? 'user-pestana-activa' : ''}`}
          type="button"
          onClick={() => onCambiarTab('historial')}
        >
          Historial
        </button>
      </div>

      <div className="user-lista-turnos">
        {lista.map((t) => (
          <article key={t.id} className="user-turno-card">
            <div className="user-turno-fecha">
              <strong>{t.fecha.split(' ')[0]}</strong>
              <span>{t.fecha.split(' ')[1]}</span>
            </div>
            <div className="user-turno-info">
              <div className="user-fila-resumen">
                <p className="user-linea-titulo">{t.servicio}</p>
                {badgeEstado(t.estado)}
              </div>
              <p className="user-linea-subtitulo">{t.taller} - {t.vehiculo}</p>
              <p className="user-turno-hora"><UserIcon name="clock" size={14} /> {t.hora} hs</p>
              <div className="user-fila-botones user-turno-actions">
                <button className="user-boton user-boton-secundario" type="button">
                  Chat
                </button>
                <button className="user-boton user-boton-secundario user-boton-outline" type="button">
                  {t.estado === 'completado' ? 'Calificar' : 'Cancelar'}
                </button>
              </div>
            </div>
          </article>
        ))}

        {lista.length === 0 && (
          <div className="user-empty">
            <UserIcon name="calendar" size={34} />
            <p>No hay turnos en esta seccion</p>
          </div>
        )}
      </div>
    </section>
  )
}
