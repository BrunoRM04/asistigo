<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/http.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'PATCH') {
    responder_json(['ok' => false, 'error' => 'Metodo no permitido'], 405);
}

$db = asistigo_db();
$data = leer_json();
$clienteId = (int) ($data['cliente_id'] ?? 0);

if ($clienteId <= 0) {
    responder_json(['ok' => false, 'error' => 'cliente_id requerido'], 422);
}

try {
    $db->beginTransaction();

    $nombre = campo_requerido($data, 'nombre');
    $apellido = campo_requerido($data, 'apellido');

    $stmt = $db->prepare(
        'UPDATE clientes
         SET nombre = :nombre,
             apellido = :apellido,
             telefono = :telefono,
             pais = :pais,
             ciudad = :ciudad
         WHERE id = :id'
    );
    $stmt->execute([
        ':id' => $clienteId,
        ':nombre' => $nombre,
        ':apellido' => $apellido,
        ':telefono' => limpiar_texto($data['telefono'] ?? '') ?: null,
        ':pais' => limpiar_texto($data['pais'] ?? '') ?: 'Uruguay',
        ':ciudad' => limpiar_texto($data['ciudad'] ?? '') ?: null,
    ]);

    $preferencias = is_array($data['preferencias'] ?? null) ? $data['preferencias'] : [];
    $preferenciasParams = [
        ':cliente_id' => $clienteId,
        ':notificaciones_email' => !empty($preferencias['notificaciones_email']) ? 1 : 0,
        ':notificaciones_push' => !empty($preferencias['notificaciones_push']) ? 1 : 0,
        ':recordatorios_mantenimiento' => !empty($preferencias['recordatorios_mantenimiento']) ? 1 : 0,
        ':idioma' => limpiar_texto($preferencias['idioma'] ?? '') ?: 'es',
        ':moneda' => limpiar_texto($preferencias['moneda'] ?? '') ?: 'UYU',
    ];

    $stmt = $db->prepare('SELECT id FROM cliente_preferencias WHERE cliente_id = :cliente_id LIMIT 1');
    $stmt->execute([':cliente_id' => $clienteId]);

    if ($stmt->fetch()) {
        $stmt = $db->prepare(
            'UPDATE cliente_preferencias
             SET notificaciones_email = :notificaciones_email,
                 notificaciones_push = :notificaciones_push,
                 recordatorios_mantenimiento = :recordatorios_mantenimiento,
                 idioma = :idioma,
                 moneda = :moneda
             WHERE cliente_id = :cliente_id'
        );
        $stmt->execute($preferenciasParams);
    } else {
        $stmt = $db->prepare(
            'INSERT INTO cliente_preferencias
                (cliente_id, notificaciones_email, notificaciones_push, recordatorios_mantenimiento, idioma, moneda)
             VALUES
                (:cliente_id, :notificaciones_email, :notificaciones_push, :recordatorios_mantenimiento, :idioma, :moneda)'
        );
        $stmt->execute($preferenciasParams);
    }

    $direccion = is_array($data['direccion_principal'] ?? null) ? $data['direccion_principal'] : [];
    $direccionTexto = limpiar_texto($direccion['direccion'] ?? '');
    if ($direccionTexto !== '') {
        $db->prepare('UPDATE cliente_direcciones SET principal = 0 WHERE cliente_id = :cliente_id')
            ->execute([':cliente_id' => $clienteId]);

        $stmt = $db->prepare(
            'INSERT INTO cliente_direcciones
                (cliente_id, alias, direccion, ciudad, pais, latitud, longitud, principal)
             VALUES
                (:cliente_id, :alias, :direccion, :ciudad, :pais, :latitud, :longitud, 1)'
        );
        $stmt->execute([
            ':cliente_id' => $clienteId,
            ':alias' => limpiar_texto($direccion['alias'] ?? '') ?: 'Principal',
            ':direccion' => $direccionTexto,
            ':ciudad' => limpiar_texto($direccion['ciudad'] ?? '') ?: limpiar_texto($data['ciudad'] ?? '') ?: null,
            ':pais' => limpiar_texto($direccion['pais'] ?? '') ?: limpiar_texto($data['pais'] ?? '') ?: 'Uruguay',
            ':latitud' => limpiar_texto($direccion['latitud'] ?? '') ?: null,
            ':longitud' => limpiar_texto($direccion['longitud'] ?? '') ?: null,
        ]);
    }

    $db->commit();

    responder_json(['ok' => true, 'message' => 'Perfil actualizado']);
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
