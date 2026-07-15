<?php

declare(strict_types=1);

require_once __DIR__ . '/firebase.php';

function notificacion_data(string $tipo, string $ruta, int $referenciaId = 0, int $notificacionId = 0): array
{
    return [
        'tipo' => $tipo,
        'ruta' => $ruta,
        'referencia_id' => $referenciaId > 0 ? (string) $referenciaId : '',
        'notificacion_id' => $notificacionId > 0 ? (string) $notificacionId : '',
    ];
}

function notificar_cliente(
    PDO $db,
    int $clienteId,
    ?int $tallerId,
    string $tipo,
    string $titulo,
    string $mensaje,
    string $ruta,
    int $referenciaId = 0
): int {
    $stmt = $db->prepare(
        'INSERT INTO notificaciones (cliente_id, taller_id, tipo, titulo, mensaje, url_accion)
         VALUES (:cliente_id, :taller_id, :tipo, :titulo, :mensaje, :ruta)'
    );
    $stmt->execute([
        ':cliente_id' => $clienteId,
        ':taller_id' => $tallerId,
        ':tipo' => $tipo,
        ':titulo' => $titulo,
        ':mensaje' => $mensaje,
        ':ruta' => $ruta,
    ]);
    $notificacionId = (int) $db->lastInsertId();

    try {
        $preferencia = $db->prepare('SELECT notificaciones_push FROM cliente_preferencias WHERE cliente_id = :cliente_id LIMIT 1');
        $preferencia->execute([':cliente_id' => $clienteId]);
        $fila = $preferencia->fetch();
        if (!$fila || (bool) $fila['notificaciones_push']) {
            enviar_push_cliente($clienteId, $titulo, $mensaje, notificacion_data($tipo, $ruta, $referenciaId, $notificacionId));
        }
    } catch (Throwable $error) {
        error_log('Push cliente no enviado: ' . $error->getMessage());
    }

    return $notificacionId;
}

function notificar_taller(
    PDO $db,
    int $tallerId,
    string $tipo,
    string $titulo,
    string $mensaje,
    string $ruta,
    int $referenciaId = 0
): int {
    $stmt = $db->prepare(
        'INSERT INTO notificaciones (taller_id, tipo, titulo, mensaje, url_accion)
         VALUES (:taller_id, :tipo, :titulo, :mensaje, :ruta)'
    );
    $stmt->execute([
        ':taller_id' => $tallerId,
        ':tipo' => $tipo,
        ':titulo' => $titulo,
        ':mensaje' => $mensaje,
        ':ruta' => $ruta,
    ]);
    $notificacionId = (int) $db->lastInsertId();

    try {
        enviar_push_taller($tallerId, $titulo, $mensaje, notificacion_data($tipo, $ruta, $referenciaId, $notificacionId));
    } catch (Throwable $error) {
        error_log('Push taller no enviado: ' . $error->getMessage());
    }

    return $notificacionId;
}
