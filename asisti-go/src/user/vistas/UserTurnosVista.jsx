import { useState } from 'react'
import { UserIcon } from '../UserIcon'

export function UserTurnosVista({
  tabActiva,
  onCambiarTab,
  turnos,
  turnosHistorial,
  badgeEstado,
  onCancelarTurno,
  onCalificarTurno,
  onAbrirChat,
}) {
  const lista = tabActiva === 'proximos' ? turnos : turnosHistorial
  const [turnoCalificando, setTurnoCalificando] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const cancelarTurno = async (turno) => {
    if (!window.confirm('¿Cancelar este turno?')) return
    setError('')
    try {
      await onCancelarTurno(turno.id)
    } catch (err) {
      setError(err.message)
    }
  }

  const calificarTurno = async (evento) => {
    evento.preventDefault()
    if (!turnoCalificando) return

    const datos = new FormData(evento.currentTarget)
    setGuardando(true)
    setError('')

    try {
      await onCalificarTurno({
        turno_id: turnoCalificando.id,
        puntuacion: Number(datos.get('puntuacion') || 5),
        comentario: String(datos.get('comentario') || '').trim(),
      })
      setTurnoCalificando(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

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

      {error && (
        <div className="user-alerta">
          <span className="user-alerta-icono"><UserIcon name="alert" size={20} /></span>
          <div>
            <p className="user-linea-titulo">No se pudo completar la accion</p>
            <p className="user-linea-subtitulo">{error}</p>
          </div>
        </div>
      )}

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
                <button className="user-boton user-boton-secundario" type="button" onClick={onAbrirChat}>
                  Chat
                </button>
                <button
                  className="user-boton user-boton-secundario user-boton-outline"
                  type="button"
                  onClick={() => (t.estado === 'completado' ? setTurnoCalificando(t) : cancelarTurno(t))}
                  disabled={t.estado === 'cancelado' || t.estado === 'no_asistio' || Boolean(t.resena)}
                >
                  {t.estado === 'completado' ? 'Calificar' : 'Cancelar'}
                </button>
              </div>
              {t.resena && (
                <p className="user-linea-subtitulo">Calificado con {t.resena.puntuacion}/5</p>
              )}
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

      {turnoCalificando && (
        <div className="user-modal-fondo">
          <div className="user-modal" role="dialog" aria-modal="true" aria-labelledby="user-resena-titulo">
            <div className="user-modal-cabecera">
              <div>
                <p className="user-eyebrow">{turnoCalificando.taller}</p>
                <h2 className="user-titulo-seccion" id="user-resena-titulo">Calificar servicio</h2>
              </div>
              <button className="user-boton-icono" type="button" onClick={() => setTurnoCalificando(null)} aria-label="Cerrar formulario">
                <UserIcon name="back" size={18} />
              </button>
            </div>
            <form className="user-formulario-vehiculo" onSubmit={calificarTurno}>
              <div className="user-formulario-grid">
                <label className="user-campo">
                  <span>Puntuacion *</span>
                  <select className="user-entrada" name="puntuacion" defaultValue="5" required>
                    <option value="5">5 - Excelente</option>
                    <option value="4">4 - Muy bueno</option>
                    <option value="3">3 - Correcto</option>
                    <option value="2">2 - Regular</option>
                    <option value="1">1 - Malo</option>
                  </select>
                </label>
                <label className="user-campo user-campo-ancho">
                  <span>Comentario</span>
                  <textarea className="user-entrada user-textarea" name="comentario" placeholder="Conta como fue la experiencia" />
                </label>
              </div>
              <div className="user-modal-pie">
                {error && <p className="user-registro-error">{error}</p>}
                <button className="user-boton user-boton-secundario" type="button" onClick={() => setTurnoCalificando(null)}>
                  Cancelar
                </button>
                <button className="user-boton user-boton-principal" type="submit" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Publicar reseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
