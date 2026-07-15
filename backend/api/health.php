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
        'database' => getenv('ASISTIGO_DB_NAME') ?: 'asistigo',
        'environment' => getenv('RAILWAY_ENVIRONMENT_NAME') ?: 'local',
        'time' => date('c'),
    ]);
} catch (Throwable $error) {
    error_log('AsistiGo health database error: ' . $error->getMessage());
    responder_json([
        'ok' => false,
        'error' => 'No se pudo conectar a la base de datos',
    ], 500);
}
