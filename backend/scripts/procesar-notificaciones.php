<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/notificaciones_service.php';

$db = asistigo_db();

function reservar_envio(PDO $db, string $clave): bool
{
    try {
        $stmt = $db->prepare('INSERT INTO notificacion_envios (clave) VALUES (:clave)');
        $stmt->execute([':clave' => $clave]);
        return true;
    } catch (PDOException $error) {
        if ($error->getCode() === '23000') {
            return false;
        }
        throw $error;
    }
}

$recordatorios = $db->query(
    'SELECT r.id, r.cliente_id, r.vehiculo_id, r.titulo, r.descripcion,
            r.fecha_objetivo, r.kilometraje_objetivo, v.kilometraje_actual
     FROM recordatorios_mantenimiento r
     INNER JOIN vehiculos v ON v.id = r.vehiculo_id AND v.activo = 1
     LEFT JOIN cliente_preferencias cp ON cp.cliente_id = r.cliente_id
     WHERE r.estado = "pendiente"
       AND COALESCE(cp.recordatorios_mantenimiento, 1) = 1
       AND (
         (r.fecha_objetivo IS NOT NULL AND r.fecha_objetivo <= DATE_ADD(CURDATE(), INTERVAL 7 DAY))
         OR (r.kilometraje_objetivo IS NOT NULL AND v.kilometraje_actual >= r.kilometraje_objetivo)
       )'
)->fetchAll();

foreach ($recordatorios as $recordatorio) {
    if (!reservar_envio($db, 'mantenimiento:' . $recordatorio['id'])) {
        continue;
    }
    notificar_cliente(
        $db,
        (int) $recordatorio['cliente_id'],
        null,
        'mantenimiento',
        $recordatorio['titulo'],
        $recordatorio['descripcion'] ?: 'Tu vehiculo tiene un mantenimiento proximo.',
        'vehiculos',
        (int) $recordatorio['vehiculo_id']
    );
    $stmt = $db->prepare('UPDATE recordatorios_mantenimiento SET estado = "notificado" WHERE id = :id');
    $stmt->execute([':id' => $recordatorio['id']]);
}

$turnos = $db->query(
    'SELECT t.id, t.cliente_id, t.taller_id, t.fecha, t.hora, t.servicio_descripcion, ta.nombre_comercial
     FROM turnos t
     INNER JOIN talleres ta ON ta.id = t.taller_id
     WHERE t.estado = "confirmado"
       AND TIMESTAMP(t.fecha, t.hora) BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR)'
)->fetchAll();

foreach ($turnos as $turno) {
    if (!reservar_envio($db, 'turno-24h:' . $turno['id'])) {
        continue;
    }
    notificar_cliente(
        $db,
        (int) $turno['cliente_id'],
        (int) $turno['taller_id'],
        'turno',
        'Recordatorio de turno',
        'Tienes un turno con ' . $turno['nombre_comercial'] . ' el ' . $turno['fecha'] . ' a las ' . substr($turno['hora'], 0, 5) . '.',
        'turnos',
        (int) $turno['id']
    );
}

$presupuestos = $db->query(
    'SELECT id, cliente_id, taller_id, titulo, valido_hasta
     FROM presupuestos
     WHERE estado = "pendiente"
       AND valido_hasta BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 2 DAY)'
)->fetchAll();

foreach ($presupuestos as $presupuesto) {
    if (!reservar_envio($db, 'presupuesto-vence:' . $presupuesto['id'])) {
        continue;
    }
    notificar_cliente(
        $db,
        (int) $presupuesto['cliente_id'],
        (int) $presupuesto['taller_id'],
        'presupuesto',
        'Presupuesto por vencer',
        'El presupuesto "' . $presupuesto['titulo'] . '" vence el ' . $presupuesto['valido_hasta'] . '.',
        'presupuestos',
        (int) $presupuesto['id']
    );
}

echo json_encode([
    'ok' => true,
    'recordatorios' => count($recordatorios),
    'turnos' => count($turnos),
    'presupuestos' => count($presupuestos),
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL;
