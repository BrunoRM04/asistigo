<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/http.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder_json(['ok' => false, 'error' => 'Metodo no permitido'], 405);
}

$db = asistigo_db();
$data = leer_json();
$accion = limpiar_texto($data['accion'] ?? 'registrar');
$tipo = limpiar_texto($data['titular_tipo'] ?? '');
$titularId = (int) ($data['titular_id'] ?? 0);
$token = limpiar_texto($data['token'] ?? '');
$plataforma = limpiar_texto($data['plataforma'] ?? 'android');

if (!in_array($tipo, ['cliente', 'mecanico'], true) || $titularId <= 0 || $token === '') {
    responder_json(['ok' => false, 'error' => 'Datos de dispositivo invalidos'], 422);
}

if (!in_array($plataforma, ['android', 'ios', 'web'], true)) {
    $plataforma = 'android';
}

$columna = $tipo === 'cliente' ? 'cliente_id' : 'mecanico_id';
$tabla = $tipo === 'cliente' ? 'clientes' : 'mecanicos';
$existe = $db->prepare("SELECT id FROM {$tabla} WHERE id = :id LIMIT 1");
$existe->execute([':id' => $titularId]);

if (!$existe->fetch()) {
    responder_json(['ok' => false, 'error' => 'La cuenta indicada no existe'], 404);
}

if ($accion === 'desactivar') {
    $stmt = $db->prepare("UPDATE push_tokens SET activo = 0 WHERE token = :token AND {$columna} = :titular_id");
    $stmt->execute([':token' => $token, ':titular_id' => $titularId]);
    responder_json(['ok' => true, 'message' => 'Dispositivo desactivado']);
}

$clienteId = $tipo === 'cliente' ? $titularId : null;
$mecanicoId = $tipo === 'mecanico' ? $titularId : null;
$stmt = $db->prepare(
    'INSERT INTO push_tokens (cliente_id, mecanico_id, token, plataforma, activo)
     VALUES (:cliente_id, :mecanico_id, :token, :plataforma, 1)
     ON DUPLICATE KEY UPDATE
       cliente_id = VALUES(cliente_id), mecanico_id = VALUES(mecanico_id),
       plataforma = VALUES(plataforma), activo = 1, actualizado_at = CURRENT_TIMESTAMP'
);
$stmt->execute([
    ':cliente_id' => $clienteId,
    ':mecanico_id' => $mecanicoId,
    ':token' => $token,
    ':plataforma' => $plataforma,
]);

responder_json(['ok' => true, 'message' => 'Dispositivo registrado']);
