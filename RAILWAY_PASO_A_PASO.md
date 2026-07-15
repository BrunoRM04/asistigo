# AsistiGo en Railway: puesta en marcha de staging

Este despliegue conserva React, Capacitor, PHP y MySQL. El primer objetivo es
un entorno de pruebas publico; no se deben registrar usuarios finales hasta
completar el endurecimiento de autenticacion y autorizacion.

## Arquitectura

- `asistigo-api`: contenedor PHP 8.3 + Apache creado desde el `Dockerfile`.
- `MySQL`: base administrada por Railway.
- volumen en `/var/www/html/backend/uploads`: adjuntos persistentes.
- Android: consume `https://<dominio>/backend/api`.

## Acciones del propietario de las cuentas

1. Revocar la clave que aparecia anteriormente en `backend/.env.example` y
   crear una nueva clave de OpenAI. No pegarla en Git ni en conversaciones.
2. Crear o abrir la cuenta de Railway y conectar la cuenta de GitHub.
3. Crear un proyecto vacio llamado `asistigo-staging`.
4. Agregar `+ New` -> `Database` -> `MySQL` y dejar el servicio con el nombre
   `MySQL`.
5. Agregar `+ New` -> `GitHub Repo` -> `BrunoRM04/asistigo`. Nombrar el
   servicio `asistigo-api`. El repositorio debe contener primero los cambios
   de preparacion de Railway.
6. En `asistigo-api` -> `Variables`, crear las referencias indicadas abajo.
7. En `asistigo-api` -> `Settings` -> `Networking`, pulsar `Generate Domain`.
8. Copiar el dominio HTTPS generado, sin compartir contrasenas ni claves.
9. Agregar un volumen al servicio `asistigo-api` con punto de montaje
   `/var/www/html/backend/uploads`.

## Variables de `asistigo-api`

Usar referencias de Railway para no copiar las credenciales de MySQL:

```text
ASISTIGO_DB_HOST=${{MySQL.MYSQLHOST}}
ASISTIGO_DB_PORT=${{MySQL.MYSQLPORT}}
ASISTIGO_DB_NAME=${{MySQL.MYSQLDATABASE}}
ASISTIGO_DB_USER=${{MySQL.MYSQLUSER}}
ASISTIGO_DB_PASS=${{MySQL.MYSQLPASSWORD}}
```

Agregar tambien:

```text
ASISTIGO_ALLOWED_ORIGINS=http://localhost,http://127.0.0.1
ASISTIGO_PUBLIC_URL=https://DOMINIO_GENERADO
OPENAI_MODEL=gpt-5.6
OPENAI_TIMEOUT_SECONDS=45
```

Los valores siguientes son secretos y deben introducirse directamente en el
panel de Railway:

```text
OPENAI_API_KEY=CLAVE_NUEVA
ASISTIGO_FIREBASE_JSON_BASE64=CREDENCIAL_FIREBASE_EN_BASE64
```

Despues de guardarlos, usar el menu de cada variable para marcar los secretos
como `Sealed`.

## Firebase en base64 desde PowerShell

Ejecutar localmente, cambiando solamente la ruta del archivo privado:

```powershell
[Convert]::ToBase64String(
  [IO.File]::ReadAllBytes('C:\xampp\secure\asistigo-firebase.json')
) | Set-Clipboard
```

Pegar el portapapeles directamente en `ASISTIGO_FIREBASE_JSON_BASE64` dentro
de Railway. No guardar ese resultado en el repositorio.

## Base de datos

`database/base_actual.sql` crea tablas vacias y es destructivo si ya existen,
porque incluye `DROP TABLE`. Solo se utilizara en la base nueva de staging.
Antes de importar se realizara ademas una exportacion de la base local actual
para decidir si staging debe comenzar vacio o conservar los datos de prueba.

Las migraciones de `database/migrations/` son idempotentes y se aplican
despues del esquema cuando corresponda.

## Comprobaciones esperadas

Una vez desplegado y cargada la base:

```text
https://DOMINIO_GENERADO/backend/api/health.php
```

debe responder JSON con `ok: true` y `environment: production` o el nombre del
entorno asignado por Railway.

El frontend Android se compilara despues con:

```text
VITE_API_URL=https://DOMINIO_GENERADO/backend/api
```

No se debe modificar a mano el fallback local de `asistigoApi.js`; asi XAMPP
seguira disponible para desarrollo.

## Tarea programada posterior

`backend/scripts/procesar-notificaciones.php` se desplegara como servicio cron
separado cuando la API y Firebase hayan pasado las pruebas. Railway ejecuta
los cron en UTC y la frecuencia minima es cinco minutos.
