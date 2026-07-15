# AsistiGo

## Documento técnico integral y estado actual

**Última actualización:** 14 de julio de 2026  
**Estado:** MVP funcional en desarrollo y validación local  
**Aplicación Android:** funcional mediante Capacitor  
**Backend actual:** PHP + MariaDB/MySQL sobre XAMPP  
**Identificador Android:** `com.asistigo.app`

---

## 1. Qué es AsistiGo

AsistiGo es una plataforma de gestión del ciclo de vida de vehículos que conecta propietarios, talleres mecánicos e inteligencia artificial.

El centro del producto es el vehículo. Clientes, talleres y mecánicos interactúan alrededor de su información, mantenimiento, historial, diagnósticos, presupuestos, turnos y conversaciones.

La visión de producto es que el historial permanezca y se enriquezca durante toda la vida útil del vehículo. La IA ayuda a interpretar información y organizar próximos pasos, pero no sustituye una revisión mecánica profesional.

### Problemas que busca resolver

- Historiales de mantenimiento incompletos o dispersos.
- Servicios y controles preventivos olvidados.
- Dificultad para localizar talleres adecuados y cercanos.
- Comunicación informal y desordenada entre cliente y taller.
- Falta de trazabilidad de turnos y presupuestos.
- Dificultad para interpretar síntomas, testigos, fotos o videos.
- Escasa fidelización y digitalización de talleres pequeños y medianos.

### Perfiles principales

1. **Cliente:** administra vehículos, busca talleres, solicita servicios, conversa, acepta presupuestos y controla su historial.
2. **Mecánico/taller:** recibe solicitudes, gestiona agenda, clientes, presupuestos, servicios, diagnósticos y conversaciones.
3. **Asistente IA:** orienta al cliente utilizando el vehículo seleccionado, su historial y la conversación previa.

---

## 2. Estado funcional actual

AsistiGo no es solamente una interfaz demostrativa. Los flujos principales ya trabajan contra PHP y MySQL reales en el entorno local.

### Funciones disponibles para clientes

- Registro e inicio de sesión.
- Registro de ubicación legible y coordenadas.
- Alta, edición y baja lógica de vehículos.
- Visualización de estado, kilometraje y próximo mantenimiento.
- Consulta del historial de servicios.
- Búsqueda de talleres cercanos.
- Mapa interactivo con Leaflet y OpenStreetMap.
- Filtros de talleres por texto, cercanía, calificación y disponibilidad.
- Solicitud de presupuesto, diagnóstico o urgencia.
- Solicitud y cancelación de turnos.
- Consulta, aceptación y rechazo de presupuestos.
- Chat persistente con talleres.
- Chat persistente con el asistente IA.
- Envío de fotos y videos al asistente IA.
- Consulta de notificaciones internas.
- Recepción de notificaciones push Android.
- Calificación de turnos completados.
- Edición del perfil, ubicación y preferencias.

### Funciones disponibles para talleres

- Registro e inicio de sesión.
- Perfil comercial, dirección, cobertura y horarios.
- Catálogo de servicios ofrecidos.
- Recepción y descarte de solicitudes.
- Confirmación, creación y finalización de turnos.
- Agenda por día.
- Listado de clientes y vehículos relacionados.
- Envío de presupuestos con múltiples conceptos.
- Registro de servicios realizados.
- Registro de diagnósticos.
- Chat persistente con clientes.
- Bandeja interna de notificaciones.
- Recepción de push por solicitudes, mensajes, presupuestos y reseñas.
- Estadísticas básicas del taller.

### Funciones automáticas

- Recordatorio de mantenimiento por fecha o kilometraje.
- Recordatorio de turno dentro de las próximas 24 horas.
- Aviso de presupuesto próximo a vencer.
- Inactivación de tokens rechazados por Firebase.
- Desactivación del dispositivo al cerrar sesión.
- Prevención de duplicados en notificaciones programadas.

---

## 3. Arquitectura implementada

```text
Aplicación React
    |
    +-- Navegador web durante desarrollo
    |
    +-- Capacitor Android
            |
            +-- APK nativa
            +-- Push Notifications
            +-- Local Notifications
    |
    v
API PHP en Apache/XAMPP
    |
    +-- Autenticación y perfiles
    +-- Vehículos y talleres
    +-- Solicitudes, turnos y presupuestos
    +-- Chat cliente/taller
    +-- Asistente IA
    +-- Notificaciones internas y push
    +-- Geocodificación
    |
    v
MariaDB/MySQL
    |
    +-- Datos del negocio
    +-- Historiales y conversaciones
    +-- Tokens de dispositivos
    +-- Control de recordatorios enviados

Servicios externos:
    - Firebase Cloud Messaging
    - OpenAI Responses API
    - OpenStreetMap/Nominatim
```

