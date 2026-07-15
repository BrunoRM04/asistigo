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
$accion = limpiar_texto($data['accion'] ?? 'enviar_cliente');

try {
    if ($accion === 'enviar_cliente') {
        $clienteId = (int) ($data['cliente_id'] ?? 0);
        $conversacionId = (int) ($data['conversacion_id'] ?? 0);
        $tallerId = (int) ($data['taller_id'] ?? 0);
        $vehiculoId = (int) ($data['vehiculo_id'] ?? 0);
        $contenido = campo_requerido($data, 'contenido');

        if ($clienteId <= 0) {
            responder_json(['ok' => false, 'error' => 'cliente_id requerido'], 422);
        }

        $db->beginTransaction();

        if ($conversacionId > 0) {
            $stmt = $db->prepare(
                'SELECT id, taller_id, vehiculo_id
                 FROM conversaciones
                 WHERE id = :id AND cliente_id = :cliente_id AND tipo = "taller"
                 LIMIT 1'
            );
            $stmt->execute([':id' => $conversacionId, ':cliente_id' => $clienteId]);
            $conversacion = $stmt->fetch();
            if (!$conversacion) {
                responder_json(['ok' => false, 'error' => 'Conversacion no encontrada'], 404);
            }
            $tallerId = (int) ($conversacion['taller_id'] ?? 0);
            $vehiculoId = (int) ($conversacion['vehiculo_id'] ?? 0);
        } else {
            if ($tallerId <= 0) {
                responder_json(['ok' => false, 'error' => 'taller_id requerido'], 422);
            }

            $stmt = $db->prepare(
                'SELECT id
                 FROM conversaciones
                 WHERE cliente_id = :cliente_id
                   AND taller_id = :taller_id
                   AND (:vehiculo_id_filtro IS NULL OR vehiculo_id = :vehiculo_id_match)
                   AND tipo = "taller"
                   AND estado = "abierta"
                 ORDER BY id DESC
                 LIMIT 1'
            );
            $stmt->execute([
                ':cliente_id' => $clienteId,
                ':taller_id' => $tallerId,
                ':vehiculo_id_filtro' => $vehiculoId > 0 ? $vehiculoId : null,
                ':vehiculo_id_match' => $vehiculoId > 0 ? $vehiculoId : null,
            ]);
            $existente = $stmt->fetch();

            if ($existente) {
                $conversacionId = (int) $existente['id'];
            } else {
                $stmt = $db->prepare(
                    'INSERT INTO conversaciones (cliente_id, taller_id, vehiculo_id, tipo, asunto, ultimo_mensaje_at)
                     VALUES (:cliente_id, :taller_id, :vehiculo_id, "taller", "Chat con taller", NOW())'
                );
                $stmt->execute([
                    ':cliente_id' => $clienteId,
                    ':taller_id' => $tallerId,
                    ':vehiculo_id' => $vehiculoId > 0 ? $vehiculoId : null,
                ]);
                $conversacionId = (int) $db->lastInsertId();
            }
        }

        $stmt = $db->prepare(
            'INSERT INTO mensajes (conversacion_id, emisor_tipo, cliente_id, contenido)
             VALUES (:conversacion_id, "cliente", :cliente_id, :contenido)'
        );
        $stmt->execute([
            ':conversacion_id' => $conversacionId,
            ':cliente_id' => $clienteId,
            ':contenido' => $contenido,
        ]);

        $stmt = $db->prepare('UPDATE conversaciones SET ultimo_mensaje_at = NOW() WHERE id = :id');
        $stmt->execute([':id' => $conversacionId]);

        if ($tallerId > 0) {
            notificar_taller($db, $tallerId, 'chat', 'Nuevo mensaje', 'Un cliente te envio un mensaje.', 'chat', $conversacionId);
        }

        $db->commit();

        responder_json(['ok' => true, 'message' => 'Mensaje enviado', 'conversacion_id' => $conversacionId]);
    }

    responder_json(['ok' => false, 'error' => 'Accion no reconocida'], 400);
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
