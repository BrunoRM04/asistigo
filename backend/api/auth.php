<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/http.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder_json(['ok' => false, 'error' => 'Metodo no permitido'], 405);
}

$db = asistigo_db();
$data = leer_json();
$accion = limpiar_texto($data['accion'] ?? 'login_cliente');

function numero_decimal_nullable(mixed $valor): ?float
{
    if ($valor === null) {
        return null;
    }

    $texto = trim((string) $valor);
    if ($texto === '') {
        return null;
    }

    $texto = str_replace(',', '.', $texto);
    $texto = preg_replace('/[^0-9.+\-]/', '', $texto) ?? '';
    if ($texto === '' || !is_numeric($texto)) {
        return null;
    }

    return (float) $texto;
}

function coordenada_nullable(mixed $valor, float $min, float $max): ?float
{
    $numero = numero_decimal_nullable($valor);
    if ($numero === null || $numero < $min || $numero > $max) {
        return null;
    }

    return $numero;
}

function geocodificar_direccion(string $direccion, string $ciudad = '', string $pais = ''): ?array
{
    $query = trim(implode(', ', array_filter([$direccion, $ciudad, $pais])));
    if ($query === '') {
        return null;
    }

    $url = 'https://nominatim.openstreetmap.org/search?' . http_build_query([
        'format' => 'jsonv2',
        'q' => $query,
        'addressdetails' => 1,
        'accept-language' => 'es',
        'limit' => 1,
    ]);

    $contexto = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => 8,
            'header' => "User-Agent: AsistiGo-local-dev/1.0\r\nAccept: application/json\r\n",
        ],
    ]);

    $respuesta = @file_get_contents($url, false, $contexto);
    if ($respuesta === false) {
        return null;
    }

    $data = json_decode($respuesta, true);
    if (!is_array($data) || !is_array($data[0] ?? null)) {
        return null;
    }

    $primerResultado = $data[0];
    $address = is_array($primerResultado['address'] ?? null) ? $primerResultado['address'] : [];
    $ciudadResuelta = limpiar_texto($address['city'] ?? $address['town'] ?? $address['village'] ?? $address['municipality'] ?? '') ?: $ciudad;
    $paisResuelto = limpiar_texto($address['country'] ?? '') ?: $pais;

    return [
        'latitud' => coordenada_nullable($primerResultado['lat'] ?? null, -90, 90),
        'longitud' => coordenada_nullable($primerResultado['lon'] ?? null, -180, 180),
        'direccion' => limpiar_texto($primerResultado['display_name'] ?? $direccion),
        'ciudad' => $ciudadResuelta,
        'pais' => $paisResuelto,
    ];
}

function resolver_direccion_por_coordenadas(float $latitud, float $longitud): ?array
{
    $url = 'https://nominatim.openstreetmap.org/reverse?' . http_build_query([
        'format' => 'jsonv2',
        'lat' => $latitud,
        'lon' => $longitud,
        'addressdetails' => 1,
        'accept-language' => 'es',
    ]);

    $contexto = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => 8,
            'header' => "User-Agent: AsistiGo-local-dev/1.0\r\nAccept: application/json\r\n",
        ],
    ]);

    $respuesta = @file_get_contents($url, false, $contexto);
    if ($respuesta === false) {
        return null;
    }

    $data = json_decode($respuesta, true);
    if (!is_array($data)) {
        return null;
    }

    $address = is_array($data['address'] ?? null) ? $data['address'] : [];
    $ciudad = limpiar_texto($address['city'] ?? $address['town'] ?? $address['village'] ?? $address['municipality'] ?? '');
    $pais = limpiar_texto($address['country'] ?? '');

    return [
        'direccion' => limpiar_texto($data['display_name'] ?? ''),
        'ciudad' => $ciudad,
        'pais' => $pais,
    ];
}