### Tecnologías principales

| Capa | Tecnología |
|---|---|
| Interfaz | React 19 |
| Empaquetado web | Vite 8 |
| Contenedor móvil | Capacitor 8 |
| Android | Proyecto Gradle nativo generado por Capacitor |
| Mapas | Leaflet + React Leaflet |
| Backend | PHP con PDO y cURL |
| Servidor local | Apache mediante XAMPP |
| Base de datos | MariaDB/MySQL |
| Push | Firebase Cloud Messaging HTTP v1 |
| IA | OpenAI Responses API |
| Geocodificación | OpenStreetMap Nominatim |
| Lint frontend | Oxlint |

---

## 4. Estructura del repositorio

```text
asistigo/
├── asisti-go/                 Aplicación React y proyecto Android
│   ├── src/
│   │   ├── api/               Cliente HTTP
│   │   ├── components/        Componentes compartidos
│   │   ├── hooks/             Ubicación y lógica reutilizable
│   │   ├── mecanico/          Panel completo del taller
│   │   ├── services/          Notificaciones push del dispositivo
│   │   └── user/              Vistas y componentes del cliente
│   ├── public/                Recursos públicos
│   ├── android/               Proyecto Android generado
│   ├── capacitor.config.json  Configuración de Capacitor
│   ├── package.json           Dependencias y scripts
│   └── vite.config.js         Configuración de Vite
├── backend/
│   ├── api/                   Endpoints PHP públicos
│   ├── config/                Base de datos, HTTP, Firebase, IA y helpers
│   ├── scripts/               Procesos de consola y recordatorios
│   └── uploads/               Adjuntos del asistente IA
├── database/
│   ├── base_actual.sql        Esquema completo
│   └── migrations/            Cambios incrementales recientes
├── md/                        Documentación funcional y técnica
├── push/                      Archivo público de configuración Android
└── web/                       Prototipo/landing anterior y referencias
```

### Archivos frontend principales

- `asisti-go/src/App.jsx`: orquestación de sesión, área cliente/taller y navegación cliente.
- `asisti-go/src/api/asistigoApi.js`: cliente central para consumir la API PHP.
- `asisti-go/src/services/pushNotifications.js`: permisos, registro FCM, avisos en primer plano y navegación desde push.
- `asisti-go/src/mecanico/MecanicoPanel.jsx`: acceso, registro y panel operativo del taller.
- `asisti-go/src/user/vistas/`: pantallas específicas del cliente.
- `asisti-go/src/App.css`: sistema visual y comportamiento responsive compartido.

### Archivos backend principales

- `backend/config/database.php`: conexión PDO.
- `backend/config/http.php`: JSON, CORS y lectura de cuerpos HTTP.
- `backend/config/firebase.php`: OAuth 2.0 y envío FCM HTTP v1.
- `backend/config/notificaciones_service.php`: creación y distribución de notificaciones.
- `backend/config/openai.php`: llamada a OpenAI Responses API.
- `backend/config/chat_media.php`: validación y almacenamiento de imágenes/videos.
- `backend/api/app-data.php`: agregador principal de datos del cliente.
- `backend/api/mecanico.php`: agregador y acciones del panel del taller.
- `backend/scripts/procesar-notificaciones.php`: recordatorios automáticos.

---

## 5. Diseño y experiencia de usuario

La interfaz utiliza únicamente la paleta definida por la marca:

```text
#020617  Fondo oscuro
#fb923c  Naranja de marca y acciones principales
#ffffff  Texto y superficies claras
```

### Principios visuales actuales

- Diseño mobile-first con adaptación a escritorio.
- Menú lateral en escritorio y navegación inferior en móvil.
- Tarjetas, modales y formularios con jerarquía clara.
- Accesos de cliente y taller con el mismo lenguaje visual.
- Iconografía SVG local, sin depender de una librería externa.
- Logo oficial: círculo punteado con centro sólido y wordmark `AsistiGo`.
- Estados de carga y errores visibles para operaciones contra el backend.
- Mapas y formularios preparados para pantallas táctiles.

---

## 6. Aplicación cliente

### Inicio y sesión

La sesión se obtiene mediante `auth.php` y actualmente se conserva en `localStorage` bajo `asistigo_sesion`.

Después del acceso, `App.jsx` solicita a `app-data.php` toda la información necesaria para construir las vistas del cliente.

### Vehículos

