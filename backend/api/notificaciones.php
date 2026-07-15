<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/http.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PATCH' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder_json(['ok' => false, 'error' => 'Metodo no permitido'], 405);
}

$db = asistigo_db();
$data = leer_json();
$clienteId = (int) ($data['cliente_id'] ?? 0);
$id = (int) ($data['id'] ?? 0);

if ($clienteId <= 0) {
    responder_json(['ok' => false, 'error' => 'cliente_id requerido'], 422);
}

if ($id > 0) {
    $stmt = $db->prepare('UPDATE notificaciones SET leido_at = NOW() WHERE id = :id AND cliente_id = :cliente_id');
    $stmt->execute([':id' => $id, ':cliente_id' => $clienteId]);
} else {
    $stmt = $db->prepare('UPDATE notificaciones SET leido_at = NOW() WHERE cliente_id = :cliente_id AND leido_at IS NULL');
    $stmt->execute([':cliente_id' => $clienteId]);
}

responder_json(['ok' => true, 'message' => 'Notificaciones actualizadas']);
