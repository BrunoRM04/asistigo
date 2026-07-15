<?php

declare(strict_types=1);

date_default_timezone_set('America/Montevideo');

header('Content-Type: application/json; charset=utf-8');
$origen = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
$origenesConfigurados = trim((string) getenv('ASISTIGO_ALLOWED_ORIGINS'));
$origenesPermitidos = $origenesConfigurados === ''
    ? ['*']
    : array_values(array_filter(array_map('trim', explode(',', $origenesConfigurados))));

if (in_array('*', $origenesPermitidos, true)) {
    header('Access-Control-Allow-Origin: *');
} elseif ($origen !== '' && in_array($origen, $origenesPermitidos, true)) {
    header('Access-Control-Allow-Origin: ' . $origen);
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function responder_json(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function leer_json(): array
{
    $raw = file_get_contents('php://input');

    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $data = json_decode($raw, true);

    if (!is_array($data)) {
        responder_json([
            'ok' => false,
            'error' => 'JSON invalido',
        ], 400);
    }

    return $data;
}
