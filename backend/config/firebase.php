<?php

declare(strict_types=1);

require_once __DIR__ . '/database.php';

function firebase_base64url(string $valor): string
{
    return rtrim(strtr(base64_encode($valor), '+/', '-_'), '=');
}

function firebase_credenciales(): array
{
    $jsonBase64 = trim(asistigo_env('ASISTIGO_FIREBASE_JSON_BASE64'));
    $jsonDirecto = trim(asistigo_env('ASISTIGO_FIREBASE_JSON'));

    if ($jsonBase64 !== '') {
        $contenido = base64_decode($jsonBase64, true);
        if ($contenido === false) {
            throw new RuntimeException('ASISTIGO_FIREBASE_JSON_BASE64 no contiene base64 valido');
        }
    } elseif ($jsonDirecto !== '') {
        $contenido = $jsonDirecto;
    } else {
        $ruta = asistigo_env('ASISTIGO_FIREBASE_CREDENTIALS', 'C:\\xampp\\secure\\asistigo-firebase.json');
        $contenido = @file_get_contents($ruta);
    }

    if ($contenido === false) {
        throw new RuntimeException('No se encontro la credencial privada de Firebase');
    }

    $credenciales = json_decode($contenido, true);
    if (!is_array($credenciales) || empty($credenciales['private_key']) || empty($credenciales['client_email'])) {
        throw new RuntimeException('La credencial privada de Firebase no es valida');
    }

    return $credenciales;
}

function firebase_peticion(string $url, array $opciones): array
{
    $curl = curl_init($url);
    curl_setopt_array($curl, $opciones + [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 30,
    ]);
    $respuesta = curl_exec($curl);
    $estado = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    $error = curl_error($curl);
    curl_close($curl);

    if ($respuesta === false) {
        throw new RuntimeException('Firebase no respondio: ' . $error);
    }

    $json = json_decode($respuesta, true);
    return ['status' => $estado, 'data' => is_array($json) ? $json : [], 'raw' => $respuesta];
}

function firebase_access_token(): string
{
    $cache = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'asistigo-firebase-token.json';
    $guardado = @json_decode((string) @file_get_contents($cache), true);
    if (is_array($guardado) && ($guardado['expires_at'] ?? 0) > time() + 60 && !empty($guardado['access_token'])) {
        return (string) $guardado['access_token'];
    }

    $credenciales = firebase_credenciales();
    $ahora = time();
    $header = firebase_base64url(json_encode(['alg' => 'RS256', 'typ' => 'JWT'], JSON_UNESCAPED_SLASHES));
    $claims = firebase_base64url(json_encode([
        'iss' => $credenciales['client_email'],
        'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
        'aud' => 'https://oauth2.googleapis.com/token',
        'iat' => $ahora,
        'exp' => $ahora + 3600,
    ], JSON_UNESCAPED_SLASHES));
    $firmable = $header . '.' . $claims;

    if (!openssl_sign($firmable, $firma, $credenciales['private_key'], OPENSSL_ALGO_SHA256)) {
        throw new RuntimeException('No se pudo firmar la autenticacion de Firebase');
    }

    $jwt = $firmable . '.' . firebase_base64url($firma);
    $respuesta = firebase_peticion('https://oauth2.googleapis.com/token', [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
        CURLOPT_POSTFIELDS => http_build_query([
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $jwt,
        ]),
    ]);

    if ($respuesta['status'] !== 200 || empty($respuesta['data']['access_token'])) {
        throw new RuntimeException('Firebase rechazo la autenticacion: ' . $respuesta['raw']);
    }

    $token = (string) $respuesta['data']['access_token'];
    @file_put_contents($cache, json_encode([
        'access_token' => $token,
        'expires_at' => $ahora + (int) ($respuesta['data']['expires_in'] ?? 3600),
    ]), LOCK_EX);

    return $token;
}

function enviar_push_token(string $token, string $titulo, string $mensaje, array $data = []): array
{
    $credenciales = firebase_credenciales();
    $datos = [];
    foreach ($data as $clave => $valor) {
        $datos[(string) $clave] = (string) ($valor ?? '');
    }

    $payload = [
        'message' => [
            'token' => $token,
            'notification' => ['title' => $titulo, 'body' => $mensaje],
            'data' => $datos,
            'android' => [
                'priority' => 'high',
                'notification' => [
                    'channel_id' => 'asistigo_general',
                    'sound' => 'default',
                ],
            ],
        ],
    ];

    return firebase_peticion(
        'https://fcm.googleapis.com/v1/projects/' . rawurlencode($credenciales['project_id']) . '/messages:send',
        [
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . firebase_access_token(),
                'Content-Type: application/json; charset=utf-8',
            ],
            CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]
    );
}

function enviar_push_cliente(int $clienteId, string $titulo, string $mensaje, array $data = []): array
{
    $db = asistigo_db();
    $stmt = $db->prepare('SELECT id, token FROM push_tokens WHERE cliente_id = :cliente_id AND activo = 1');
    $stmt->execute([':cliente_id' => $clienteId]);
    $resultados = [];

    foreach ($stmt->fetchAll() as $dispositivo) {
        $resultado = enviar_push_token($dispositivo['token'], $titulo, $mensaje, $data);
        $resultados[] = $resultado;

        $codigo = $resultado['data']['error']['details'][0]['errorCode'] ?? '';
        if (in_array($codigo, ['UNREGISTERED', 'INVALID_ARGUMENT'], true)) {
            $inactivar = $db->prepare('UPDATE push_tokens SET activo = 0 WHERE id = :id');
            $inactivar->execute([':id' => $dispositivo['id']]);
        }
    }

    return $resultados;
}

function enviar_push_mecanicos(array $mecanicoIds, string $titulo, string $mensaje, array $data = []): array
{
    $ids = array_values(array_unique(array_filter(array_map('intval', $mecanicoIds))));
    if ($ids === []) {
        return [];
    }

    $db = asistigo_db();
    $marcas = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $db->prepare("SELECT id, token FROM push_tokens WHERE mecanico_id IN ({$marcas}) AND activo = 1");
    $stmt->execute($ids);
    $resultados = [];

    foreach ($stmt->fetchAll() as $dispositivo) {
        $resultado = enviar_push_token($dispositivo['token'], $titulo, $mensaje, $data);
        $resultados[] = $resultado;

        $codigo = $resultado['data']['error']['details'][0]['errorCode'] ?? '';
        if (in_array($codigo, ['UNREGISTERED', 'INVALID_ARGUMENT'], true)) {
            $inactivar = $db->prepare('UPDATE push_tokens SET activo = 0 WHERE id = :id');
            $inactivar->execute([':id' => $dispositivo['id']]);
        }
    }

    return $resultados;
}

function enviar_push_taller(int $tallerId, string $titulo, string $mensaje, array $data = []): array
{
    $db = asistigo_db();
    $stmt = $db->prepare('SELECT mecanico_id FROM taller_mecanicos WHERE taller_id = :taller_id AND activo = 1');
    $stmt->execute([':taller_id' => $tallerId]);
    return enviar_push_mecanicos(array_column($stmt->fetchAll(), 'mecanico_id'), $titulo, $mensaje, $data);
}
