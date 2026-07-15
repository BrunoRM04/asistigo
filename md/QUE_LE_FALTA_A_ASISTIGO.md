# ¿Qué le falta a AsistiGo?

## Hoja de ruta desde el MVP local hasta producción

**Última actualización:** 14 de julio de 2026  
**Punto de partida:** MVP Android funcional, backend local XAMPP, MySQL, Firebase, OpenAI y pruebas con dos teléfonos reales.

---

## 1. Resumen ejecutivo

AsistiGo ya demuestra el producto central: cliente y taller pueden registrarse, administrar vehículos, buscarse, conversar, solicitar turnos/presupuestos y recibir notificaciones reales.

Sin embargo, **funcionar en dos teléfonos dentro de una red local no equivale a estar listo para producción**.

Los bloqueos principales son:

1. Autenticación y autorización seguras.
2. Backend y base de datos en un servidor HTTPS público.
3. Gestión productiva de secretos, archivos y tareas automáticas.
4. Privacidad, términos, eliminación de cuenta y cumplimiento de las tiendas.
5. Firma, pruebas y publicación Android.
6. Proyecto iOS, APNs y publicación en App Store.
7. Monitoreo, backups, soporte y operación continua.

### Estimación cualitativa

| Área | Estado |
|---|---|
| Producto MVP | Avanzado |
| Android local | Funcional |
| Push Android | Funcional |
| Backend local | Funcional |
| Seguridad productiva | Pendiente crítica |
| Infraestructura pública | Pendiente crítica |
| Google Play | Pendiente |
| iPhone/App Store | Pendiente |
| QA automatizada | Pendiente |
| Operación y soporte | Pendiente |

---

## 2. Prioridad 0: seguridad antes de exponer la API

No se recomienda publicar el backend actual directamente en Internet.

### 2.1 Autenticación real

Actualmente el frontend conserva la sesión en `localStorage` y varios endpoints aceptan identificadores enviados por el cliente.

Debe implementarse:

- Token de acceso de corta duración.
- Token de renovación revocable.
- Asociación de cada solicitud con la identidad autenticada.
- Roles `cliente`, `mecanico`, `administrador` y permisos explícitos.
- Cierre de todas las sesiones/dispositivos.
- Revocación por pérdida de teléfono o cambio de contraseña.
- Protección contra reutilización de tokens.

Opciones razonables:

1. **Mantener PHP simple:** tabla de sesiones, tokens aleatorios hasheados y middleware común.
2. **Migrar a Laravel:** Laravel Sanctum para móvil y panel web.
3. **Proveedor administrado:** Auth0, Firebase Authentication o Supabase Auth, evaluando costo y dependencia.

La opción más fácil sin rehacer el producto es agregar un middleware de autenticación al PHP actual y migrar progresivamente.

### 2.2 Autorización por recurso

Cada endpoint debe verificar en servidor:

- Que el vehículo pertenece al cliente autenticado.
- Que el mecánico pertenece al taller indicado.
- Que el taller participa en la conversación.
- Que el presupuesto y turno corresponden a las partes involucradas.
- Que nadie puede registrar un token push para otra cuenta.
- Que los archivos solo son visibles para personas autorizadas.

### 2.3 Protección HTTP

- Reemplazar `Access-Control-Allow-Origin: *` por dominios autorizados.
- Usar HTTPS obligatorio.
- Eliminar `android:usesCleartextTraffic="true"` para la versión de producción.
- Eliminar `server.androidScheme: "http"` de la configuración productiva.
- Agregar límites de peticiones por IP, cuenta y endpoint.
- Limitar intentos de login y recuperación.
- Agregar cabeceras de seguridad.
- Validar tamaño, MIME y contenido de todos los archivos.

### 2.4 Contraseñas y cuentas

- Verificación de correo.
- Recuperación de contraseña.
- Cambio de contraseña.
- Detección de correo comprometido opcional.
- Política de contraseñas razonable.
- Bloqueo temporal ante ataques.
- Eliminación y desactivación de cuenta.

