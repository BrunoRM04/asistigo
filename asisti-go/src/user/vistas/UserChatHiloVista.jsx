import { UserIcon } from '../UserIcon'

export function UserChatHiloVista({ chat, onVolver, onEnviar }) {
  return (
    <section className="user-vista user-vista-conversacion-hilo">
      <div className="user-fila-resumen user-conversacion-encabezado">
        <button className="user-boton-icono" type="button" onClick={onVolver} aria-label="Volver">
          <UserIcon name="back" size={19} />
        </button>
        <div className={`user-conversacion-avatar ${chat.ia ? 'user-conversacion-avatar-ia' : ''}`}>
          <UserIcon name={chat.ia ? 'spark' : 'wrench'} size={19} />
        </div>
        <div>
          <p className="user-linea-titulo">{chat.nombre}</p>
          <p className="user-linea-subtitulo">{chat.ia ? 'Disponible 24/7' : 'En linea'}</p>
        </div>
      </div>

      <div className="user-conversacion-mensajes">
        {chat.mensajes.map((mensaje, indice) => (
          <article
            key={`${mensaje.time}-${indice}`}
            className={`user-conversacion-globo ${mensaje.from === 'out' ? 'user-conversacion-globo-salida' : 'user-conversacion-globo-entrada'}`}
          >
            <p>{mensaje.text}</p>
            <span>{mensaje.time}</span>
          </article>
        ))}
      </div>

      <form
        className="user-conversacion-envio"
        onSubmit={(evento) => {
          evento.preventDefault()
          const datos = new FormData(evento.currentTarget)
          onEnviar(String(datos.get('user-mensaje') || ''))
          evento.currentTarget.reset()
        }}
      >
        <input className="user-entrada" name="user-mensaje" placeholder="Escribi un mensaje" />
        <button className="user-boton-icono user-boton-icono-principal" type="submit" aria-label="Enviar mensaje">
          <UserIcon name="send" size={19} />
        </button>
      </form>
    </section>
  )
}
