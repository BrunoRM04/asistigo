<?php

declare(strict_types=1);

function asistigo_db(): PDO
{
    $env = static function (string $nombre, string $predeterminado = ''): string {
        $valor = getenv($nombre);
        if ($valor !== false && $valor !== '') {
            return (string) $valor;
        }

        $valorServidor = $_SERVER[$nombre] ?? '';
        return $valorServidor !== '' ? (string) $valorServidor : $predeterminado;
    };

    $host = $env('ASISTIGO_DB_HOST', '127.0.0.1');
    $port = $env('ASISTIGO_DB_PORT', '3306');
    $database = $env('ASISTIGO_DB_NAME', 'asistigo');
    $username = $env('ASISTIGO_DB_USER', 'root');
    $password = $env('ASISTIGO_DB_PASS');

    $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";

    return new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}
