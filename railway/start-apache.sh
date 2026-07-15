#!/bin/sh
set -eu

PORT="${PORT:-8080}"

sed -ri "s/^Listen [0-9]+$/Listen ${PORT}/" /etc/apache2/ports.conf
sed -ri "s/<VirtualHost \*:[0-9]+>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf

# Algunas variantes de la imagen pueden dejar mas de una declaracion MPM
# activa. Deshabilitamos todas y cargamos exactamente prefork para mod_php.
find /etc/apache2 -type f -exec sed -ri \
    's@^[[:space:]]*LoadModule[[:space:]]+mpm_(event|worker|prefork)_module@# AsistiGo disabled duplicate MPM: &@' {} +
printf '%s\n' 'LoadModule mpm_prefork_module /usr/lib/apache2/modules/mod_mpm_prefork.so' \
    > /etc/apache2/mods-enabled/zz-asistigo-mpm.load

exec apache2-foreground

