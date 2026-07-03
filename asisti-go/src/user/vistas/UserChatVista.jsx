import { UserIcon } from '../UserIcon'

export function UserChatVista({ chats, onAbrirChat }) {
  return (
    <section className="user-vista">
      <div className="user-titulo-bloque">
        <h1 className="user-titulo-pagina">Chat</h1>
        <p className="user-subtitulo-pagina">Habla con talleres o consulta al asistente IA.</p>
      </div>

      <div className="user-lista-chat">
        {chats.map((chat) => (
          <button key={chat.id} className="user-conversacion-item" type="button" onClick={() => onAbrirChat(chat.id)}>
            <div className={`user-conversacion-avatar ${chat.ia ? 'user-conversacion-avatar-ia' : ''}`}>
              <UserIcon name={chat.ia ? 'spark' : 'wrench'} size={20} />
            </div>
            <div className="user-conversacion-texto">
              <div className="user-fila-resumen">
                <p className="user-linea-titulo">{chat.nombre}</p>
                <span className="user-texto-mute">{chat.hora}</span>
              </div>
              <p className="user-texto-mute user-conversacion-ultimo">{chat.ultimo}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