Google Play exige que una app que permite crear cuentas también permita solicitar su eliminación; además debe declararse correctamente el tratamiento de datos en la política de privacidad. [Política oficial de Google Play](https://support.google.com/googleplay/android-developer/answer/17105854)

---

## 3. Prioridad 1: mover XAMPP a un entorno público

### Lo que debe cambiar

```text
Actual:
Teléfono → http://192.168.1.13 → XAMPP en una PC

Producción:
Teléfono → https://api.asistigo... → servidor PHP → base privada
```

### Opción fácil recomendada para el MVP

Un VPS administrado o hosting cloud con:

- Ubuntu LTS.
- Nginx o Apache.
- PHP compatible.
- MySQL/MariaDB administrado o en servidor separado.
- Certificado TLS de Let's Encrypt.
- Dominio `api...`.
- Copias de seguridad diarias.
- Almacenamiento de archivos fuera del árbol público.

Proveedores posibles incluyen DigitalOcean, Hetzner, AWS Lightsail, Google Cloud Run/Compute Engine, Azure App Service o un hosting PHP administrado. La elección depende de presupuesto y experiencia operativa.

### Opción aún más sencilla

Para una beta cerrada puede utilizarse un hosting PHP con MySQL y HTTPS, siempre que permita:

- Variables de entorno.
- Tareas cron.
- cURL y OpenSSL.
- Subidas del tamaño requerido.
- Acceso seguro a backups.

### No recomendado como producción

- Mantener la PC personal encendida.
- Exponer XAMPP mediante un túnel permanente.
- Usar IP residencial.
- Guardar claves privadas en `htdocs`.
- Compartir la misma base de desarrollo y producción.

### Entornos necesarios

```text
Desarrollo   → datos locales
Staging      → pruebas de equipo y tiendas
Producción   → usuarios reales
```

Cada entorno debe tener base, Firebase, secretos y archivos separados.

---

## 4. Base de datos y migraciones

### Pendientes

- Adoptar una herramienta formal de migraciones.
- Versionar seeds mínimos sin datos personales.
- Backups cifrados automáticos.
- Pruebas periódicas de restauración.
- Índices revisados con datos de volumen real.
- Política de retención y borrado.
- Auditoría de cambios sensibles.
- Transacciones consistentes para flujos complejos.
- Evitar devolver mensajes SQL al cliente.

### Evolución recomendada

La base actual puede mantenerse. No es necesario rehacer todas las tablas. Conviene agregar:

- `api_sessions` o equivalente.
- `password_resets`.
- `email_verifications`.
- `audit_logs`.
- `account_deletion_requests`.
- `notification_preferences` también para mecánicos.
- Estados de entrega de mensajes/notificaciones si se necesita auditoría avanzada.

---

## 5. Archivos, fotos y videos

Actualmente los adjuntos del asistente se guardan en disco local.

Para producción se necesita:

- Almacenamiento de objetos: Amazon S3, Cloudflare R2, Google Cloud Storage o similar.
- URLs firmadas con vencimiento.
- Escaneo antivirus.
- Eliminación de metadatos EXIF sensibles.
- Miniaturas y compresión.
- Límites por usuario.
- Retención y eliminación conforme a privacidad.
- CDN si aumenta el tráfico.

No conviene servir documentos privados desde una URL pública predecible.

---

## 6. Notificaciones que aún faltan

### Android

La funcionalidad está conectada, pero para producción falta:

- Proyecto Firebase separado para producción.
- Icono monocromático oficial de notificación.
- Definir categorías/canales configurables.
- Métricas de entrega y apertura.
- Panel para preferencias del mecánico.
- Pruebas en más fabricantes y versiones.
- Pruebas con ahorro extremo de batería.
- Política de reintentos y cola para fallas temporales.

### iPhone

iOS todavía no está generado.

#### Requisitos

- Una computadora Mac compatible.
- Xcode actualizado.
- Cuenta Apple Developer.
- Identificador de bundle, por ejemplo `com.asistigo.app` si está disponible.
- Aplicación iOS registrada en Firebase.
- Proyecto iOS de Capacitor.
- Capability de Push Notifications.
- Background Modes para remote notifications.
- Clave de autenticación APNs.
- Certificados y perfiles de firma.

#### Pasos técnicos

En una Mac:

```bash
cd asisti-go
npm install @capacitor/ios
npx cap add ios
npm run build
npx cap sync ios
npx cap open ios
```

Después:

1. Crear la app iOS en Firebase.
2. Descargar `GoogleService-Info.plist`.
3. Agregarlo al target correcto en Xcode.
4. Activar Push Notifications.
5. Activar Background Modes → Remote notifications.
6. Crear una APNs Authentication Key en Apple Developer.
7. Subir la clave a Firebase Cloud Messaging.
8. Solicitar permiso desde Capacitor.
9. Registrar y probar un token iOS.
10. Probar primer plano, segundo plano, app cerrada y toque.

Firebase requiere configurar APNs para entregar mensajes a aplicaciones Apple. [Guía oficial de Firebase para iOS](https://firebase.google.com/docs/cloud-messaging/ios/get-started)

Capacitor iOS se construye y firma mediante Xcode en macOS. [Documentación oficial de Capacitor iOS](https://capacitorjs.com/docs/ios)

### Costos y cuentas Apple

Para distribuir públicamente se necesita inscripción en Apple Developer Program. La persona u organización debe verificar identidad y aceptar los acuerdos correspondientes. [Inscripción oficial de Apple Developer](https://developer.apple.com/help/account/membership/program-enrollment/)

---

## 7. Preparación para Google Play

### 7.1 Generar una versión release

No debe publicarse `app-debug.apk`.

Se necesita:

- Keystore de producción protegido y respaldado.
- `versionCode` incremental.
- `versionName` con versionado semántico.
- Android App Bundle `.aab` firmado.
- Configuración release sin HTTP local.
- API productiva HTTPS.
- Firebase productivo.
- Eliminación de logs y secretos.

### 7.2 Ficha de Play Store

- Nombre y descripción.
- Icono 512x512.
- Capturas reales.
- Gráfico promocional.
- Categoría.
- Correo y sitio de soporte.
- Países de distribución.
- Clasificación de contenido.
- Público objetivo.
- Política de privacidad pública.
- Formulario Data safety.
- Credenciales de prueba para revisión.

Google exige información y metadatos correctos, política de privacidad, sección Data safety y recursos de acceso cuando la app requiere login. [Requisitos oficiales de Play Console](https://support.google.com/googleplay/android-developer/answer/10788890)

### 7.3 Pruebas en Play Console

La ruta recomendada es:

```text
Internal testing → Closed testing → Production
```

Las cuentas personales nuevas pueden estar sujetas a requisitos obligatorios de prueba cerrada antes de solicitar acceso a producción. Se debe revisar la condición exacta de la cuenta en Play Console. [Requisitos oficiales de prueba](https://support.google.com/googleplay/android-developer/answer/14151465)

Google diferencia tracks internos, cerrados, abiertos y producción. [Estados oficiales de publicación](https://support.google.com/googleplay/android-developer/answer/9859751)

---

## 8. Preparación para App Store

### Elementos necesarios

- Apple Developer Program activo.
- Bundle ID y firma.
- App Store Connect.
- Certificados y perfiles.
- Build subida desde Xcode.
- TestFlight.
- Política de privacidad.
- URL de soporte.
- Capturas para tamaños requeridos.
- Descripción y palabras clave.
- Declaración de datos recopilados.
- Cuenta demo para revisión.
- Explicaciones de permisos de ubicación, cámara, fotos y notificaciones.

### Ruta recomendada

```text
Desarrollo en dispositivo → TestFlight interno → TestFlight externo → App Store
```

Antes de desarrollar iOS conviene cerrar la API HTTPS y la autenticación; así Android e iOS consumirán el mismo backend seguro.

---

## 9. Privacidad, términos y cumplimiento

AsistiGo maneja información personal y potencialmente sensible:

- Nombre, correo y teléfono.
- Ubicación y direcciones.
- Vehículos y patentes.
- Historial mecánico.
- Conversaciones.
- Fotos y videos.
- Consultas enviadas a IA.
- Tokens de dispositivos.

Se necesita asesoramiento legal adaptado a los países de operación.

### Documentos mínimos

- Política de privacidad.
- Términos y condiciones.
- Política de eliminación de cuenta y datos.
- Política de retención.
- Consentimiento para ubicación.
- Información sobre uso de IA.
- Descargo: la IA no reemplaza un diagnóstico profesional.
- Contrato/condiciones para talleres.

### Funciones necesarias en la app

- Solicitar eliminación de cuenta.
- Descargar o solicitar copia de datos.
- Revocar permisos.
- Desactivar push.
- Eliminar adjuntos cuando corresponda.
- Contactar soporte.

---

## 10. IA para producción

### Pendientes técnicos

- Moderación y límites de uso.
- Presupuesto máximo por usuario/día.
- Métricas de tokens y costo.
- Reintentos controlados.
- Cola para trabajos largos.
- Anonimización/minimización de datos.
- Evaluaciones automáticas de calidad y seguridad.
- Versionado del prompt.
- Registro de consentimiento.
- Proceso de incidentes y respuestas incorrectas.
- Revisión del modelo antes de cada despliegue.

### Recomendación

Mantener la IA como orientación. Nunca permitir que apruebe reparaciones, pagos o decisiones de seguridad sin confirmación humana.

---

## 11. Pagos y modelo comercial

La tabla `pagos` existe, pero no hay una pasarela conectada.

Antes de implementarla hay que decidir:

- Si AsistiGo cobra al cliente, al taller o a ambos.
- Si cobra suscripción, comisión o tarifa fija.
- Quién factura.
- Cómo se manejan cancelaciones y reembolsos.
- Monedas y países.
- Responsabilidad ante disputas.

Opciones posibles:

- Mercado Pago para Uruguay/Latinoamérica.
- Stripe si está disponible para la entidad y el país.
- Pagos fuera de la app inicialmente, evitando complejidad en el MVP.

La opción más simple para una primera publicación es no procesar pagos dentro de AsistiGo y limitarse a presupuestos y coordinación.

---

## 12. Calidad y pruebas

### Faltantes

- Pruebas unitarias de PHP.
- Pruebas de integración de API.
- Pruebas frontend de componentes.
- Pruebas E2E de cliente y taller.
- Base de datos aislada para tests.
- Pruebas de migraciones y rollback.
- Pruebas de carga.
- Pruebas de seguridad.
- Pruebas de accesibilidad.
- Matriz de dispositivos Android/iOS.
- Pruebas de redes lentas y sin conexión.

### Flujos E2E prioritarios

1. Registro cliente → vehículo → taller → presupuesto.
2. Registro taller → solicitud → respuesta.
3. Chat bidireccional.
4. Turno completo desde solicitud hasta reseña.
5. Push en ambos sentidos.
6. Cambio y recuperación de contraseña.
7. Eliminación de cuenta.
8. Adjunto IA válido e inválido.

---

## 13. Observabilidad y operación

Antes de recibir usuarios reales se necesita:

- Registro estructurado de errores.
- Servicio de captura de excepciones, por ejemplo Sentry.
- Monitoreo de disponibilidad.
- Alertas de fallas de Firebase/OpenAI.
- Métricas de latencia y errores por endpoint.
- Panel de estado de tareas programadas.
- Alertas por falta de backups.
- Seguimiento de costos de IA y almacenamiento.
- Soporte y procedimiento de incidentes.

### Administración

Falta un panel administrativo para:

- Aprobar/suspender talleres.
- Atender reportes.
- Gestionar cuentas.
- Consultar auditoría.
- Moderar reseñas y contenido.
- Ver salud de integraciones.
- Resolver solicitudes de eliminación.

---

## 14. CI/CD y gestión de versiones

### Recomendación mínima

Configurar GitHub Actions, GitLab CI o equivalente para ejecutar:

```text
php -l
npm ci
npm run lint
npm run build
tests PHP
tests frontend
```

### Despliegue

- Rama protegida.
- Revisión de código.
- Variables secretas en el proveedor CI.
- Migraciones antes o durante el despliegue.
- Rollback documentado.
- Builds Android/iOS reproducibles.
- Notas de versión.
- Separación de staging y producción.

---

## 15. Funciones de producto todavía pendientes u opcionales

### Necesarias para una beta sólida

- Recuperación de contraseña.
- Verificación de correo.
- Eliminación de cuenta.
- Preferencias push del taller.
- Perfil de soporte/ayuda.
- Estados offline y reintentos.
- Confirmaciones y auditoría de acciones críticas.
- Panel administrativo mínimo.

### Útiles después de la beta

- Documentos del vehículo.
- Transferencia de historial al venderlo.
- Exportación PDF.
- Fotos antes/después más completas.
- Pagos.
- Facturas.
- Planes para talleres.
- Múltiples empleados y permisos por taller.
- Sincronización con calendario.
- Analítica de negocio.

### Posponer hasta validar el negocio

- Marketplace de repuestos.
- E-commerce general.
- Seguros.
- Integración OBD-II.
- Mantenimiento predictivo avanzado.
- Venta de vehículos.

---

## 16. Tres caminos posibles

### Camino A: beta rápida y económica

Objetivo: probar el producto con 10-50 usuarios controlados.

1. Hosting PHP con HTTPS.
2. MySQL separado.
3. Autenticación segura mínima.
4. Política de privacidad y eliminación.
5. Firebase de staging.
6. Android Internal/Closed Testing.
7. Monitoreo básico.

Ventaja: menor costo y tiempo.  
Desventaja: requerirá refactor al crecer.

### Camino B: producción progresiva recomendada

1. Mantener React + Capacitor.
2. Modularizar PHP y agregar middleware seguro.
3. VPS/hosting administrado con staging y producción.
4. Almacenamiento de objetos.
5. Tests y CI/CD.
6. Publicar Android.
7. Crear iOS en Mac y publicar con TestFlight.
8. Agregar panel administrativo.

Ventaja: aprovecha casi todo el desarrollo actual.  
Desventaja: requiere disciplina de migración y operación.

### Camino C: rearquitectura de escala

1. Backend en Laravel u otro framework estructurado.
2. API versionada.
3. Colas y workers.
4. Base administrada.
5. Almacenamiento S3/R2.
6. Observabilidad completa.
7. Infraestructura como código.

Ventaja: mejor base para equipo grande y alto volumen.  
Desventaja: mayor costo y demora; no es necesaria para validar el MVP.

**Recomendación actual:** Camino B.

---

## 17. Orden recomendado de ejecución

### Fase 1 — Seguridad y servidor

- Autenticación y autorización.
- HTTPS y dominio.
- CORS restringido.
- Base y secretos de staging.
- Archivos privados.
- Backups.

### Fase 2 — Calidad de beta

- Recuperación de contraseña.
- Eliminación de cuenta.
- Política de privacidad y términos.
- Panel administrativo mínimo.
- Tests E2E críticos.
- Monitoreo.

### Fase 3 — Android

- Iconos/splash finales.
- Configuración release.
- Keystore y AAB.
- Play Console.
- Internal y Closed Testing.
- Correcciones de feedback.
- Producción gradual.

### Fase 4 — iPhone

- Mac y Apple Developer.
- Capacitor iOS.
- APNs/Firebase.
- Permisos y pruebas.
- TestFlight.
- App Store.

### Fase 5 — Escala

- Pagos si el negocio lo requiere.
- Panel administrativo avanzado.
- Múltiples empleados por taller.
- Analítica y fidelización.
- Infraestructura más robusta.

---

## 18. Checklist de “listo para producción”

### Seguridad

- [ ] Tokens de acceso seguros.
- [ ] Autorización por recurso.
- [ ] HTTPS obligatorio.
- [ ] CORS restringido.
- [ ] Rate limiting.
- [ ] Secretos fuera del repositorio.
- [ ] Recuperación y eliminación de cuenta.

### Infraestructura

- [ ] Dominio y API pública.
- [ ] Staging separado.
- [ ] Base productiva privada.
- [ ] Backups y restauración probada.
- [ ] Almacenamiento de objetos.
- [ ] Cron/worker productivo.
- [ ] Monitoreo y alertas.

### Producto/legal

- [ ] Política de privacidad.
- [ ] Términos y condiciones.
- [ ] Consentimiento de ubicación e IA.
- [ ] Soporte.
- [ ] Cuenta demo de revisión.
- [ ] Panel administrativo mínimo.

### Android

- [ ] Configuración release sin HTTP local.
- [ ] Keystore respaldado.
- [ ] AAB firmado.
- [ ] Firebase producción.
- [ ] Data safety.
- [ ] Closed testing.
- [ ] Publicación gradual.

### iOS

- [ ] Mac y Xcode.
- [ ] Apple Developer Program.
- [ ] Proyecto Capacitor iOS.
- [ ] APNs y Firebase.
- [ ] Firma y perfiles.
- [ ] TestFlight.
- [ ] Privacidad de App Store.
- [ ] Revisión y publicación.

---

## Conclusión

AsistiGo ya tiene suficiente funcionalidad para iniciar una beta controlada después de resolver seguridad, servidor y cumplimiento básico. No necesita ser reescrito para llegar a las tiendas: React, Capacitor, PHP y MySQL pueden continuar.

La decisión más eficiente es conservar el producto actual, asegurar la API, desplegar un staging HTTPS, publicar primero Android mediante pruebas cerradas y luego incorporar iOS desde una Mac con APNs y TestFlight.

