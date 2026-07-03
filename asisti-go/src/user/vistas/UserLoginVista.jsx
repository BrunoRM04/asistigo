export function UserLoginVista({ onIngresar, onElegirMecanico }) {
  return (
    <section className="user-acceso-vista">
      <div className="user-acceso-capa" />
      <div className="user-acceso-caja">
        <div className="user-marca">
          <span className="user-marca-punto" />
          <span>ASISTIGO</span>
        </div>
        <h1 className="user-acceso-titulo">Tu vehiculo, siempre acompanado.</h1>
        <p className="user-acceso-subtitulo">
          Ingresa para ver historial, turnos y alertas de tus vehiculos.
        </p>

        <form
          className="user-formulario"
          onSubmit={(evento) => {
            evento.preventDefault()
            onIngresar()
          }}
        >
          <label className="user-etiqueta" htmlFor="user-correo">
            Correo electronico
          </label>
          <input
            className="user-entrada"
            id="user-correo"
            type="email"
            placeholder="tu@email.com"
            defaultValue="martin.fernandez@mail.com"
            required
          />

          <label className="user-etiqueta" htmlFor="user-clave">
            Contrasena
          </label>
          <input
            className="user-entrada"
            id="user-clave"
            type="password"
            placeholder="********"
            defaultValue="asistigo123"
            required
          />

          <button className="user-boton user-boton-principal user-boton-bloque" type="submit">
            Ingresar
          </button>
        </form>

        {onElegirMecanico && (
          <button className="user-acceso-link" type="button" onClick={onElegirMecanico}>
            Entrar al panel de talleres
          </button>
        )}

        <p className="user-acceso-pie">Asistigo - Area de usuario</p>
      </div>
    </section>
  )
}
