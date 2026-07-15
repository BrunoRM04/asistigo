import { useState } from 'react'
import { AsistiGoLogo } from '../../components/AsistiGoLogo'
import { useUbicacion } from '../../hooks/useUbicacion'

const paisesCliente = [
  'Uruguay',
  'Argentina',
  'Brasil',
  'Chile',
  'Paraguay',
  'Bolivia',
  'Peru',
  'Colombia',
  'Ecuador',
  'Venezuela',
  'Mexico',
  'Estados Unidos',
  'Espana',
  'Otro',
]

export function UserLoginVista({ onIngresar, onElegirMecanico }) {
  const [modoRegistro, setModoRegistro] = useState(false)
  const [registroError, setRegistroError] = useState('')
  const [loginError, setLoginError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [direccion, setDireccion] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [paisSeleccionado, setPaisSeleccionado] = useState('Uruguay')
  const { coords: ubicacion, mensaje: ubicacionMensaje, cargando: buscandoUbicacion, usarUbicacionActual, buscarDireccion } = useUbicacion()

  const usarMiUbicacion = async () => {
    const data = await usarUbicacionActual()
    if (data) {
      setDireccion(data.direccion || data.display_name || '')
      setCiudad(data.ciudad || ciudad)
    }
  }

  const verificarDireccion = async () => {
    const data = await buscarDireccion(direccion, ciudad, paisSeleccionado)
    if (data) {
      setDireccion(data.direccion || data.display_name || direccion)
      setCiudad(data.ciudad || ciudad)
    }
  }

  const crearCuenta = async (evento) => {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    const contrasena = datos.get('contrasena')
    const confirmarContrasena = datos.get('confirmarContrasena')

    if (contrasena !== confirmarContrasena) {
      setRegistroError('Las contrasenas no coinciden.')
      return
    }

    setRegistroError('')
    setCargando(true)

    try {
      await onIngresar('registro', {
        nombre: datos.get('nombre'),
        apellido: datos.get('apellido'),
        email: datos.get('correo'),
        telefono: datos.get('telefono'),
        pais: datos.get('pais'),
        ciudad: datos.get('ciudad'),
        direccion: datos.get('direccion'),
        latitud: ubicacion.latitud,
        longitud: ubicacion.longitud,
        password: contrasena,
      })
    } catch (error) {
      setRegistroError(error.message)
    } finally {
      setCargando(false)
    }
  }

  const ingresar = async (evento) => {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    setLoginError('')
    setCargando(true)

    try {
      await onIngresar('login', {
        email: datos.get('email'),
        password: datos.get('password'),
      })
    } catch (error) {
      setLoginError(error.message)
    } finally {
      setCargando(false)
    }
  }

  if (modoRegistro) {
    return (
      <section className="user-acceso-vista user-registro-persona">
        <div className="user-acceso-capa" />
        <div className="user-acceso-caja user-acceso-caja-registro">
          <div className="user-registro-cabecera">
            <AsistiGoLogo className="user-marca" />
            <button className="user-acceso-link user-registro-volver" type="button" onClick={() => setModoRegistro(false)}>
              Volver al login
            </button>
          </div>

          <div className="user-registro-titulo">
            <p className="user-eyebrow">Registro de cliente</p>
            <h1 className="user-acceso-titulo">Crear cuenta personal</h1>
            <p className="user-acceso-subtitulo">
              Completa tus datos para gestionar vehiculos, turnos, historial y solicitudes desde AsistiGo.
            </p>
          </div>

          <form className="user-registro-formulario" onSubmit={crearCuenta}>
            <section className="user-registro-bloque">
              <div className="user-registro-bloque-titulo">
                <p className="user-eyebrow">Datos personales</p>
                <h2>Informacion basica</h2>
              </div>

              <div className="user-registro-grid">
                <label className="user-registro-campo">
                  <span>Nombre *</span>
                  <input className="user-entrada" name="nombre" type="text" placeholder="Martin" autoComplete="given-name" required />
                </label>

                <label className="user-registro-campo">
                  <span>Apellido *</span>
                  <input className="user-entrada" name="apellido" type="text" placeholder="Fernandez" autoComplete="family-name" required />
                </label>

                <label className="user-registro-campo">
                  <span>Correo electronico *</span>
                  <input className="user-entrada" name="correo" type="email" placeholder="tu@email.com" autoComplete="email" required />
                </label>

                <label className="user-registro-campo">
                  <span>Telefono *</span>
                  <input className="user-entrada" name="telefono" type="tel" placeholder="+598 99 123 456" autoComplete="tel" required />
                </label>

                <label className="user-registro-campo">
                  <span>Pais *</span>
                  <select
                    className="user-entrada"
                    name="pais"
                    autoComplete="country-name"
                    value={paisSeleccionado}
                    onChange={(evento) => setPaisSeleccionado(evento.target.value)}
                    required
                  >
                    {paisesCliente.map((pais) => (
                      <option value={pais} key={pais}>
                        {pais}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="user-registro-campo">
                  <span>Ciudad *</span>
                  <input
                    className="user-entrada"
                    name="ciudad"
                    type="text"
                    placeholder="Montevideo"
                    autoComplete="address-level2"
                    value={ciudad}
                    onChange={(evento) => setCiudad(evento.target.value)}
                    required
                  />
                </label>

                <label className="user-registro-campo user-registro-campo-ancho">
                  <span>Direccion aproximada</span>
                  <input
                    className="user-entrada"
                    name="direccion"
                    type="text"
                    placeholder="Calle y zona"
                    autoComplete="street-address"
                    value={direccion}
                    onChange={(evento) => setDireccion(evento.target.value)}
                  />
                </label>

                <div className="mecanico-registro-ubicacion user-registro-campo-ancho">
                  <button className="user-boton user-boton-secundario" type="button" onClick={usarMiUbicacion} disabled={buscandoUbicacion}>
                    Usar mi ubicacion
                  </button>
                  <button className="user-boton user-boton-secundario" type="button" onClick={verificarDireccion} disabled={buscandoUbicacion}>
                    Buscar direccion
                  </button>
                  {ubicacionMensaje && <p>{ubicacionMensaje}</p>}
                </div>
              </div>
            </section>

            <section className="user-registro-bloque">
              <div className="user-registro-bloque-titulo">
                <p className="user-eyebrow">Acceso</p>
                <h2>Seguridad de la cuenta</h2>
              </div>

              <div className="user-registro-grid">
                <label className="user-registro-campo">
                  <span>Contrasena *</span>
                  <input className="user-entrada" name="contrasena" type="password" placeholder="Minimo 8 caracteres" autoComplete="new-password" minLength={8} required />
                </label>

                <label className="user-registro-campo">
                  <span>Confirmar contrasena *</span>
                  <input className="user-entrada" name="confirmarContrasena" type="password" placeholder="Repeti la contrasena" autoComplete="new-password" minLength={8} required />
                </label>

                <label className="user-registro-terminos">
                  <input type="checkbox" name="terminos" required />
                  <span>Acepto los terminos y condiciones</span>
                </label>
              </div>

              {registroError && <p className="user-registro-error">{registroError}</p>}
            </section>

            <div className="user-registro-pie">
              <button className="user-boton user-boton-principal user-boton-bloque" type="submit" disabled={cargando}>
                {cargando ? 'Creando...' : 'Crear cuenta'}
              </button>
            </div>
          </form>
        </div>
      </section>
    )
  }

  return (
    <section className="user-acceso-vista">
      <div className="user-acceso-capa" />
      <div className="user-acceso-caja">
        <AsistiGoLogo className="user-marca" />
        <h1 className="user-acceso-titulo">Tu vehiculo, siempre acompanado.</h1>
        <p className="user-acceso-subtitulo">
          Ingresa para ver historial, turnos y alertas de tus vehiculos.
        </p>

        <form
          className="user-formulario"
          onSubmit={ingresar}
        >
          <label className="user-etiqueta" htmlFor="user-correo">
            Correo electronico
          </label>
          <input
            className="user-entrada"
            id="user-correo"
            name="email"
            type="email"
            placeholder="tu@email.com"
            required
          />

          <label className="user-etiqueta" htmlFor="user-clave">
            Contrasena
          </label>
          <input
            className="user-entrada"
            id="user-clave"
            name="password"
            type="password"
            placeholder="********"
            required
          />

          {loginError && <p className="user-registro-error">{loginError}</p>}

          <button className="user-boton user-boton-principal user-boton-bloque" type="submit" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {onElegirMecanico && (
          <button className="user-acceso-link" type="button" onClick={onElegirMecanico}>
            Entrar al panel de talleres
          </button>
        )}

        <button className="user-acceso-link" type="button" onClick={() => setModoRegistro(true)}>
          Crear cuenta de cliente
        </button>

        <p className="user-acceso-pie">AsistiGo - Area de usuario</p>
      </div>
    </section>
  )
}
