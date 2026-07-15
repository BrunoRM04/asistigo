import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import markerIcon2xUrl from 'leaflet/dist/images/marker-icon-2x.png'
import markerIconUrl from 'leaflet/dist/images/marker-icon.png'
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'
import { UserIcon } from '../UserIcon'

const iconoBase = L.icon({
  iconRetinaUrl: markerIcon2xUrl,
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const iconoCliente = L.divIcon({
  className: 'user-mapa-pin user-mapa-pin-cliente',
  html: '<span></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

const iconoTaller = L.divIcon({
  className: 'user-mapa-pin user-mapa-pin-taller',
  html: '<span></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

if (L.Marker?.prototype?.options) {
  L.Marker.prototype.options.icon = iconoBase
}

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function distanciaKm(a, b) {
  const rad = (grados) => (grados * Math.PI) / 180
  const radio = 6371
  const dLat = rad(b[0] - a[0])
  const dLng = rad(b[1] - a[1])
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2
  return radio * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export function MapaUbicacionesTaller({ taller, ubicacionCliente, onCerrar }) {
  const [rutaCalles, setRutaCalles] = useState([])
  const [rutaCargando, setRutaCargando] = useState(false)
  const [distanciaRutaKm, setDistanciaRutaKm] = useState(null)

  const puntoCliente = useMemo(() => {
    const lat = toNumber(ubicacionCliente?.latitud)
    const lng = toNumber(ubicacionCliente?.longitud)
    return lat != null && lng != null ? [lat, lng] : null
  }, [ubicacionCliente])

  const puntoTaller = useMemo(() => {
    const lat = toNumber(taller?.latitud)
    const lng = toNumber(taller?.longitud)
    return lat != null && lng != null ? [lat, lng] : null
  }, [taller])

  const centro = useMemo(() => {
    if (puntoCliente && puntoTaller) {
      return [
        (puntoCliente[0] + puntoTaller[0]) / 2,
        (puntoCliente[1] + puntoTaller[1]) / 2,
      ]
    }
    return puntoCliente || puntoTaller || [-34.9011, -56.1645]
  }, [puntoCliente, puntoTaller])

  useEffect(() => {
    const controller = new AbortController()

    async function cargarRutaPorCalles() {
      if (!puntoCliente || !puntoTaller) {
        setRutaCalles([])
        setDistanciaRutaKm(null)
        return
      }

      setRutaCargando(true)
      try {
        const origen = `${puntoCliente[1]},${puntoCliente[0]}`
        const destino = `${puntoTaller[1]},${puntoTaller[0]}`
        const url = `https://router.project-osrm.org/route/v1/driving/${origen};${destino}?overview=full&geometries=geojson`
        const respuesta = await fetch(url, { signal: controller.signal })
        if (!respuesta.ok) throw new Error('No se pudo obtener ruta por calles')

        const data = await respuesta.json()
        const ruta = data?.routes?.[0]
        const coordenadas = ruta?.geometry?.coordinates || []
        if (!Array.isArray(coordenadas) || coordenadas.length < 2) {
          throw new Error('Ruta invalida')
        }

        setRutaCalles(coordenadas.map(([lng, lat]) => [lat, lng]))
        setDistanciaRutaKm(Number(ruta.distance) / 1000)
      } catch {
        setRutaCalles([puntoCliente, puntoTaller])
        setDistanciaRutaKm(distanciaKm(puntoCliente, puntoTaller))
      } finally {
        setRutaCargando(false)
      }
    }

    cargarRutaPorCalles()

    return () => controller.abort()
  }, [puntoCliente, puntoTaller])

  const distancia = distanciaRutaKm ?? (puntoCliente && puntoTaller ? distanciaKm(puntoCliente, puntoTaller) : null)
  const mapsDestino = encodeURIComponent(`${taller?.direccion || ''} ${taller?.ciudad || ''}`.trim())

  const abrirEnMaps = () => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsDestino}`
    window.open(mapsUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="user-modal-fondo user-modal-fondo-mapa">
      <div className="user-modal user-modal-mapa" role="dialog" aria-modal="true" aria-labelledby="user-mapa-taller-titulo">
        <div className="user-modal-cabecera">
          <div>
            <p className="user-eyebrow">Ruta cliente - mecanico</p>
            <h2 className="user-titulo-seccion" id="user-mapa-taller-titulo">{taller?.nombre || 'Ubicacion del taller'}</h2>
          </div>
          <button className="user-boton-icono" type="button" onClick={onCerrar} aria-label="Cerrar mapa">
            <UserIcon name="close" size={18} />
          </button>
        </div>

        <div className="user-mapa-resumen">
          <span className="user-mapa-pill user-mapa-pill-cliente">Tu ubicacion</span>
          <span className="user-mapa-pill user-mapa-pill-taller">Taller</span>
          {distancia != null && <span className="user-mapa-pill">{distancia.toFixed(1)} km aprox.</span>}
          {rutaCargando && <span className="user-mapa-pill">Calculando ruta real...</span>}
        </div>

        <div className="user-mapa-contenedor">
          {puntoCliente && puntoTaller ? (
            <MapContainer center={centro} zoom={12} scrollWheelZoom className="user-mapa-canvas">
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={puntoCliente} icon={iconoCliente}>
                <Popup>Tu ubicacion guardada</Popup>
              </Marker>
              <Marker position={puntoTaller} icon={iconoTaller}>
                <Popup>{taller?.nombre || 'Taller seleccionado'}</Popup>
              </Marker>
              <Polyline
                positions={rutaCalles.length > 1 ? rutaCalles : [puntoCliente, puntoTaller]}
                pathOptions={{ color: '#fb923c', weight: 5, opacity: 0.85 }}
              />
            </MapContainer>
          ) : (
            <div className="user-empty user-mapa-vacio">
              <UserIcon name="alert" size={30} />
              <p>No hay coordenadas completas para mostrar la ruta en mapa.</p>
              <p className="user-linea-subtitulo">Configura tu direccion y valida que el taller tenga direccion oficial.</p>
            </div>
          )}
        </div>

        <div className="user-modal-pie">
          <button className="user-boton user-boton-secundario" type="button" onClick={onCerrar}>
            Cerrar
          </button>
          <button
            className="user-boton user-boton-principal"
            type="button"
            onClick={abrirEnMaps}
          >
            Ver en Maps
          </button>
        </div>
      </div>
    </div>
  )
}
