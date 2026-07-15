<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/http.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/notificaciones_service.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PATCH' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder_json(['ok' => false, 'error' => 'Metodo no permitido'], 405);
}

$db = asistigo_db();
$data = leer_json();
$id = (int) ($data['id'] ?? 0);
$clienteId = (int) ($data['cliente_id'] ?? 0);
$estado = limpiar_texto($data['estado'] ?? '');

if ($id <= 0 || !in_array($estado, ['aceptado', 'rechazado', 'pendiente', 'cancelado'], true)) {
    responder_json(['ok' => false, 'error' => 'Datos invalidos'], 422);
}

$sql = 'UPDATE presupuestos SET estado = :estado WHERE id = :id';
$params = [':estado' => $estado, ':id' => $id];

if ($clienteId > 0) {
    $sql .= ' AND cliente_id = :cliente_id';
    $params[':cliente_id'] = $clienteId;
}

$stmt = $db->prepare($sql);
$stmt->execute($params);

if ($stmt->rowCount() === 0) {
    responder_json(['ok' => false, 'error' => 'Presupuesto no encontrado'], 404);
}

$stmt = $db->prepare(
    'SELECT p.taller_id, p.cliente_id, p.titulo, c.nombre, c.apellido
     FROM presupuestos p
     INNER JOIN clientes c ON c.id = p.cliente_id
     WHERE p.id = :id
     LIMIT 1'
);
$stmt->execute([':id' => $id]);
$presupuesto = $stmt->fetch();

if ($presupuesto) {
    notificar_taller(
        $db,
        (int) $presupuesto['taller_id'],
        'presupuesto',
        $estado === 'aceptado' ? 'Presupuesto aceptado' : 'Presupuesto actualizado',
        trim($presupuesto['nombre'] . ' ' . $presupuesto['apellido']) . ' marco "' . $presupuesto['titulo'] . '" como ' . $estado . '.',
        'presupuestos',
        $id
    );
}

responder_json(['ok' => true, 'message' => 'Presupuesto actualizado']);
