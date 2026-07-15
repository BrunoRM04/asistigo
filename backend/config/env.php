<?php

declare(strict_types=1);

function asistigo_env(string $nombre, string $predeterminado = ''): string
{
    $valor = getenv($nombre);
    if ($valor !== false && $valor !== '') {
        return (string) $valor;
    }

    $valorServidor = $_SERVER[$nombre] ?? '';
    if ($valorServidor !== '') {
        return (string) $valorServidor;
    }

    if (function_exists('apache_getenv')) {
        $valorApache = apache_getenv($nombre, true);
        if ($valorApache !== false && $valorApache !== '') {
            return (string) $valorApache;
        }
    }

    return $predeterminado;
}
