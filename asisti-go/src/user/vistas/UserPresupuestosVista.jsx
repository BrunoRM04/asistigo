import { UserIcon } from '../UserIcon'

export function UserPresupuestosVista({ presupuestos, badgeEstado, onCambiarEstado }) {
  return (
    <section className="user-vista">
      <div className="user-titulo-bloque">
        <h1 className="user-titulo-pagina">Presupuestos</h1>
        <p className="user-subtitulo-pagina">Compara y acepta los presupuestos recibidos.</p>
      </div>

      <div className="user-lista-presupuestos">
        {presupuestos.map((p) => (
          <article key={p.id} className="user-presupuesto-card">
            <div className="user-fila-resumen">
              <div className="user-presupuesto-titulo">
                <span className="user-icono-redondo"><UserIcon name="file" size={20} /></span>
                <div>
                  <p className="user-linea-titulo">{p.servicio}</p>
                  <p className="user-linea-subtitulo">{p.taller} - {p.vehiculo}</p>
                </div>
              </div>
              {badgeEstado(p.estado)}
            </div>
            <div className="user-presupuesto-items">
              {p.items.map((item) => (
                <div className="user-presupuesto-linea" key={item.detalle}>
                  <span>{item.detalle}</span>
                  <b>${item.costo.toLocaleString('es-AR')}</b>
                </div>
              ))}
            </div>
            <div className="user-presupuesto-total">
              <span>{p.tipo === 'solicitud' ? 'Estado del pedido' : 'Total estimado'}</span>
              <strong>{p.tipo === 'solicitud' ? 'En revision' : `$${p.total.toLocaleString('es-AR')}`}</strong>
            </div>

            {p.estado === 'pendiente' && p.tipo !== 'solicitud' && (
              <div className="user-fila-botones">
                <button
                  className="user-boton user-boton-secundario"
                  type="button"
                  onClick={() => onCambiarEstado(p.id, 'rechazado')}
                >
                  Rechazar
                </button>
                <button
                  className="user-boton user-boton-principal"
                  type="button"
                  onClick={() => onCambiarEstado(p.id, 'aceptado')}
                >
                  Aceptar
                </button>
              </div>
            )}
          </article>
        ))}

        {presupuestos.length === 0 && (
          <div className="user-empty">
            <UserIcon name="file" size={34} />
            <p>No hay presupuestos ni solicitudes cargadas</p>
          </div>
        )}
      </div>
    </section>
  )
}
