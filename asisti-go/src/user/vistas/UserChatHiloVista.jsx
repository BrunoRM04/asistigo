import { useEffect, useRef, useState } from 'react'
import { UserIcon } from '../UserIcon'

const TIPOS_ADMITIDOS = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
])

function TextoMensaje({ texto }) {
  const partes = String(texto || '').split(/(\*\*[^*]+\*\*)/g)
  return (
    <p className="user-chat-texto">
      {partes.map((parte, indice) =>
        parte.startsWith('**') && parte.endsWith('**')
          ? <strong key={`${parte}-${indice}`}>{parte.slice(2, -2)}</strong>
          : <span key={`${parte}-${indice}`}>{parte}</span>,
      )}
    </p>
  )
}

function esperarEvento(elemento, nombre) {
  return new Promise((resolve, reject) => {
    const temporizador = window.setTimeout(() => fallo(), 10000)
    const terminar = () => {
      window.clearTimeout(temporizador)
      elemento.removeEventListener(nombre, listo)
      elemento.removeEventListener('error', fallo)
    }
    const listo = () => {
      terminar()
      resolve()
    }
    const fallo = () => {
      terminar()
      reject(new Error('El navegador no pudo leer este video. Prueba con un archivo MP4.'))
    }
    elemento.addEventListener(nombre, listo, { once: true })
    elemento.addEventListener('error', fallo, { once: true })
  })
}

function esVideo(archivo) {
  return archivo?.type.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(archivo?.name || '')
}

async function extraerFotogramas(archivo) {
  const url = URL.createObjectURL(archivo)
  const video = document.createElement('video')
  video.preload = 'metadata'
  video.muted = true
  video.playsInline = true
  video.src = url

  try {
    await esperarEvento(video, 'loadedmetadata')
    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      throw new Error('No se pudo determinar la duración del video.')
    }

    const posiciones = [0.12, 0.5, 0.88]
    const fotogramas = []
    for (const posicion of posiciones) {
      const tiempo = Math.min(Math.max(video.duration * posicion, 0.01), Math.max(video.duration - 0.01, 0.01))
      if (Math.abs(video.currentTime - tiempo) > 0.002) {
        video.currentTime = tiempo
        await esperarEvento(video, 'seeked')
      }

      const escala = Math.min(1, 1100 / Math.max(video.videoWidth, video.videoHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(video.videoWidth * escala))
      canvas.height = Math.max(1, Math.round(video.videoHeight * escala))
      const contexto = canvas.getContext('2d')
      contexto.drawImage(video, 0, 0, canvas.width, canvas.height)
      fotogramas.push(canvas.toDataURL('image/jpeg', 0.82))
    }
    return fotogramas
  } finally {
    video.removeAttribute('src')
    video.load()
    URL.revokeObjectURL(url)
  }
}

function AdjuntoMensaje({ adjunto }) {
  if (adjunto.tipo === 'video') {
    return (
      <video className="user-chat-medio" controls preload="metadata">
        <source src={adjunto.url} type={adjunto.mime || 'video/mp4'} />
      </video>
    )
  }

  return <img className="user-chat-medio" src={adjunto.url} alt={adjunto.nombre || 'Imagen enviada al asistente'} loading="lazy" />
}

