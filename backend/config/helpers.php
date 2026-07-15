<?php

declare(strict_types=1);

require_once __DIR__ . '/env.php';

function limpiar_texto(mixed $valor): string
{
    return trim((string) ($valor ?? ''));
}

function asistigo_url_publica(string $ruta): string
{
    $baseConfigurada = rtrim(trim(asistigo_env('ASISTIGO_PUBLIC_URL')), '/');
    if ($baseConfigurada !== '') {
        return $baseConfigurada . '/' . ltrim($ruta, '/');
    }

    $railwayDomain = trim(asistigo_env('RAILWAY_PUBLIC_DOMAIN'));
    if ($railwayDomain !== '') {
        return 'https://' . $railwayDomain . '/' . ltrim($ruta, '/');
    }

    $script = str_replace('\\', '/', (string) ($_SERVER['SCRIPT_NAME'] ?? ''));
    $backendPos = strpos($script, '/backend/');
    $prefijo = $backendPos === false ? '' : substr($script, 0, $backendPos);

    return $prefijo . '/' . ltrim($ruta, '/');
}

function campo_requerido(array $data, string $campo): string
{
    $valor = limpiar_texto($data[$campo] ?? '');

    if ($valor === '') {
        responder_json([
            'ok' => false,
            'error' => "Falta el campo {$campo}",
        ], 422);
    }

    return $valor;
}

function fecha_tarjeta(?string $fecha): string
{
    if (!$fecha) {
        return '';
    }

    $timestamp = strtotime($fecha);
    if (!$timestamp) {
        return $fecha;
    }

    $meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return date('d', $timestamp) . ' ' . $meses[(int) date('n', $timestamp) - 1];
}

function hora_corta(?string $hora): string
{
    if (!$hora) {
        return '';
    }

    if (str_contains($hora, ' ') || str_contains($hora, 'T')) {
        $timestamp = strtotime($hora);
        if ($timestamp) {
            return date('H:i', $timestamp);
        }
    }

    return substr($hora, 0, 5);
}

function iniciales(string $nombre, string $apellido = ''): string
{
    $primera = substr(trim($nombre), 0, 1);
    $segunda = substr(trim($apellido), 0, 1);
    return strtoupper($primera . $segunda);
}