Cada cliente puede administrar varios vehículos. Se registran, entre otros datos:

- Tipo.
- Marca y modelo.
- Año.
- Patente.
- Kilometraje actual.
- Combustible.
- Versión y motor.
- Color.
- Próximo servicio y kilometraje objetivo.

Al crear un vehículo también se crea un primer recordatorio preventivo.

### Talleres y geolocalización

La ubicación puede obtenerse desde el navegador/dispositivo. El backend convierte las coordenadas en una dirección legible mediante Nominatim y conserva latitud/longitud para calcular distancias.

`app-data.php` calcula la distancia Haversine entre el cliente y cada taller. Los talleres fuera del radio efectivo de cobertura no se muestran.

El mapa usa OpenStreetMap mediante Leaflet.

### Solicitudes

El cliente puede enviar:

- Presupuesto.
- Diagnóstico.
- Urgencia.
- Reserva de turno.

Una solicitud crea o reutiliza una conversación con el taller para mantener el contexto operativo y de chat conectado.

### Turnos

Estados principales:

```text
pendiente → confirmado → completado
                     └→ cancelado
```

Los turnos completados pasan al historial y pueden ser calificados.

### Presupuestos

El taller crea un presupuesto con conceptos, subtotales, total y fecha de validez. El cliente puede aceptarlo o rechazarlo, y el taller recibe la notificación correspondiente.

### Chat

Cliente y taller comparten las tablas `conversaciones` y `mensajes`. No son chats separados o simulados: los dos perfiles leen y escriben en la misma conversación persistente.

### Perfil y preferencias

El cliente puede actualizar:

- Datos personales.
- Teléfono, ciudad y país.
- Dirección principal.
- Coordenadas.
- Notificaciones por correo.
- Notificaciones push.
- Recordatorios de mantenimiento.
- Idioma y moneda.

---

## 7. Panel del taller

El panel se encuentra concentrado en `MecanicoPanel.jsx` y consume `mecanico.php`.

### Secciones principales

- Inicio y resumen operativo.
- Solicitudes.
- Agenda.
- Clientes.
- Servicios realizados.
- Catálogo de servicios.
- Presupuestos.
- Estadísticas.
- Chat.
- Perfil del taller.
- Notificaciones.

### Acciones del taller

El endpoint `mecanico.php` recibe una propiedad `accion`. Entre las acciones actuales se encuentran:

- `descartar_solicitud`
- `confirmar_turno`
- `completar_turno`
- `confirmar_solicitud_turno`
- `crear_turno`
- `enviar_presupuesto`
- `registrar_servicio`
- `guardar_diagnostico`
- `guardar_servicio_catalogo`
- `eliminar_servicio_catalogo`
- `guardar_perfil`
- `enviar_mensaje`
- `marcar_notificaciones`

---

## 8. Asistente IA

El asistente utiliza OpenAI Responses API desde PHP. La clave nunca se envía al frontend.

### Contexto utilizado

- Datos básicos del cliente.
- Vehículo seleccionado.
- Tipo, marca, modelo, año y kilometraje.
- Próximo mantenimiento.
- Historial reciente de servicios.
- Últimos mensajes de la conversación IA.
- Foto adjunta o fotogramas extraídos de un video.

### Persistencia

- La conversación se guarda como tipo `ia`.
- Preguntas y respuestas se almacenan en `mensajes`.
- La trazabilidad del proveedor, modelo y consumo se guarda en `consultas_ia.metadata`.
- Los archivos se relacionan mediante `archivos_adjuntos`.

### Formatos admitidos

| Contenido | Formatos | Límite actual |
|---|---|---:|
| Imagen | JPG, PNG, WEBP | 10 MB |
| Video | MP4, WEBM, MOV | 25 MB |

Los videos se analizan mediante fotogramas generados en el navegador. El asistente no afirma haber escuchado audio ni haber inspeccionado movimiento continuo.

### Seguridad conceptual de la IA

El prompt impide presentar hipótesis como diagnósticos definitivos y prioriza detener el vehículo o solicitar asistencia cuando existe riesgo relacionado con frenos, dirección, combustible, temperatura, aceite, humo, fuego o alta tensión.

---

## 9. Notificaciones push

### Arquitectura

```text
Evento en PHP
    |
    +-- Guarda registro en `notificaciones`
    |
    +-- Busca tokens activos en `push_tokens`
    |
    +-- Obtiene OAuth 2.0 con cuenta de servicio
    |
    +-- Envía FCM HTTP v1
    |
    v
Android recibe el mensaje
    |
    +-- App en segundo plano: Android muestra la tarjeta
    +-- App abierta: Local Notifications muestra la tarjeta
    +-- Al tocar: navegación a la sección correspondiente
```

