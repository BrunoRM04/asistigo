<?php

declare(strict_types=1);

function asistigo_db(): PDO
{
    $host = getenv('ASISTIGO_DB_HOST') ?: '127.0.0.1';
    $port = getenv('ASISTIGO_DB_PORT') ?: '3306';
    $database = getenv('ASISTIGO_DB_NAME') ?: 'asistigo';
    $username = getenv('ASISTIGO_DB_USER') ?: 'root';
    $password = getenv('ASISTIGO_DB_PASS') ?: '';

    $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";

    return new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}
