<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/http.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/notificaciones_service.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder_json(['ok' => false, 'error' => 'Metodo no permitido'], 405);
}

$db = asistigo_db();
$data = leer_json();
$clienteId = (int) ($data['cliente_id'] ?? 0);
$vehiculoId = (int) ($data['vehiculo_id'] ?? 0);
$tallerId = (int) ($data['taller_id'] ?? 0);
$tipo = limpiar_texto($data['tipo'] ?? 'presupuesto');

if ($clienteId <= 0 || $vehiculoId <= 0 || $tallerId <= 0 || !in_array($tipo, ['presupuesto', 'diagnostico', 'urgencia'], true)) {
    responder_json(['ok' => false, 'error' => 'Datos invalidos'], 422);
}

try {
    $stmt = $db->prepare('SELECT id FROM vehiculos WHERE id = :id AND cliente_id = :cliente_id AND activo = 1');
    $stmt->execute([':id' => $vehiculoId, ':cliente_id' => $clienteId]);
    if (!$stmt->fetch()) {
        responder_json(['ok' => false, 'error' => 'Vehiculo no encontrado'], 404);
    }

    $stmt = $db->prepare('SELECT id, nombre_comercial FROM talleres WHERE id = :id AND estado = "activo"');
    $stmt->execute([':id' => $tallerId]);
    $taller = $stmt->fetch();
    if (!$taller) {
        responder_json(['ok' => false, 'error' => 'Taller no disponible'], 404);
    }

    $asunto = limpiar_texto($data['asunto'] ?? '') ?: match ($tipo) {
        'diagnostico' => 'Solicitud de diagnostico',
        'urgencia' => 'Solicitud de urgencia',
        default => 'Solicitud de presupuesto',
    };

    $mensaje = campo_requerido($data, 'mensaje');

    $db->beginTransaction();

    $stmt = $db->prepare(
        'INSERT INTO solicitudes (cliente_id, vehiculo_id, taller_id, tipo, asunto, mensaje, estado)
         VALUES (:cliente_id, :vehiculo_id, :taller_id, :tipo, :asunto, :mensaje, "nueva")'
    );
    $stmt->execute([
        ':cliente_id' => $clienteId,
        ':vehiculo_id' => $vehiculoId,
        ':taller_id' => $tallerId,
        ':tipo' => $tipo,
        ':asunto' => $asunto,
        ':mensaje' => $mensaje,
    ]);

    $solicitudId = (int) $db->lastInsertId();

    notificar_taller($db, $tallerId, $tipo, 'Nueva solicitud', 'Un cliente envio una solicitud de ' . $tipo . '.', 'solicitudes', $solicitudId);

    $stmt = $db->prepare(
        'SELECT id
         FROM conversaciones
         WHERE cliente_id = :cliente_id
           AND taller_id = :taller_id
           AND vehiculo_id = :vehiculo_id
           AND tipo = "taller"
           AND estado = "abierta"
         ORDER BY id DESC
         LIMIT 1'
    );
    $stmt->execute([
        ':cliente_id' => $clienteId,
        ':taller_id' => $tallerId,
        ':vehiculo_id' => $vehiculoId,
    ]);
    $conversacion = $stmt->fetch();

    if ($conversacion) {
        $conversacionId = (int) $conversacion['id'];
    } else {
        $stmt = $db->prepare(
            'INSERT INTO conversaciones (cliente_id, taller_id, vehiculo_id, tipo, asunto, ultimo_mensaje_at)
             VALUES (:cliente_id, :taller_id, :vehiculo_id, "taller", :asunto, NOW())'
        );
        $stmt->execute([
            ':cliente_id' => $clienteId,
            ':taller_id' => $tallerId,
            ':vehiculo_id' => $vehiculoId,
            ':asunto' => $asunto,
        ]);
        $conversacionId = (int) $db->lastInsertId();
    }

    $stmt = $db->prepare(
        'INSERT INTO mensajes (conversacion_id, emisor_tipo, cliente_id, contenido)
         VALUES (:conversacion_id, "cliente", :cliente_id, :contenido)'
    );
    $stmt->execute([
        ':conversacion_id' => $conversacionId,
        ':cliente_id' => $clienteId,
        ':contenido' => $mensaje,
    ]);

    $stmt = $db->prepare('UPDATE conversaciones SET ultimo_mensaje_at = NOW() WHERE id = :id');
    $stmt->execute([':id' => $conversacionId]);

    $stmt = $db->prepare(
        'INSERT INTO notificaciones (cliente_id, taller_id, tipo, titulo, mensaje, url_accion)
         VALUES (:cliente_id, :taller_id, :tipo, :titulo, :mensaje, "presupuestos")'
    );
    $stmt->execute([
        ':cliente_id' => $clienteId,
        ':taller_id' => $tallerId,
        ':tipo' => $tipo,
        ':titulo' => 'Solicitud enviada',
        ':mensaje' => 'Tu pedido para ' . $taller['nombre_comercial'] . ' quedo registrado.',
    ]);

    $db->commit();

    responder_json(['ok' => true, 'message' => 'Solicitud enviada', 'id' => $solicitudId], 201);
} catch (PDOException $error) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }

    responder_json([
        'ok' => false,
        'error' => 'Error de base de datos',
        'detail' => $error->getMessage(),
    ], 500);
}
