<?php

declare(strict_types=1);

require_once __DIR__ . '/env.php';

function openai_config(): array
{
    $envFile = dirname(__DIR__) . '/.env';
    if (is_file($envFile)) {
        foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $linea) {
            $linea = trim(ltrim($linea, "\xEF\xBB\xBF"));
            if ($linea === '' || str_starts_with($linea, '#') || !str_contains($linea, '=')) {
                continue;
            }
            [$nombre, $valor] = array_map('trim', explode('=', $linea, 2));
            if (asistigo_env($nombre) === '') {
                putenv($nombre . '=' . trim($valor, "\"'"));
            }
        }
    }

    return [
        'api_key' => trim(asistigo_env('OPENAI_API_KEY')),
        'model' => trim(asistigo_env('OPENAI_MODEL', 'gpt-5.6')),
        'timeout' => max(10, min(90, (int) asistigo_env('OPENAI_TIMEOUT_SECONDS', '45'))),
    ];
}

function openai_extraer_texto(array $respuesta): string
{
    if (isset($respuesta['output_text']) && is_string($respuesta['output_text'])) {
        return trim($respuesta['output_text']);
    }

    $partes = [];
    foreach (($respuesta['output'] ?? []) as $item) {
        if (($item['type'] ?? '') !== 'message') {
            continue;
        }
        foreach (($item['content'] ?? []) as $contenido) {
            if (($contenido['type'] ?? '') === 'output_text' && is_string($contenido['text'] ?? null)) {
                $partes[] = $contenido['text'];
            }
        }
    }

    return trim(implode("\n", $partes));
}

function openai_responder(array $input, string $instrucciones): array
{
    $config = openai_config();
    if ($config['api_key'] === '') {
        throw new RuntimeException('OPENAI_API_KEY no esta configurada en el servidor.');
    }

    $payload = [
        'model' => $config['model'],
        'reasoning' => ['effort' => 'low'],
        'instructions' => $instrucciones,
        'input' => $input,
        'max_output_tokens' => 1400,
        'store' => false,
    ];

    $curl = curl_init('https://api.openai.com/v1/responses');
    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => $config['timeout'],
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $config['api_key'],
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    ]);

    $cuerpo = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $errorCurl = curl_error($curl);
    curl_close($curl);

    if ($cuerpo === false || $errorCurl !== '') {
        throw new RuntimeException('No se pudo conectar con OpenAI. Intenta nuevamente.');
    }

    $respuesta = json_decode($cuerpo, true);
    if (!is_array($respuesta)) {
        throw new RuntimeException('OpenAI devolvio una respuesta invalida.');
    }
    if ($status < 200 || $status >= 300) {
        error_log('OpenAI API error ' . $status . ': ' . ($respuesta['error']['message'] ?? 'sin detalle'));
        $mensaje = $status === 429
            ? 'El asistente esta recibiendo muchas consultas. Intenta en unos instantes.'
            : 'El asistente no esta disponible temporalmente.';
        throw new RuntimeException($mensaje);
    }

    $texto = openai_extraer_texto($respuesta);
    if ($texto === '') {
        throw new RuntimeException('El asistente no pudo generar una respuesta. Intenta reformular la consulta.');
    }

    return [
        'texto' => $texto,
        'response_id' => $respuesta['id'] ?? null,
        'model' => $respuesta['model'] ?? $config['model'],
        'usage' => $respuesta['usage'] ?? null,
    ];
}
