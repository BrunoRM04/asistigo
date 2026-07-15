import { useState } from 'react'
import { asistigoApi } from '../api/asistigoApi'

function obtenerPosicion(opciones) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, opciones)
  })
}

async function obtenerPosicionConReintento() {
  try {
    return await obtenerPosicion({ enableHighAccuracy: true, timeout: 8000, maximumAge: 0 })
  } catch (error) {
    if (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) {
      return await obtenerPosicion({ enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 })
    }
    throw error
  }
}

function mensajeErrorGeolocalizacion(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Bloqueaste el permiso de ubicación del navegador. Habilitalo en la configuración del sitio, o escribí la dirección y tocá "Buscar dirección".'
    case error.POSITION_UNAVAILABLE:
      return 'No pudimos determinar tu ubicación (revisá que la ubicación de Windows/el navegador esté activada). Escribí la dirección y tocá "Buscar dirección".'
    case error.TIMEOUT:
      return 'La búsqueda de ubicación tardó demasiado. Escribí la dirección y tocá "Buscar dirección".'
    default:
      return 'No pudimos obtener la ubicación. Escribí la dirección y tocá "Buscar dirección".'
  }
}

export function useUbicacion() {
  const [coords, setCoords] = useState({ latitud: '', longitud: '' })
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  const usarUbicacionActual = async () => {
    if (!navigator.geolocation) {
      setMensaje('Tu navegador no permite obtener ubicación automática. Escribí la dirección y tocá "Buscar dirección".')
      return null
    }

    setCargando(true)
    setMensaje('Buscando tu ubicación...')

    let posicion
    try {
      posicion = await obtenerPosicionConReintento()
    } catch (error) {
      setCargando(false)
      setMensaje(mensajeErrorGeolocalizacion(error))
      return null
    }

    const { latitude, longitude } = posicion.coords
    try {
      const respuesta = await asistigoApi.resolverUbicacion({ latitud: latitude, longitud: longitude })
      const data = respuesta.data
      setCoords({ latitud: String(data.latitud ?? latitude), longitud: String(data.longitud ?? longitude) })
      setMensaje('Dirección detectada por GPS. Podés ajustarla si hace falta.')
      setCargando(false)
      return data
    } catch (error) {
      setCoords({ latitud: String(latitude), longitud: String(longitude) })
      setMensaje(`Se obtuvo tu posición, pero no pudimos traducirla a una dirección (${error.message}). Podés escribirla manualmente.`)
      setCargando(false)
      return null
    }
  }

  const buscarDireccion = async (direccion, ciudad = '', pais = '') => {
    if (!direccion || !direccion.trim()) {
      setMensaje('Escribí una dirección para poder buscarla.')
      return null
    }

    setCargando(true)
    setMensaje('Buscando dirección...')

    try {
      const respuesta = await asistigoApi.buscarDireccion({ direccion, ciudad, pais })
      const data = respuesta.data
      setCoords({ latitud: String(data.latitud), longitud: String(data.longitud) })
      setMensaje('Dirección encontrada y verificada.')
      setCargando(false)
      return data
    } catch (error) {
      setCargando(false)
      setMensaje(error.message)
      return null
    }
  }

  return { coords, setCoords, mensaje, setMensaje, cargando, usarUbicacionActual, buscarDireccion }
}
