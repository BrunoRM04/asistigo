import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { LocalNotifications } from '@capacitor/local-notifications'
import { asistigoApi } from '../api/asistigoApi'

let tokenActual = ''
let listenersPreparados = false
let sesionActual = null
let manejarRutaActual = null

const normalizarRuta = (data = {}) => data.ruta || data.url_accion || data.tipo || ''

export const obtenerPushTokenActual = () => tokenActual

export async function iniciarPushNotifications(sesion, manejarRuta) {
  if (!Capacitor.isNativePlatform() || !sesion?.usuario?.id) return

  sesionActual = sesion
  manejarRutaActual = manejarRuta

  if (!listenersPreparados) {
    listenersPreparados = true

    await PushNotifications.addListener('registration', async ({ value }) => {
      tokenActual = value
      if (!sesionActual?.usuario?.id) return

      await asistigoApi.registrarPushToken({
        titular_tipo: sesionActual.tipo,
        titular_id: sesionActual.usuario.id,
        token: value,
        plataforma: 'android',
      })
    })

    await PushNotifications.addListener('registrationError', (error) => {
      console.error('No se pudo registrar el dispositivo para push', error)
    })

    await PushNotifications.addListener('pushNotificationActionPerformed', ({ notification }) => {
      manejarRutaActual?.(normalizarRuta(notification?.data))
    })

    await PushNotifications.addListener('pushNotificationReceived', async (notification) => {
      await LocalNotifications.schedule({
        notifications: [{
          id: Date.now() % 2147483647,
          title: notification.title || 'AsistiGo',
          body: notification.body || 'Tienes una nueva notificacion.',
          channelId: 'asistigo_general',
          extra: notification.data || {},
          schedule: { at: new Date(Date.now() + 150) },
        }],
      })
    })

    await LocalNotifications.addListener('localNotificationActionPerformed', ({ notification }) => {
      manejarRutaActual?.(normalizarRuta(notification?.extra))
    })
  }

  await PushNotifications.createChannel({
    id: 'asistigo_general',
    name: 'Notificaciones de AsistiGo',
    description: 'Mensajes, presupuestos, turnos y cambios de estado.',
    importance: 5,
    visibility: 1,
    sound: 'default',
    vibration: true,
  })

  let permisos = await PushNotifications.checkPermissions()
  if (permisos.receive === 'prompt') {
    permisos = await PushNotifications.requestPermissions()
  }

  if (permisos.receive === 'granted') {
    await PushNotifications.register()
  }
}

export async function desactivarPushNotifications(sesion) {
  if (!Capacitor.isNativePlatform() || !tokenActual || !sesion?.usuario?.id) return

  await asistigoApi.desactivarPushToken({
    titular_tipo: sesion.tipo,
    titular_id: sesion.usuario.id,
    token: tokenActual,
  })
  tokenActual = ''
  sesionActual = null
}
