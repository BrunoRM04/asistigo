<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/firebase.php';

$clienteId = isset($argv[1]) ? (int) $argv[1] : 0;
if ($clienteId <= 0) {
    fwrite(STDERR, "Uso: php test-push.php CLIENTE_ID\n");
    exit(1);
}

$resultados = enviar_push_cliente(
    $clienteId,
    'Prueba AsistiGo',
    'Las notificaciones push ya estan conectadas.',
    ['tipo' => 'notificaciones', 'ruta' => 'notificaciones', 'prueba' => '1']
);

echo json_encode($resultados, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL;
