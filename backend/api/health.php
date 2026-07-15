<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/http.php';
require_once __DIR__ . '/../config/database.php';

try {
    $db = asistigo_db();
    $db->query('SELECT 1');

    responder_json([
        'ok' => true,
        'message' => 'Backend AsistiGo conectado a la base de datos',
        'database' => getenv('ASISTIGO_DB_NAME') ?: ($_SERVER['ASISTIGO_DB_NAME'] ?? 'asistigo'),
        'environment' => getenv('RAILWAY_ENVIRONMENT_NAME') ?: ($_SERVER['RAILWAY_ENVIRONMENT_NAME'] ?? 'local'),
        'time' => date('c'),
    ]);
} catch (Throwable $error) {
    $dbHost = getenv('ASISTIGO_DB_HOST') ?: ($_SERVER['ASISTIGO_DB_HOST'] ?? '127.0.0.1');
    $dbPort = getenv('ASISTIGO_DB_PORT') ?: ($_SERVER['ASISTIGO_DB_PORT'] ?? '3306');
    $dbIp = gethostbyname($dbHost);
    error_log(
        'AsistiGo health database target: '
        . $dbHost . ':' . $dbPort
        . ' resolved=' . $dbIp
        . ' error=' . $error->getMessage()
    );
    responder_json([
        'ok' => false,
        'error' => 'No se pudo conectar a la base de datos',
    ], 500);
}
