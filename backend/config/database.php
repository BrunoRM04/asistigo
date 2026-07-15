<?php

declare(strict_types=1);

require_once __DIR__ . '/env.php';

function asistigo_db(): PDO
{
    $host = asistigo_env('ASISTIGO_DB_HOST', '127.0.0.1');
    $port = asistigo_env('ASISTIGO_DB_PORT', '3306');
    $database = asistigo_env('ASISTIGO_DB_NAME', 'asistigo');
    $username = asistigo_env('ASISTIGO_DB_USER', 'root');
    $password = asistigo_env('ASISTIGO_DB_PASS');

    $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";

    return new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}
