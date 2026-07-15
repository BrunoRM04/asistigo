<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/http.php';
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    responder_json(['ok' => false, 'error' => 'Metodo no permitido'], 405);
}

function geocode_pedir(string $url): array
{
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => 8,
            'header' => "User-Agent: AsistiGo-local-dev/1.0\r\nAccept: application/json\r\n",
        ],
    ]);

    $respuesta = @file_get_contents($url, false, $context);
    if ($respuesta === false) {
        responder_json(['ok' => false, 'error' => 'No se pudo contactar el servicio de mapas'], 502);
    }

    $data = json_decode($respuesta, true);
    if (!is_array($data)) {
        responder_json(['ok' => false, 'error' => 'Respuesta de ubicacion invalida'], 502);
    }

    return $data;
}

function geocode_formatear_direccion(array $address, string $displayName): array
{
    $calle = $address['road'] ?? $address['pedestrian'] ?? $address['residential'] ?? $address['footway'] ?? '';
    $numero = $address['house_number'] ?? '';
    $barrio = $address['suburb'] ?? $address['neighbourhood'] ?? $address['quarter'] ?? '';
    $ciudad = $address['city'] ?? $address['town'] ?? $address['village'] ?? $address['municipality'] ?? '';
    $pais = $address['country'] ?? '';

    $partesDireccion = array_values(array_filter([
        trim($calle . ($numero ? ' ' . $numero : '')),
        $barrio,
        $ciudad,
    ]));

    $direccion = implode(', ', $partesDireccion);
    if ($direccion === '') {
        $direccion = limpiar_texto($displayName);
    }

    return ['direccion' => $direccion, 'ciudad' => $ciudad, 'pais' => $pais];
}

$direccionBuscada = limpiar_texto($_GET['direccion'] ?? '');

if ($direccionBuscada !== '') {
    $ciudadBuscada = limpiar_texto($_GET['ciudad'] ?? '');
    $paisBuscado = limpiar_texto($_GET['pais'] ?? '');

    $consulta = implode(', ', array_filter([$direccionBuscada, $ciudadBuscada, $paisBuscado]));

    $url = 'https://nominatim.openstreetmap.org/search?' . http_build_query([
        'format' => 'jsonv2',
        'q' => $consulta,
        'addressdetails' => 1,
        'limit' => 1,
        'accept-language' => 'es',
    ]);

    $resultados = geocode_pedir($url);
    if (count($resultados) === 0) {
        responder_json(['ok' => false, 'error' => 'No encontramos esa direccion. Revisala e intenta de nuevo.'], 404);
    }

    $resultado = $resultados[0];
    $address = is_array($resultado['address'] ?? null) ? $resultado['address'] : [];
    $formateado = geocode_formatear_direccion($address, (string) ($resultado['display_name'] ?? ''));

    responder_json([
        'ok' => true,
        'data' => [
            'direccion' => $formateado['direccion'],
            'ciudad' => $formateado['ciudad'],
            'pais' => $formateado['pais'],
            'latitud' => (float) ($resultado['lat'] ?? 0),
            'longitud' => (float) ($resultado['lon'] ?? 0),
            'display_name' => limpiar_texto($resultado['display_name'] ?? ''),
        ],
    ]);
}

$latitud = (float) ($_GET['latitud'] ?? 0);
$longitud = (float) ($_GET['longitud'] ?? 0);

if ($latitud < -90 || $latitud > 90 || $longitud < -180 || $longitud > 180 || ($latitud === 0.0 && $longitud === 0.0)) {
    responder_json(['ok' => false, 'error' => 'Coordenadas invalidas'], 422);
}

$url = 'https://nominatim.openstreetmap.org/reverse?' . http_build_query([
    'format' => 'jsonv2',
    'lat' => $latitud,
    'lon' => $longitud,
    'addressdetails' => 1,
    'accept-language' => 'es',
]);

$data = geocode_pedir($url);
$address = is_array($data['address'] ?? null) ? $data['address'] : [];
$formateado = geocode_formatear_direccion($address, (string) ($data['display_name'] ?? ''));

responder_json([
    'ok' => true,
    'data' => [
        'direccion' => $formateado['direccion'],
        'ciudad' => $formateado['ciudad'],
        'pais' => $formateado['pais'],
        'latitud' => $latitud,
        'longitud' => $longitud,
        'display_name' => limpiar_texto($data['display_name'] ?? ''),
    ],
]);
