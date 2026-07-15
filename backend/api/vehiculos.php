<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/http.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/helpers.php';

$db = asistigo_db();

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = leer_json();
        $clienteId = (int) ($data['cliente_id'] ?? 0);

        if ($clienteId <= 0) {
            responder_json(['ok' => false, 'error' => 'cliente_id requerido'], 422);
        }

        $tipo = limpiar_texto($data['tipo'] ?? 'auto');
        if (!in_array($tipo, ['auto', 'moto', 'utilitario', 'otro'], true)) {
            $tipo = 'auto';
        }

        $km = (int) ($data['km'] ?? 0);
        $db->beginTransaction();

        $stmt = $db->prepare(
            'INSERT INTO vehiculos
                (cliente_id, tipo, marca, modelo, anio, patente, kilometraje_actual, salud_porcentaje, proximo_servicio, proximo_kilometraje, notas)
             VALUES
                (:cliente_id, :tipo, :marca, :modelo, :anio, :patente, :km, 100, :proximo_servicio, :proximo_km, :notas)'
        );
        $stmt->execute([
            ':cliente_id' => $clienteId,
            ':tipo' => $tipo,
            ':marca' => campo_requerido($data, 'marca'),
            ':modelo' => campo_requerido($data, 'modelo'),
            ':anio' => (int) ($data['anio'] ?? date('Y')),
            ':patente' => limpiar_texto($data['patente'] ?? '') ?: null,
            ':km' => $km,
            ':proximo_servicio' => $tipo === 'moto' ? 'Primer control preventivo de moto' : 'Primer control preventivo',
            ':proximo_km' => $km + 5000,
            ':notas' => json_encode([
                'combustible' => $data['combustible'] ?? null,
                'version' => $data['version'] ?? null,
                'motor' => $data['motor'] ?? null,
                'color' => $data['color'] ?? null,
                'numero_matricula' => $data['numero_matricula'] ?? null,
            ], JSON_UNESCAPED_UNICODE),
        ]);
        $vehiculoId = (int) $db->lastInsertId();

        $stmt = $db->prepare(
            'INSERT INTO recordatorios_mantenimiento
                (cliente_id, vehiculo_id, titulo, descripcion, kilometraje_objetivo, estado)
             VALUES
                (:cliente_id, :vehiculo_id, :titulo, :descripcion, :km_objetivo, "pendiente")'
        );
        $stmt->execute([
            ':cliente_id' => $clienteId,
            ':vehiculo_id' => $vehiculoId,
            ':titulo' => 'Primer control preventivo',
            ':descripcion' => 'Revisar fluidos, frenos y estado general.',
            ':km_objetivo' => $km + 5000,
        ]);

        $stmt = $db->prepare(
            'INSERT INTO notificaciones (cliente_id, tipo, titulo, mensaje, url_accion)
             VALUES (:cliente_id, "vehiculo", "Vehiculo agregado", :mensaje, "vehiculos")'
        );
        $stmt->execute([
            ':cliente_id' => $clienteId,
            ':mensaje' => 'Agregaste ' . campo_requerido($data, 'marca') . ' ' . campo_requerido($data, 'modelo') . ' a tu cuenta.',
        ]);

        $db->commit();

        responder_json([
            'ok' => true,
            'message' => 'Vehiculo creado',
            'id' => $vehiculoId,
        ], 201);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'PUT' || $_SERVER['REQUEST_METHOD'] === 'PATCH') {
        $data = leer_json();
        $id = (int) ($data['id'] ?? 0);
        $clienteId = (int) ($data['cliente_id'] ?? 0);

        if ($id <= 0 || $clienteId <= 0) {
            responder_json(['ok' => false, 'error' => 'id y cliente_id requeridos'], 422);
        }

        $tipo = limpiar_texto($data['tipo'] ?? 'auto');
        if (!in_array($tipo, ['auto', 'moto', 'utilitario', 'otro'], true)) {
            $tipo = 'auto';
        }

        $km = max(0, (int) ($data['km'] ?? 0));
        $stmt = $db->prepare(
            'UPDATE vehiculos
             SET tipo = :tipo,
                 marca = :marca,
                 modelo = :modelo,
                 anio = :anio,
                 patente = :patente,
                 kilometraje_actual = :km,
                 proximo_servicio = :proximo_servicio,
                 proximo_kilometraje = :proximo_km,
                 notas = :notas
             WHERE id = :id AND cliente_id = :cliente_id'
        );
        $stmt->execute([
            ':id' => $id,
            ':cliente_id' => $clienteId,
            ':tipo' => $tipo,
            ':marca' => campo_requerido($data, 'marca'),
            ':modelo' => campo_requerido($data, 'modelo'),
            ':anio' => (int) ($data['anio'] ?? date('Y')),
            ':patente' => limpiar_texto($data['patente'] ?? '') ?: null,
            ':km' => $km,
            ':proximo_servicio' => limpiar_texto($data['proximo_servicio'] ?? '') ?: ($tipo === 'moto' ? 'Control preventivo de moto' : 'Control preventivo'),
            ':proximo_km' => (int) ($data['proximo_km'] ?? ($km + 5000)),
            ':notas' => json_encode([
                'combustible' => $data['combustible'] ?? null,
                'version' => $data['version'] ?? null,
                'motor' => $data['motor'] ?? null,
                'color' => $data['color'] ?? null,
                'numero_matricula' => $data['numero_matricula'] ?? null,
            ], JSON_UNESCAPED_UNICODE),
        ]);

        if ($stmt->rowCount() === 0) {
            responder_json(['ok' => false, 'error' => 'Vehiculo no encontrado'], 404);
        }

        responder_json(['ok' => true, 'message' => 'Vehiculo actualizado']);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $data = leer_json();
        $id = (int) ($data['id'] ?? ($_GET['id'] ?? 0));
        $clienteId = (int) ($data['cliente_id'] ?? ($_GET['cliente_id'] ?? 0));

        if ($id <= 0 || $clienteId <= 0) {
            responder_json(['ok' => false, 'error' => 'id y cliente_id requeridos'], 422);
        }

        $stmt = $db->prepare('UPDATE vehiculos SET activo = 0 WHERE id = :id AND cliente_id = :cliente_id');
        $stmt->execute([':id' => $id, ':cliente_id' => $clienteId]);

        if ($stmt->rowCount() === 0) {
            responder_json(['ok' => false, 'error' => 'Vehiculo no encontrado'], 404);
        }

        responder_json(['ok' => true, 'message' => 'Vehiculo eliminado']);
    }

    responder_json(['ok' => false, 'error' => 'Metodo no permitido'], 405);
} catch (PDOException $error) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }

    responder_json([
        'ok' => false,
        'error' => $error->getCode() === '23000' ? 'La patente ya existe' : 'Error de base de datos',
        'detail' => $error->getMessage(),
    ], $error->getCode() === '23000' ? 409 : 500);
}
