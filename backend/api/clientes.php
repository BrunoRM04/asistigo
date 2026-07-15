<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/http.php';
require_once __DIR__ . '/../config/database.php';

try {
    $db = asistigo_db();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $db->query(
            'SELECT id, nombre, apellido, email, telefono, pais, ciudad, estado, creado_at
             FROM clientes
             ORDER BY id DESC
             LIMIT 50'
        );

        responder_json([
            'ok' => true,
            'data' => $stmt->fetchAll(),
        ]);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = leer_json();

        $requeridos = ['nombre', 'apellido', 'email', 'password'];
        foreach ($requeridos as $campo) {
            if (empty($data[$campo])) {
                responder_json([
                    'ok' => false,
                    'error' => "Falta el campo {$campo}",
                ], 422);
            }
        }

        $stmt = $db->prepare(
            'INSERT INTO clientes
                (nombre, apellido, email, telefono, pais, ciudad, password_hash, estado)
             VALUES
                (:nombre, :apellido, :email, :telefono, :pais, :ciudad, :password_hash, :estado)'
        );

        $stmt->execute([
            ':nombre' => trim((string) $data['nombre']),
            ':apellido' => trim((string) $data['apellido']),
            ':email' => trim((string) $data['email']),
            ':telefono' => $data['telefono'] ?? null,
            ':pais' => $data['pais'] ?? 'Uruguay',
            ':ciudad' => $data['ciudad'] ?? null,
            ':password_hash' => password_hash((string) $data['password'], PASSWORD_DEFAULT),
            ':estado' => 'activo',
        ]);

        responder_json([
            'ok' => true,
            'message' => 'Cliente creado',
            'id' => (int) $db->lastInsertId(),
        ], 201);
    }

    responder_json([
        'ok' => false,
        'error' => 'Metodo no permitido',
    ], 405);
} catch (PDOException $error) {
    $codigo = $error->getCode() === '23000' ? 409 : 500;

    responder_json([
        'ok' => false,
        'error' => 'Error de base de datos',
        'detail' => $error->getMessage(),
    ], $codigo);
} catch (Throwable $error) {
    responder_json([
        'ok' => false,
        'error' => 'Error inesperado',
        'detail' => $error->getMessage(),
    ], 500);
}