### Eventos conectados

#### Cliente hacia taller

- Nuevo mensaje.
- Solicitud de presupuesto.
- Solicitud de diagnóstico.
- Solicitud de urgencia.
- Solicitud de turno.
- Cancelación de turno.
- Aceptación/rechazo de presupuesto.
- Nueva reseña.

#### Taller hacia cliente

- Nuevo mensaje.
- Presupuesto recibido.
- Turno confirmado.
- Nuevo turno creado.
- Turno completado.
- Solicitud no aceptada.
- Servicio registrado.
- Diagnóstico registrado.

#### Automáticos

- Mantenimiento por fecha o kilometraje.
- Turno en las próximas 24 horas.
- Presupuesto próximo a vencer.

### Varios dispositivos

Cada instalación obtiene un token independiente. Un cliente o mecánico puede tener más de un teléfono. La tabla no guarda un único token en el usuario, sino múltiples dispositivos asociados.

El flujo fue validado con dos teléfonos Android reales:

- Honor como cliente.
- Samsung como taller.
- Mensajes FCM aceptados con HTTP 200.
- Publicación confirmada en ambos sistemas Android.

### Automatización local

Windows tiene una tarea programada llamada `AsistiGo Notificaciones`, ejecutada cada cinco minutos. Esta llama a:

```text
backend/scripts/procesar-notificaciones.php
```

La tabla `notificacion_envios` evita repetir recordatorios ya procesados.

---

## 10. API actual

La URL local por defecto es:

```text
http://localhost/asistigo/backend/api
```

Desde teléfonos en la red local se utiliza actualmente:

```text
http://192.168.1.13/asistigo/backend/api
```

| Endpoint | Métodos | Responsabilidad |
|---|---|---|
| `health.php` | GET | Estado de PHP y base de datos |
| `auth.php` | POST | Login y registro cliente/mecánico |
| `app-data.php` | GET | Datos agregados del cliente |
| `mecanico.php` | GET, POST | Datos y acciones del taller |
| `vehiculos.php` | POST, PUT, PATCH, DELETE | Vehículos |
| `perfil.php` | PUT, PATCH | Perfil y preferencias del cliente |
| `solicitudes.php` | POST | Presupuestos, diagnósticos y urgencias |
| `turnos.php` | POST, PATCH | Reservas y cancelaciones |
| `presupuestos.php` | POST, PATCH | Estado de presupuestos |
| `chat.php` | POST | Mensajes enviados por clientes |
| `resenas.php` | POST | Calificaciones |
| `notificaciones.php` | POST, PATCH | Marcar avisos leídos |
| `push-tokens.php` | POST | Registrar/desactivar dispositivos |
| `geocode.php` | GET | Geocodificación directa e inversa |
| `asistente-ia.php` | POST multipart/JSON | Consultas IA y adjuntos |
| `clientes.php` | GET, POST | Endpoint básico/legado de clientes |

### Forma general de respuesta

Éxito:

```json
{
  "ok": true,
  "data": {}
}
```

Error:

```json
{
  "ok": false,
  "error": "Descripción del error"
}
```

---

## 11. Modelo de datos

El esquema fuente está en `database/base_actual.sql`.

### Identidad y preferencias

- `clientes`
- `cliente_preferencias`
- `cliente_direcciones`
- `mecanicos`
- `talleres`
- `taller_mecanicos`

### Operación del taller

- `taller_horarios`
- `taller_servicios`
- `taller_tipos_vehiculo`
- `taller_metodos_pago`
- `taller_fotos`

### Vehículo y mantenimiento

- `vehiculos`
- `historial_servicios`
- `diagnosticos`
- `fotos_servicio`
- `recordatorios_mantenimiento`

### Solicitudes y transacciones

- `solicitudes`
- `turnos`
- `presupuestos`
- `presupuesto_items`
- `pagos` (estructura disponible, flujo de cobro aún no integrado)

### Comunicación e IA

- `conversaciones`
- `mensajes`
- `consultas_ia`
- `archivos_adjuntos`

### Confianza y comunicación

- `resenas`
- `notificaciones`
- `push_tokens`
- `notificacion_envios`

### Relaciones centrales

```text
cliente
  └── vehículos
       ├── historial de servicios
       ├── diagnósticos
       ├── recordatorios
       ├── solicitudes
       ├── turnos
       ├── presupuestos
       └── conversaciones

taller
  ├── mecánicos
  ├── horarios
  ├── catálogo de servicios
  ├── solicitudes
  ├── agenda
  ├── presupuestos
  └── conversaciones con clientes
```

