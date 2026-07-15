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
$turnoId = (int) ($data['turno_id'] ?? 0);
$puntuacion = (int) ($data['puntuacion'] ?? 0);
$comentario = limpiar_texto($data['comentario'] ?? '');

if ($clienteId <= 0 || $turnoId <= 0 || $puntuacion < 1 || $puntuacion > 5) {
    responder_json(['ok' => false, 'error' => 'Datos invalidos'], 422);
}

try {
    $stmt = $db->prepare(
        'SELECT id, taller_id
         FROM turnos
         WHERE id = :id AND cliente_id = :cliente_id AND estado = "completado"
         LIMIT 1'
    );
    $stmt->execute([':id' => $turnoId, ':cliente_id' => $clienteId]);
    $turno = $stmt->fetch();

    if (!$turno) {
        responder_json(['ok' => false, 'error' => 'Solo se pueden calificar turnos completados'], 422);
    }

    $db->beginTransaction();

    $stmt = $db->prepare(
        'INSERT INTO resenas (cliente_id, taller_id, turno_id, puntuacion, comentario, estado)
         VALUES (:cliente_id, :taller_id, :turno_id, :puntuacion, :comentario, "publicada")
         ON DUPLICATE KEY UPDATE
             puntuacion = VALUES(puntuacion),
             comentario = VALUES(comentario),
             estado = "publicada"'
    );
    $stmt->execute([
        ':cliente_id' => $clienteId,
        ':taller_id' => (int) $turno['taller_id'],
        ':turno_id' => $turnoId,
        ':puntuacion' => $puntuacion,
        ':comentario' => $comentario ?: null,
    ]);

    $stmt = $db->prepare(
        'UPDATE talleres t
         SET rating_promedio = (
             SELECT COALESCE(ROUND(AVG(r.puntuacion), 2), 0)
             FROM resenas r
             WHERE r.taller_id = t.id AND r.estado = "publicada"
         ),
         total_calificaciones = (
             SELECT COUNT(*)
             FROM resenas r
             WHERE r.taller_id = t.id AND r.estado = "publicada"
         )
         WHERE t.id = :taller_id'
    );
    $stmt->execute([':taller_id' => (int) $turno['taller_id']]);

    $stmt = $db->prepare(
        'INSERT INTO notificaciones (cliente_id, taller_id, tipo, titulo, mensaje, url_accion)
         VALUES (:cliente_id, :taller_id, "resena", "Gracias por calificar", "Tu reseña quedo publicada.", "turnos")'
    );
    $stmt->execute([':cliente_id' => $clienteId, ':taller_id' => (int) $turno['taller_id']]);

    notificar_taller($db, (int) $turno['taller_id'], 'resena', 'Nueva calificacion', 'Un cliente publico una calificacion de ' . $puntuacion . ' estrellas.', 'inicio', $turnoId);

    $db->commit();

    responder_json(['ok' => true, 'message' => 'Reseña guardada']);
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