export function UserChatHiloVista({ chat, vehiculos = [], onVolver, onEnviar, onSeleccionarVehiculo }) {
  const [mensaje, setMensaje] = useState('')
  const [archivo, setArchivo] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [estadoProceso, setEstadoProceso] = useState('')
  const [error, setError] = useState('')
  const mensajesRef = useRef(null)
  const archivoRef = useRef(null)

  useEffect(() => {
    const contenedor = mensajesRef.current
    if (contenedor) {
      contenedor.scrollTo({ top: contenedor.scrollHeight, behavior: 'smooth' })
    }
  }, [chat.mensajes.length, enviando])

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const seleccionarArchivo = (evento) => {
    const siguiente = evento.target.files?.[0] || null
    evento.target.value = ''
    setError('')
    if (!siguiente) return
    const extensionAdmitida = /\.(jpe?g|png|webp|mp4|webm|mov)$/i.test(siguiente.name)
    if (!TIPOS_ADMITIDOS.has(siguiente.type) && !extensionAdmitida) {
      setError('Formato no admitido. Usa JPG, PNG, WEBP, MP4, WEBM o MOV.')
      return
    }
    const limite = esVideo(siguiente) ? 25 : 10
    if (siguiente.size > limite * 1024 * 1024) {
      setError(`El ${esVideo(siguiente) ? 'video' : 'archivo'} debe pesar menos de ${limite} MB.`)
      return
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setArchivo(siguiente)
    setPreviewUrl(URL.createObjectURL(siguiente))
  }

  const quitarArchivo = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setArchivo(null)
    setPreviewUrl('')
  }

  const enviar = async (evento) => {
    evento.preventDefault()
    const texto = mensaje.trim()
    if ((!texto && !archivo) || enviando) return

    const archivoEnviar = archivo
    setMensaje('')
    setError('')
    setEnviando(true)
    setEstadoProceso(esVideo(archivoEnviar) ? 'Preparando el video' : 'Asisti está analizando')

    try {
      const videoFrames = esVideo(archivoEnviar) ? await extraerFotogramas(archivoEnviar) : []
      setEstadoProceso(archivoEnviar ? 'Asisti está analizando el archivo' : 'Asisti está pensando')
      quitarArchivo()
      await onEnviar({ texto, archivo: archivoEnviar, videoFrames })
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
      setEstadoProceso('')
    }
  }

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
          <p className="user-linea-subtitulo">{chat.ia ? 'Disponible 24/7' : 'En línea'}</p>
        </div>
      </div>

      {chat.ia && (
        <label className="user-ia-vehiculo">
          <span>Consulta sobre</span>
          <select
            className="user-entrada"
            value={chat.vehiculo_id || ''}
            onChange={(evento) => onSeleccionarVehiculo(evento.target.value)}
            disabled={enviando}
          >
            <option value="">Sin vehículo seleccionado</option>
            {vehiculos.map((vehiculo) => (
              <option key={vehiculo.id} value={vehiculo.id}>
                {vehiculo.marca} {vehiculo.modelo}{vehiculo.anio ? ` (${vehiculo.anio})` : ''}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="user-conversacion-mensajes" ref={mensajesRef} aria-live="polite">
        {chat.mensajes.map((item, indice) => (
          <article
            key={item.id || `${item.time}-${indice}`}
            className={`user-conversacion-globo ${item.from === 'out' ? 'user-conversacion-globo-salida' : 'user-conversacion-globo-entrada'}`}
          >
            {item.attachments?.length > 0 && (
              <div className="user-chat-medios">
                {item.attachments.map((adjunto, adjuntoIndice) => (
                  <AdjuntoMensaje key={`${adjunto.url}-${adjuntoIndice}`} adjunto={adjunto} />
                ))}
              </div>
            )}
            <TextoMensaje texto={item.text} />
            <span className="user-chat-hora">{item.time}</span>
          </article>
        ))}

        {enviando && (
          <article className="user-conversacion-globo user-conversacion-globo-entrada user-chat-pensando" role="status">
            <div className="user-chat-pensando-linea">
              <UserIcon name="spark" size={16} />
              <span>{estadoProceso}</span>
              <i /><i /><i />
            </div>
          </article>
        )}
      </div>

      <div className="user-chat-compositor">
        {archivo && (
          <div className="user-chat-adjunto-seleccionado">
            {esVideo(archivo)
              ? <video src={previewUrl} muted preload="metadata" />
              : <img src={previewUrl} alt="Vista previa del archivo" />}
            <div>
              <strong>{archivo.name}</strong>
              <span>{esVideo(archivo) ? 'Video' : 'Imagen'} · {(archivo.size / 1024 / 1024).toFixed(1)} MB</span>
            </div>
            <button type="button" onClick={quitarArchivo} aria-label="Quitar archivo">
              <UserIcon name="close" size={16} />
            </button>
          </div>
        )}

        <form className="user-conversacion-envio" onSubmit={enviar}>
          {chat.ia && (
            <>
              <input
                ref={archivoRef}
                className="user-chat-archivo-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                onChange={seleccionarArchivo}
                tabIndex={-1}
              />
              <button
                className="user-boton-icono user-chat-adjuntar"
                type="button"
                onClick={() => archivoRef.current?.click()}
                aria-label="Adjuntar foto o video"
                disabled={enviando}
              >
                <UserIcon name="attachment" size={19} />
              </button>
            </>
          )}
          <input
            className="user-entrada"
            name="user-mensaje"
            value={mensaje}
            onChange={(evento) => setMensaje(evento.target.value)}
            placeholder={chat.ia ? 'Describe el síntoma o adjunta una foto o video' : 'Escribe un mensaje'}
            maxLength={3000}
            disabled={enviando}
          />
          <button
            className="user-boton-icono user-boton-icono-principal"
            type="submit"
            aria-label="Enviar mensaje"
            disabled={enviando || (!mensaje.trim() && !archivo)}
          >
            <UserIcon name="send" size={19} />
          </button>
        </form>
        {error && <p className="user-registro-error user-chat-error" role="alert">{error}</p>}
      </div>
    </section>
  )
}
