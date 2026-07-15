#!/bin/sh
set -eu

PORT="${PORT:-8080}"

sed -ri "s/^Listen [0-9]+$/Listen ${PORT}/" /etc/apache2/ports.conf
sed -ri "s/<VirtualHost \*:[0-9]+>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf

# Algunas variantes de la imagen pueden dejar enlaces MPM incompatibles.
# Quitamos tanto .load como .conf y habilitamos solo prefork para mod_php.
rm -f /etc/apache2/mods-enabled/mpm_event.* \
      /etc/apache2/mods-enabled/mpm_worker.* \
      /etc/apache2/mods-enabled/mpm_prefork.* \
      /etc/apache2/mods-enabled/zz-asistigo-mpm.load
ln -s /etc/apache2/mods-available/mpm_prefork.load \
    /etc/apache2/mods-enabled/mpm_prefork.load
ln -s /etc/apache2/mods-available/mpm_prefork.conf \
    /etc/apache2/mods-enabled/mpm_prefork.conf

# mod_php bajo Apache no siempre conserva el entorno completo del proceso.
# Copiamos solo las variables conocidas al entorno interno de cada request.
RUNTIME_ENV_CONF=/etc/apache2/conf-enabled/asistigo-runtime-env.conf
: > "$RUNTIME_ENV_CONF"
DETECTED_NAMES=""
for NAME in \
    ASISTIGO_DB_HOST ASISTIGO_DB_PORT ASISTIGO_DB_NAME \
    ASISTIGO_DB_USER ASISTIGO_DB_PASS ASISTIGO_ALLOWED_ORIGINS \
    ASISTIGO_PUBLIC_URL ASISTIGO_FIREBASE_JSON_BASE64 \
    OPENAI_API_KEY OPENAI_MODEL OPENAI_TIMEOUT_SECONDS \
    RAILWAY_ENVIRONMENT_NAME RAILWAY_PUBLIC_DOMAIN
do
    VALUE=$(printenv "$NAME" 2>/dev/null || true)
    if [ -n "$VALUE" ]; then
        ESCAPED_VALUE=$(printf '%s' "$VALUE" | sed 's/\\/\\\\/g; s/"/\\"/g')
        printf 'SetEnv %s "%s"\n' "$NAME" "$ESCAPED_VALUE" >> "$RUNTIME_ENV_CONF"
        DETECTED_NAMES="$DETECTED_NAMES $NAME"
    fi
done
printf 'AsistiGo runtime variables detected:%s\n' "$DETECTED_NAMES"

exec apache2-foreground

