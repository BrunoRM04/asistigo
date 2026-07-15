<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/http.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/notificaciones_service.php';

$db = asistigo_db();

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = leer_json();
        $clienteId = (int) ($data['cliente_id'] ?? 0);
        $vehiculoId = (int) ($data['vehiculo_id'] ?? 0);
        $tallerId = (int) ($data['taller_id'] ?? 0);
        $servicioId = (int) ($data['taller_servicio_id'] ?? 0);
        $fecha = campo_requerido($data, 'fecha');
        $hora = campo_requerido($data, 'hora');

        if ($clienteId <= 0 || $vehiculoId <= 0 || $tallerId <= 0) {
            responder_json(['ok' => false, 'error' => 'cliente_id, vehiculo_id y taller_id requeridos'], 422);
        }

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha) || strtotime($fecha) === false) {
            responder_json(['ok' => false, 'error' => 'Fecha invalida'], 422);
        }

        if (strtotime($fecha . ' ' . $hora) < strtotime(date('Y-m-d 00:00:00'))) {
            responder_json(['ok' => false, 'error' => 'No se puede reservar una fecha pasada'], 422);
        }

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

        $servicioDescripcion = limpiar_texto($data['servicio_descripcion'] ?? '');
        if ($servicioId > 0) {
            $stmt = $db->prepare('SELECT id, nombre FROM taller_servicios WHERE id = :id AND taller_id = :taller_id AND activo = 1');
            $stmt->execute([':id' => $servicioId, ':taller_id' => $tallerId]);
            $servicio = $stmt->fetch();
            if (!$servicio) {
                responder_json(['ok' => false, 'error' => 'Servicio no disponible para ese taller'], 404);
            }
            $servicioDescripcion = $servicio['nombre'];
        }

        if ($servicioDescripcion === '') {
            $servicioDescripcion = 'Servicio mecanico';
        }

        $db->beginTransaction();

        $stmt = $db->prepare(
            'INSERT INTO solicitudes (cliente_id, vehiculo_id, taller_id, tipo, asunto, mensaje, estado)
             VALUES (:cliente_id, :vehiculo_id, :taller_id, "turno", :asunto, :mensaje, "nueva")'
        );
        $stmt->execute([
            ':cliente_id' => $clienteId,
            ':vehiculo_id' => $vehiculoId,
            ':taller_id' => $tallerId,
            ':asunto' => 'Reserva de turno',
            ':mensaje' => limpiar_texto($data['notas_cliente'] ?? '') ?: 'El cliente solicito una reserva de turno.',
        ]);
        $solicitudId = (int) $db->lastInsertId();

        $stmt = $db->prepare(
            'INSERT INTO turnos
                (solicitud_id, cliente_id, vehiculo_id, taller_id, taller_servicio_id, fecha, hora, servicio_descripcion, notas_cliente, estado)
             VALUES
                (:solicitud_id, :cliente_id, :vehiculo_id, :taller_id, :servicio_id, :fecha, :hora, :servicio_descripcion, :notas_cliente, "pendiente")'
        );
        $stmt->execute([
            ':solicitud_id' => $solicitudId,
            ':cliente_id' => $clienteId,
            ':vehiculo_id' => $vehiculoId,
            ':taller_id' => $tallerId,
            ':servicio_id' => $servicioId > 0 ? $servicioId : null,
            ':fecha' => $fecha,
            ':hora' => $hora,
            ':servicio_descripcion' => $servicioDescripcion,
            ':notas_cliente' => limpiar_texto($data['notas_cliente'] ?? '') ?: null,
        ]);
        $turnoId = (int) $db->lastInsertId();

        notificar_taller($db, $tallerId, 'turno', 'Nueva solicitud de turno', 'Un cliente solicito un turno para ' . $servicioDescripcion . '.', 'solicitudes', $solicitudId);

        $stmt = $db->prepare(
            'INSERT INTO notificaciones (cliente_id, taller_id, tipo, titulo, mensaje, url_accion)
             VALUES (:cliente_id, :taller_id, "turno", "Turno solicitado", :mensaje, "turnos")'
        );
        $stmt->execute([
            ':cliente_id' => $clienteId,
            ':taller_id' => $tallerId,
            ':mensaje' => 'Tu solicitud con ' . $taller['nombre_comercial'] . ' quedo registrada.',
        ]);

        $mensajeChat = limpiar_texto($data['notas_cliente'] ?? '') ?: 'Solicitud de turno: ' . $servicioDescripcion;
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
                 VALUES (:cliente_id, :taller_id, :vehiculo_id, "taller", "Solicitud de turno", NOW())'
            );
            $stmt->execute([
                ':cliente_id' => $clienteId,
                ':taller_id' => $tallerId,
                ':vehiculo_id' => $vehiculoId,
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
            ':contenido' => $mensajeChat,
        ]);

        $stmt = $db->prepare('UPDATE conversaciones SET ultimo_mensaje_at = NOW() WHERE id = :id');
        $stmt->execute([':id' => $conversacionId]);

        $db->commit();

        responder_json(['ok' => true, 'message' => 'Turno reservado', 'id' => $turnoId], 201);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
        $data = leer_json();
        $id = (int) ($data['id'] ?? 0);
        $clienteId = (int) ($data['cliente_id'] ?? 0);
        $estado = limpiar_texto($data['estado'] ?? 'cancelado');

        if ($id <= 0 || $clienteId <= 0 || !in_array($estado, ['cancelado'], true)) {
            responder_json(['ok' => false, 'error' => 'Datos invalidos'], 422);
        }

        $stmt = $db->prepare(
            'UPDATE turnos
             SET estado = :estado
             WHERE id = :id AND cliente_id = :cliente_id AND estado IN ("pendiente", "confirmado")'
        );
        $stmt->execute([':estado' => $estado, ':id' => $id, ':cliente_id' => $clienteId]);

        if ($stmt->rowCount() === 0) {
            responder_json(['ok' => false, 'error' => 'Turno no encontrado o no cancelable'], 404);
        }

        $stmt = $db->prepare(
            'INSERT INTO notificaciones (cliente_id, tipo, titulo, mensaje, url_accion)
             VALUES (:cliente_id, "turno", "Turno cancelado", "Cancelaste una reserva correctamente.", "turnos")'
        );
        $stmt->execute([':cliente_id' => $clienteId]);

        $consulta = $db->prepare('SELECT taller_id FROM turnos WHERE id = :id LIMIT 1');
        $consulta->execute([':id' => $id]);
        $turno = $consulta->fetch();
        if ($turno) {
            notificar_taller($db, (int) $turno['taller_id'], 'turno', 'Turno cancelado', 'Un cliente cancelo un turno.', 'agenda', $id);
        }

        responder_json(['ok' => true, 'message' => 'Turno cancelado']);
    }

    responder_json(['ok' => false, 'error' => 'Metodo no permitido'], 405);
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
