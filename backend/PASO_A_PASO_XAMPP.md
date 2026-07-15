# Paso a paso para probar backend en XAMPP

## 1. Encender XAMPP

Abrir el panel de XAMPP y prender:

- Apache
- MySQL

Si MySQL no esta prendido, el backend va a responder error de conexion.

## 2. Crear/importar la base de datos

Opcion visual:

1. Abrir `http://localhost/phpmyadmin`.
2. Entrar a la pestana `Importar`.
3. Elegir el archivo:
   `C:\xampp\htdocs\asistigo\database\asistigo_schema.sql`
4. Ejecutar la importacion.

Opcion por consola:

```powershell
C:\xampp\mysql\bin\mysql.exe -uroot < C:\xampp\htdocs\asistigo\database\asistigo_schema.sql
```

## 3. Probar conexion del backend

Abrir en el navegador:

```text
http://localhost/asistigo/backend/api/health.php
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Backend AsistiGo conectado a la base de datos"
}
```

## 4. Probar crear un cliente

En PowerShell:

```powershell
$body = @{
  nombre = "Martin"
  apellido = "Fernandez"
  email = "martin.prueba@asistigo.test"
  telefono = "099123456"
  pais = "Uruguay"
  ciudad = "Montevideo"
  password = "asistigo123"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost/asistigo/backend/api/clientes.php" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

## 5. Probar listar clientes

Abrir en el navegador:

```text
http://localhost/asistigo/backend/api/clientes.php
```

O por PowerShell:

```powershell
Invoke-RestMethod "http://localhost/asistigo/backend/api/clientes.php"
```

## 6. Conectar desde React

Ejemplo simple:

```js
const API_URL = 'http://localhost/asistigo/backend/api'

const respuesta = await fetch(`${API_URL}/clientes.php`)
const datos = await respuesta.json()
console.log(datos)
```

Para crear:

```js
await fetch(`${API_URL}/clientes.php`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: 'Martin',
    apellido: 'Fernandez',
    email: 'martin.prueba@asistigo.test',
    telefono: '099123456',
    pais: 'Uruguay',
    ciudad: 'Montevideo',
    password: 'asistigo123',
  }),
})
```

## 7. Donde tocar si cambia la clave de MySQL

Editar:

```text
C:\xampp\htdocs\asistigo\backend\config\database.php
```

Valores actuales:

- base: `asistigo`
- usuario: `root`
- password: vacio

## 8. Siguiente paso recomendado

Despues de probar `clientes.php`, conviene crear endpoints por modulo:

- `auth/login.php`
- `vehiculos.php`
- `talleres.php`
- `turnos.php`
- `presupuestos.php`
- `chats.php`
- `historial.php`
