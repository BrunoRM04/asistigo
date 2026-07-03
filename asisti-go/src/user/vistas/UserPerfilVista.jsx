import { UserIcon } from '../UserIcon'

export function UserPerfilVista({ perfil, vehiculos, onIr, onCerrarSesion }) {
  return (
    <section className="user-vista">
      <div className="user-perfil-cabecera">
        <div className="user-avatar user-avatar-grande">{perfil.inicial}</div>
        <p className="user-perfil-nombre">{perfil.nombre}</p>
        <p className="user-texto-mute">martin.fernandez@mail.com</p>
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
        <button className="user-menu-perfil-item" type="button" onClick={() => onIr('chat')}>
          <UserIcon name="bell" size={19} />
          Notificaciones
        </button>
        <button className="user-menu-perfil-item user-menu-perfil-salida" type="button" onClick={onCerrarSesion}>
          <UserIcon name="logout" size={19} />
          Cerrar sesion
        </button>
      </div>
    </section>
  )
}