try {
    if ($accion === 'login_cliente') {
        $email = campo_requerido($data, 'email');
        $password = campo_requerido($data, 'password');

        $stmt = $db->prepare('SELECT * FROM clientes WHERE email = :email LIMIT 1');
        $stmt->execute([':email' => $email]);
        $cliente = $stmt->fetch();

        if (!$cliente || !password_verify($password, $cliente['password_hash'])) {
            responder_json(['ok' => false, 'error' => 'Credenciales invalidas'], 401);
        }

        responder_json([
            'ok' => true,
            'tipo' => 'cliente',
            'usuario' => [
                'id' => (int) $cliente['id'],
                'nombre' => $cliente['nombre'] . ' ' . $cliente['apellido'],
                'inicial' => iniciales($cliente['nombre']),
                'email' => $cliente['email'],
            ],
        ]);
    }

    if ($accion === 'registro_cliente') {
        $nombre = campo_requerido($data, 'nombre');
        $apellido = campo_requerido($data, 'apellido');
        $email = campo_requerido($data, 'email');
        $password = campo_requerido($data, 'password');
        $paisCliente = limpiar_texto($data['pais'] ?? '') ?: 'Uruguay';
        $ciudadCliente = limpiar_texto($data['ciudad'] ?? '');
        $direccionCliente = limpiar_texto($data['direccion'] ?? '');
        $latitudCliente = coordenada_nullable($data['latitud'] ?? null, -90, 90);
        $longitudCliente = coordenada_nullable($data['longitud'] ?? null, -180, 180);

        if ($direccionCliente !== '' && ($latitudCliente === null || $longitudCliente === null)) {
            $geo = geocodificar_direccion($direccionCliente, $ciudadCliente, $paisCliente);
            if (is_array($geo)) {
                $latitudCliente = $latitudCliente ?? $geo['latitud'];
                $longitudCliente = $longitudCliente ?? $geo['longitud'];
                $direccionCliente = limpiar_texto($geo['direccion'] ?? $direccionCliente);
                $ciudadCliente = limpiar_texto($geo['ciudad'] ?? $ciudadCliente);
                $paisCliente = limpiar_texto($geo['pais'] ?? $paisCliente) ?: $paisCliente;
            }
        }

        if ($direccionCliente === '' && $latitudCliente !== null && $longitudCliente !== null) {
            $geoInverso = resolver_direccion_por_coordenadas($latitudCliente, $longitudCliente);
            if (is_array($geoInverso)) {
                $direccionCliente = limpiar_texto($geoInverso['direccion'] ?? '');
                $ciudadCliente = limpiar_texto($geoInverso['ciudad'] ?? $ciudadCliente);
                $paisCliente = limpiar_texto($geoInverso['pais'] ?? $paisCliente) ?: $paisCliente;
            }
        }

        $stmt = $db->prepare(
            'INSERT INTO clientes (nombre, apellido, email, telefono, pais, ciudad, password_hash, estado)
             VALUES (:nombre, :apellido, :email, :telefono, :pais, :ciudad, :password_hash, "activo")'
        );
        $stmt->execute([
            ':nombre' => $nombre,
            ':apellido' => $apellido,
            ':email' => $email,
            ':telefono' => limpiar_texto($data['telefono'] ?? '') ?: null,
            ':pais' => $paisCliente,
            ':ciudad' => $ciudadCliente ?: null,
            ':password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ]);
        $clienteId = (int) $db->lastInsertId();

        if ($direccionCliente !== '') {
            $stmt = $db->prepare(
                'INSERT INTO cliente_direcciones
                    (cliente_id, alias, direccion, ciudad, pais, latitud, longitud, principal)
                 VALUES
                    (:cliente_id, "Principal", :direccion, :ciudad, :pais, :latitud, :longitud, 1)'
            );
            $stmt->execute([
                ':cliente_id' => $clienteId,
                ':direccion' => $direccionCliente,
                ':ciudad' => $ciudadCliente ?: null,
                ':pais' => $paisCliente,
                ':latitud' => $latitudCliente,
                ':longitud' => $longitudCliente,
            ]);
        }

        responder_json([
            'ok' => true,
            'tipo' => 'cliente',
            'usuario' => [
                'id' => $clienteId,
                'nombre' => "{$nombre} {$apellido}",
                'inicial' => iniciales($nombre),
                'email' => $email,
            ],
        ], 201);
    }

    if ($accion === 'login_mecanico') {
        $email = campo_requerido($data, 'email');
        $password = campo_requerido($data, 'password');

        $stmt = $db->prepare(
            'SELECT m.*, t.id AS taller_id, t.nombre_comercial
             FROM mecanicos m
             LEFT JOIN talleres t ON t.mecanico_responsable_id = m.id
             WHERE m.email = :email
             LIMIT 1'
        );
        $stmt->execute([':email' => $email]);
        $mecanico = $stmt->fetch();

        if (!$mecanico || !password_verify($password, $mecanico['password_hash'])) {
            responder_json(['ok' => false, 'error' => 'Credenciales invalidas'], 401);
        }

        responder_json([
            'ok' => true,
            'tipo' => 'mecanico',
            'usuario' => [
                'id' => (int) $mecanico['id'],
                'taller_id' => $mecanico['taller_id'] ? (int) $mecanico['taller_id'] : null,
                'nombre' => $mecanico['nombre'] . ' ' . $mecanico['apellido'],
                'taller' => $mecanico['nombre_comercial'],
                'email' => $mecanico['email'],
            ],
        ]);
    }

    if ($accion === 'registro_mecanico') {
        $responsable = campo_requerido($data, 'responsable');
        $email = campo_requerido($data, 'email');
        $password = campo_requerido($data, 'password');
        $ciudadTaller = limpiar_texto($data['ciudad'] ?? '');
        $direccionTaller = limpiar_texto($data['direccion'] ?? '');
        $ubicacionBaseTaller = limpiar_texto($data['ubicacionBase'] ?? '');
        $latitudTaller = coordenada_nullable($data['latitud'] ?? null, -90, 90);
        $longitudTaller = coordenada_nullable($data['longitud'] ?? null, -180, 180);
        $radioCobertura = numero_decimal_nullable($data['radio'] ?? null);

        if ($latitudTaller === null || $longitudTaller === null) {
            $consultaUbicacion = $direccionTaller !== '' ? $direccionTaller : $ubicacionBaseTaller;
            $geoTaller = geocodificar_direccion($consultaUbicacion, $ciudadTaller, 'Uruguay');
            if (is_array($geoTaller)) {
                $latitudTaller = $latitudTaller ?? $geoTaller['latitud'];
                $longitudTaller = $longitudTaller ?? $geoTaller['longitud'];
                if ($direccionTaller === '') {
                    $direccionTaller = limpiar_texto($geoTaller['direccion'] ?? '');
                }
                if ($ubicacionBaseTaller === '') {
                    $ubicacionBaseTaller = limpiar_texto($geoTaller['direccion'] ?? '');
                }
                if ($ciudadTaller === '') {
                    $ciudadTaller = limpiar_texto($geoTaller['ciudad'] ?? '');
                }
            }
        }

        if ($direccionTaller === '' && $ubicacionBaseTaller !== '') {
            $direccionTaller = $ubicacionBaseTaller;
        }

        if (strlen($password) < 6) {
            responder_json(['ok' => false, 'error' => 'La contraseña debe tener al menos 6 caracteres'], 422);
        }
        $partes = preg_split('/\s+/', $responsable, 2);
        $nombre = $partes[0] ?? $responsable;
        $apellido = $partes[1] ?? '';

        $db->beginTransaction();

        $stmt = $db->prepare(
            'INSERT INTO mecanicos (nombre, apellido, email, telefono, cedula_identidad, password_hash, estado, verificado_at)
             VALUES (:nombre, :apellido, :email, :telefono, :cedula, :password_hash, "activo", NOW())'
        );
        $stmt->execute([
            ':nombre' => $nombre,
            ':apellido' => $apellido,
            ':email' => $email,
            ':telefono' => limpiar_texto($data['celular'] ?? '') ?: null,
            ':cedula' => limpiar_texto($data['cedula'] ?? '') ?: null,
            ':password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ]);

        $mecanicoId = (int) $db->lastInsertId();

        $stmt = $db->prepare(
            'INSERT INTO talleres
                (mecanico_responsable_id, nombre_comercial, nombre_legal, documento_legal, identificacion_fiscal,
                 tipo_prestador, especialidad, descripcion, ciudad, direccion, ubicacion_base, modalidad_atencion,
                 zona_cobertura, ofrece_urgencias, datos_urgencia, garantia, anios_experiencia, estado)
             VALUES
                (:mecanico_id, :nombre_comercial, :nombre_legal, :documento_legal, :identificacion_fiscal,
                 :tipo_prestador, :especialidad, :descripcion, :ciudad, :direccion, :ubicacion_base, :modalidad,
                 :zona_cobertura, :ofrece_urgencias, :datos_urgencia, :garantia, :anios_experiencia, "activo")'
        );
        $stmt->execute([
            ':mecanico_id' => $mecanicoId,
            ':nombre_comercial' => campo_requerido($data, 'nombreComercial'),
            ':nombre_legal' => limpiar_texto($data['nombreLegal'] ?? '') ?: null,
            ':documento_legal' => limpiar_texto($data['documento'] ?? '') ?: null,
            ':identificacion_fiscal' => limpiar_texto($data['fiscal'] ?? '') ?: null,
            ':tipo_prestador' => match (limpiar_texto($data['tipoPrestador'] ?? '')) {
                'Mecánico móvil' => 'mecanico_movil',
                'Taller físico y móvil' => 'taller_y_movil',
                default => 'taller_fisico',
            },
            ':especialidad' => limpiar_texto($data['especialidad'] ?? '') ?: 'Mecanica general',
            ':descripcion' => limpiar_texto($data['descripcion'] ?? '') ?: null,
            ':ciudad' => $ciudadTaller ?: null,
            ':direccion' => $direccionTaller ?: null,
            ':ubicacion_base' => $ubicacionBaseTaller ?: null,
            ':modalidad' => match (limpiar_texto($data['modalidad'] ?? '')) {
                'A domicilio' => 'a_domicilio',
                'En taller y a domicilio' => 'ambas',
                'Urgencias' => 'urgencias',
                default => 'en_taller',
            },
            ':zona_cobertura' => limpiar_texto($data['zonaCobertura'] ?? '') ?: null,
            ':ofrece_urgencias' => !empty($data['ofreceUrgencias']) ? 1 : 0,
            ':datos_urgencia' => limpiar_texto($data['urgencias'] ?? '') ?: null,
            ':garantia' => limpiar_texto($data['garantia'] ?? '') ?: null,
            ':anios_experiencia' => limpiar_texto($data['experiencia'] ?? '') ?: null,
        ]);

        $tallerId = (int) $db->lastInsertId();

        $tipoPrestadorNormalizado = match (limpiar_texto($data['tipoPrestador'] ?? '')) {
            'Mecánico móvil', 'Mecanico movil', 'MecÃ¡nico mÃ³vil' => 'mecanico_movil',
            'Taller físico y móvil', 'Taller fisico y movil', 'Taller fÃ­sico y mÃ³vil' => 'taller_y_movil',
            default => 'taller_fisico',
        };
        $stmt = $db->prepare(
            'UPDATE talleres
             SET tipo_prestador = :tipo,
                 radio_cobertura_km = :radio,
                 latitud = :latitud,
                 longitud = :longitud
             WHERE id = :id'
        );
        $stmt->execute([
            ':tipo' => $tipoPrestadorNormalizado,
            ':radio' => $radioCobertura,
            ':latitud' => $latitudTaller,
            ':longitud' => $longitudTaller,
            ':id' => $tallerId,
        ]);

        $stmt = $db->prepare('INSERT INTO taller_mecanicos (taller_id, mecanico_id, rol) VALUES (:taller_id, :mecanico_id, "duenio")');
        $stmt->execute([':taller_id' => $tallerId, ':mecanico_id' => $mecanicoId]);

        $servicios = $data['servicios'] ?? [];
        if (is_array($servicios)) {
            $stmt = $db->prepare('INSERT INTO taller_servicios (taller_id, nombre, categoria, precio_base, duracion_minutos) VALUES (:taller_id, :nombre, "General", 0, 60)');
            foreach ($servicios as $servicio) {
                $nombreServicio = limpiar_texto($servicio);
                if ($nombreServicio !== '') {
                    $stmt->execute([':taller_id' => $tallerId, ':nombre' => $nombreServicio]);
                }
            }
        }

        $vehiculos = $data['vehiculos'] ?? [];
        if (is_array($vehiculos)) {
            $stmt = $db->prepare('INSERT IGNORE INTO taller_tipos_vehiculo (taller_id, tipo_vehiculo) VALUES (:taller_id, :tipo)');
            foreach ($vehiculos as $vehiculo) {
                $tipo = match (limpiar_texto($vehiculo)) {
                    'Motos', 'Moto' => 'moto',
                    'Utilitarios', 'Utilitario' => 'utilitario',
                    default => 'auto',
                };
                $stmt->execute([':taller_id' => $tallerId, ':tipo' => $tipo]);
            }
        }

        $pagos = $data['pagos'] ?? [];
        if (is_array($pagos)) {
            $stmt = $db->prepare('INSERT IGNORE INTO taller_metodos_pago (taller_id, metodo) VALUES (:taller_id, :metodo)');
            foreach ($pagos as $pago) {
                $metodo = match (limpiar_texto($pago)) {
                    'Transferencia' => 'transferencia',
                    'Tarjeta' => 'tarjeta',
                    'Mercado Pago' => 'mercado_pago',
                    default => 'efectivo',
                };
                $stmt->execute([':taller_id' => $tallerId, ':metodo' => $metodo]);
            }
        }

        $dias = ['Lunes' => 1, 'Martes' => 2, 'Miércoles' => 3, 'Miercoles' => 3, 'Jueves' => 4, 'Viernes' => 5, 'Sábado' => 6, 'Sabado' => 6];
        $horarios = $data['horarios'] ?? [];
        if (is_array($horarios)) {
            $stmt = $db->prepare(
                'INSERT INTO taller_horarios (taller_id, dia_semana, hora_apertura, hora_cierre, activo)
                 VALUES (:taller_id, :dia, :abre, :cierra, 1)
                 ON DUPLICATE KEY UPDATE hora_apertura = VALUES(hora_apertura), hora_cierre = VALUES(hora_cierre), activo = 1'
            );
            foreach ($horarios as $diaNombre => $horario) {
                if (!isset($dias[$diaNombre]) || !is_array($horario)) {
                    continue;
                }
                $stmt->execute([
                    ':taller_id' => $tallerId,
                    ':dia' => $dias[$diaNombre],
                    ':abre' => limpiar_texto($horario['abre'] ?? '') ?: '08:30',
                    ':cierra' => limpiar_texto($horario['cierra'] ?? '') ?: '18:00',
                ]);
            }
        }

        $db->commit();

        responder_json([
            'ok' => true,
            'tipo' => 'mecanico',
            'usuario' => [
                'id' => $mecanicoId,
                'taller_id' => $tallerId,
                'nombre' => $responsable,
                'taller' => $data['nombreComercial'],
                'email' => $email,
            ],
        ], 201);
    }

    responder_json(['ok' => false, 'error' => 'Accion no reconocida'], 400);
} catch (PDOException $error) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }

    responder_json([
        'ok' => false,
        'error' => $error->getCode() === '23000' ? 'El email ya existe o hay un dato duplicado' : 'Error de base de datos',
        'detail' => $error->getMessage(),
    ], $error->getCode() === '23000' ? 409 : 500);
}
