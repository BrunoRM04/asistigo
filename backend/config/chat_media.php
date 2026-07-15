<?php

declare(strict_types=1);

function chat_media_guardar(array $archivo): array
{
    $error = (int) ($archivo['error'] ?? UPLOAD_ERR_NO_FILE);
    if ($error !== UPLOAD_ERR_OK) {
        throw new InvalidArgumentException('No se pudo recibir el archivo adjunto.');
    }

    $tamano = (int) ($archivo['size'] ?? 0);
    if ($tamano <= 0) {
        throw new InvalidArgumentException('El archivo adjunto está vacío.');
    }

    $temporal = (string) ($archivo['tmp_name'] ?? '');
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = (string) $finfo->file($temporal);
    $formatos = [
        'image/jpeg' => ['tipo' => 'imagen', 'extension' => 'jpg'],
        'image/png' => ['tipo' => 'imagen', 'extension' => 'png'],
        'image/webp' => ['tipo' => 'imagen', 'extension' => 'webp'],
        'video/mp4' => ['tipo' => 'video', 'extension' => 'mp4'],
        'video/webm' => ['tipo' => 'video', 'extension' => 'webm'],
        'video/quicktime' => ['tipo' => 'video', 'extension' => 'mov'],
    ];
    if (!isset($formatos[$mime])) {
        throw new InvalidArgumentException('Formato no admitido. Usa JPG, PNG, WEBP, MP4, WEBM o MOV.');
    }
    $limite = $formatos[$mime]['tipo'] === 'imagen' ? 10 * 1024 * 1024 : 25 * 1024 * 1024;
    if ($tamano > $limite) {
        throw new InvalidArgumentException(
            $formatos[$mime]['tipo'] === 'imagen'
                ? 'La imagen debe pesar menos de 10 MB.'
                : 'El video debe pesar menos de 25 MB.'
        );
    }

    $destinoDir = dirname(__DIR__) . '/uploads/chat-ia';
    if (!is_dir($destinoDir) && !mkdir($destinoDir, 0775, true) && !is_dir($destinoDir)) {
        throw new RuntimeException('No se pudo preparar el almacenamiento de adjuntos.');
    }

    $nombreArchivo = date('Ymd_His') . '_' . bin2hex(random_bytes(8)) . '.' . $formatos[$mime]['extension'];
    $destino = $destinoDir . '/' . $nombreArchivo;
    if (!move_uploaded_file($temporal, $destino)) {
        throw new RuntimeException('No se pudo guardar el archivo adjunto.');
    }

    return [
        'tipo' => $formatos[$mime]['tipo'],
        'nombre' => function_exists('mb_substr')
            ? mb_substr((string) ($archivo['name'] ?? $nombreArchivo), 0, 180)
            : substr((string) ($archivo['name'] ?? $nombreArchivo), 0, 180),
        'mime' => $mime,
        'tamano' => $tamano,
        'ruta' => 'uploads/chat-ia/' . $nombreArchivo,
        'url' => asistigo_url_publica('backend/uploads/chat-ia/' . $nombreArchivo),
        'absoluta' => $destino,
    ];
}

function chat_media_data_url_imagen(array $adjunto): string
{
    $contenido = file_get_contents($adjunto['absoluta']);
    if ($contenido === false) {
        throw new RuntimeException('No se pudo leer la imagen adjunta.');
    }

    return 'data:' . $adjunto['mime'] . ';base64,' . base64_encode($contenido);
}

function chat_media_validar_fotogramas(mixed $valor): array
{
    if (is_string($valor)) {
        $valor = json_decode($valor, true);
    }
    if (!is_array($valor)) {
        return [];
    }

    $fotogramas = [];
    foreach (array_slice($valor, 0, 4) as $dataUrl) {
        if (!is_string($dataUrl)
            || !preg_match('#^data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$#', $dataUrl, $coincidencias)
        ) {
            continue;
        }
        $binario = base64_decode($coincidencias[2], true);
        if ($binario === false || strlen($binario) > 3 * 1024 * 1024) {
            continue;
        }
        $fotogramas[] = $dataUrl;
    }

    return $fotogramas;
}

function chat_media_eliminar(?array $adjunto): void
{
    if ($adjunto && is_file($adjunto['absoluta'] ?? '')) {
        @unlink($adjunto['absoluta']);
    }
}