---

## 12. Configuración local

### Requisitos

- Windows.
- XAMPP con Apache, PHP y MySQL/MariaDB.
- Node.js compatible con Vite/Capacitor.
- Android Studio y Android SDK para APK.
- Cuenta/proyecto Firebase.
- Clave de OpenAI para activar el asistente.

### Base de datos

Importar:

```text
database/base_actual.sql
```

Configuración predeterminada:

```text
Host: 127.0.0.1
Puerto: 3306
Base: asistigo
Usuario: root
Contraseña: vacía
```

Puede reemplazarse mediante:

```text
ASISTIGO_DB_HOST
ASISTIGO_DB_PORT
ASISTIGO_DB_NAME
ASISTIGO_DB_USER
ASISTIGO_DB_PASS
```

### Frontend

```powershell
cd C:\xampp\htdocs\asistigo\asisti-go
npm install
npm run dev
```

Validación:

```powershell
npm run lint
npm run build
```

### Android

```powershell
npm run build
npx cap sync android
npx cap open android
```

El APK de desarrollo queda en:

```text
asisti-go/android/app/build/outputs/apk/debug/app-debug.apk
```

### Firebase Android

El archivo público de configuración debe estar en:

```text
asisti-go/android/app/google-services.json
```

La credencial privada se guarda fuera de `htdocs`:

```text
C:\xampp\secure\asistigo-firebase.json
```

Puede configurarse con:

```text
ASISTIGO_FIREBASE_CREDENTIALS
```

### OpenAI

Crear `backend/.env`:

```text
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.6
OPENAI_TIMEOUT_SECONDS=45
```

La clave debe permanecer únicamente en el servidor.

---

## 13. Pruebas realizadas

### Comprobaciones técnicas

- Sintaxis de todos los PHP mediante `php -l`.
- `npm run lint` sin errores.
- `npm run build` satisfactorio.
- Sincronización de Capacitor.
- Compilación Gradle `assembleDebug` satisfactoria.
- Instalación real mediante ADB.
- Verificación de `health.php` por localhost y por IP LAN.

### Pruebas reales en dispositivos

- Login cliente en Android.
- Login taller en un segundo Android.
- Registro de dos tokens diferentes.
- Push dirigido al cliente.
- Push dirigido al taller.
- Notificación con app abierta.
- Notificación con app minimizada.
- Navegación al tocar la notificación.
- Persistencia de tokens en MySQL.

---

## 14. Convenciones para nuevos desarrolladores

1. El vehículo continúa siendo la entidad central del producto.
2. Las reglas de negocio deben vivir en el backend.
3. No duplicar historial o conversaciones en almacenamiento local.
4. Usar `app-data.php` como agregador cliente mientras se mantenga la arquitectura actual.
5. Usar `mecanico.php` para el panel hasta dividir formalmente la API.
6. Toda notificación debe crear historial y push mediante `notificaciones_service.php`.
7. No guardar claves privadas dentro del frontend, Android o `htdocs`.
8. Mantener la paleta oficial sin agregar colores visibles arbitrarios.
9. Verificar siempre PHP, lint, build y una prueba HTTP real.
10. Las migraciones nuevas deben acompañarse de la actualización de `base_actual.sql`.

---

## 15. Limitaciones actuales conocidas

Estas limitaciones no impiden las pruebas locales, pero deben resolverse antes de producción:

- La sesión se guarda en `localStorage` y no existe todavía un sistema completo de tokens de acceso seguros.
- Muchos endpoints reciben `cliente_id` o `mecanico_id` desde el frontend.
- CORS está configurado con origen abierto.
- Android permite tráfico HTTP sin cifrar para comunicarse con XAMPP.
- La API usa una IP LAN local y no un dominio estable.
- No existe todavía despliegue productivo, balanceo, backups automáticos ni observabilidad.
- No hay recuperación de contraseña ni verificación completa de correo/teléfono.
- No existe todavía eliminación de cuenta integrada en la interfaz.
- La estructura de pagos existe, pero no hay pasarela conectada.
- iOS no está generado ni configurado.
- No hay suite automatizada de pruebas unitarias, integración y E2E.
- No existe CI/CD ni firma de versiones de publicación.
- El backend está concentrado en endpoints PHP y necesita modularización progresiva si crece el equipo.

El detalle y el orden recomendado para cerrar estas brechas se encuentran en `md/QUE_LE_FALTA_A_ASISTIGO.md`.

