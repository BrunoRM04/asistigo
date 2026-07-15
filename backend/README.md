# Backend AsistiGo en XAMPP

Backend minimo en PHP para probar la conexion con MariaDB desde XAMPP.

## Endpoints iniciales

- `GET /asistigo/backend/api/health.php`: prueba la conexion a la base `asistigo`.
- `GET /asistigo/backend/api/clientes.php`: lista clientes.
- `POST /asistigo/backend/api/clientes.php`: crea un cliente de prueba.

## Configuracion

La conexion esta en `config/database.php`.

Valores por defecto para XAMPP:

- host: `127.0.0.1`
- puerto: `3306`
- base: `asistigo`
- usuario: `root`
- password: vacio

## Asistente IA con OpenAI

1. Revoca cualquier clave que se haya compartido por chat o incluido en archivos.
2. Copia `backend/.env.example` como `backend/.env`.
3. Coloca una clave nueva en `OPENAI_API_KEY`. El archivo `.env` esta ignorado por Git.
4. Inicia Apache y MySQL desde XAMPP. El endpoint es `POST /asistigo/backend/api/asistente-ia.php`.

El modelo predeterminado se configura con `OPENAI_MODEL` y actualmente es `gpt-5.6`. La clave solo se lee en PHP y nunca llega al frontend.

El asistente conserva el historial en `conversaciones`, `mensajes` y `consultas_ia`. Las fotos y videos se guardan mediante la tabla existente `archivos_adjuntos` y en `backend/uploads/chat-ia/`. Se admiten imágenes JPG, PNG o WEBP de hasta 10 MB y videos MP4, WEBM o MOV de hasta 25 MB. Los videos se analizan a partir de tres fotogramas extraídos en el navegador.
