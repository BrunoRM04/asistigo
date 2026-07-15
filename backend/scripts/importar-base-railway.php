<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "Este importador solo puede ejecutarse desde la consola.\n");
    exit(1);
}

$archivo = $argv[1] ?? '/opt/asistigo/database/base_actual.sql';
if (!is_file($archivo)) {
    fwrite(STDERR, "No se encontro el esquema dentro del contenedor.\n");
    exit(1);
}

try {
    $db = asistigo_db();
    $nombreBase = (string) $db->query('SELECT DATABASE()')->fetchColumn();
    $consultaTablas = $db->prepare(
        'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = :database_name'
    );
    $consultaTablas->execute([':database_name' => $nombreBase]);
    $tablasExistentes = (int) $consultaTablas->fetchColumn();

    if ($tablasExistentes > 0) {
        fwrite(STDERR, "Importacion cancelada: la base ya contiene {$tablasExistentes} tablas.\n");
        exit(2);
    }

    $lineas = file($archivo, FILE_IGNORE_NEW_LINES);
    if ($lineas === false) {
        throw new RuntimeException('No se pudo leer el esquema.');
    }

    $sentencia = '';
    $ejecutadas = 0;
    foreach ($lineas as $linea) {
        $lineaLimpia = trim($linea);
        if ($lineaLimpia === '' || str_starts_with($lineaLimpia, '--')) {
            continue;
        }

        $sentencia .= $linea . "\n";
        if (!str_ends_with(rtrim($linea), ';')) {
            continue;
        }

        $db->exec($sentencia);
        $ejecutadas++;
        $sentencia = '';
    }

    if (trim($sentencia) !== '') {
        throw new RuntimeException('El archivo SQL termino con una sentencia incompleta.');
    }

    $totalTablas = (int) $db->query(
        'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE()'
    )->fetchColumn();

    echo json_encode([
        'ok' => true,
        'database' => $nombreBase,
        'sentencias' => $ejecutadas,
        'tablas' => $totalTablas,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL;
} catch (Throwable $error) {
    fwrite(STDERR, 'Fallo la importacion: ' . $error->getMessage() . PHP_EOL);
    exit(1);
}
