<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/http.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/helpers.php';

$db = asistigo_db();
$clienteId = (int) ($_GET['cliente_id'] ?? 0);

const RADIO_BUSQUEDA_KM_DEFAULT = 30.0;

function distancia_km(?float $lat1, ?float $lon1, ?float $lat2, ?float $lon2): ?float
{
    if ($lat1 === null || $lon1 === null || $lat2 === null || $lon2 === null) {
        return null;
    }

    $radioTierra = 6371;
    $dLat = deg2rad($lat2 - $lat1);
    $dLon = deg2rad($lon2 - $lon1);
    $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;
    return round($radioTierra * 2 * atan2(sqrt($a), sqrt(1 - $a)), 1);
}

if ($clienteId <= 0) {
    responder_json(['ok' => false, 'error' => 'cliente_id requerido'], 422);
}

$stmt = $db->prepare(
    'SELECT c.id, c.nombre, c.apellido, c.email, c.telefono, c.pais, c.ciudad,
            cp.notificaciones_email, cp.notificaciones_push, cp.recordatorios_mantenimiento, cp.idioma, cp.moneda,
            cd.id AS direccion_id, cd.alias AS direccion_alias, cd.direccion, cd.ciudad AS direccion_ciudad, cd.pais AS direccion_pais,
            cd.latitud AS cliente_latitud, cd.longitud AS cliente_longitud
     FROM clientes c
     LEFT JOIN cliente_preferencias cp ON cp.cliente_id = c.id
     LEFT JOIN cliente_direcciones cd ON cd.cliente_id = c.id AND cd.principal = 1
     WHERE c.id = :id
     LIMIT 1'
);
$stmt->execute([':id' => $clienteId]);
$cliente = $stmt->fetch();

if (!$cliente) {
    responder_json(['ok' => false, 'error' => 'Cliente no encontrado'], 404);
}

$stmt = $db->prepare(
    'SELECT id, tipo, marca, modelo, anio, patente, kilometraje_actual, salud_porcentaje, proximo_servicio, proximo_kilometraje, notas
     FROM vehiculos
     WHERE cliente_id = :cliente_id AND activo = 1
     ORDER BY id DESC'
);
$stmt->execute([':cliente_id' => $clienteId]);
$vehiculos = array_map(function (array $vehiculo) use ($db): array {
    $stmtHistorial = $db->prepare(
        'SELECT h.fecha_servicio, h.titulo, h.costo_total, t.nombre_comercial AS taller
         FROM historial_servicios h
         LEFT JOIN talleres t ON t.id = h.taller_id
         WHERE h.vehiculo_id = :vehiculo_id
         ORDER BY h.fecha_servicio DESC
         LIMIT 20'
    );
    $stmtHistorial->execute([':vehiculo_id' => $vehiculo['id']]);

    $notas = json_decode((string) ($vehiculo['notas'] ?? ''), true);
    if (!is_array($notas)) {
        $notas = [];
    }

    return [
        'id' => (int) $vehiculo['id'],
        'tipo' => $vehiculo['tipo'],
        'marca' => $vehiculo['marca'],
        'modelo' => $vehiculo['modelo'],
        'anio' => $vehiculo['anio'] ? (int) $vehiculo['anio'] : null,
        'patente' => $vehiculo['patente'] ?: '',
        'km' => (int) $vehiculo['kilometraje_actual'],
        'salud' => $vehiculo['salud_porcentaje'] ? (int) $vehiculo['salud_porcentaje'] : 100,
        'proximo_servicio' => $vehiculo['proximo_servicio'] ?: 'Primer control preventivo',
        'proximo_km' => $vehiculo['proximo_kilometraje'] ? (int) $vehiculo['proximo_kilometraje'] : ((int) $vehiculo['kilometraje_actual'] + 5000),
        'combustible' => $notas['combustible'] ?? '',
        'version' => $notas['version'] ?? '',
        'motor' => $notas['motor'] ?? '',
        'color' => $notas['color'] ?? '',
        'numero_matricula' => $notas['numero_matricula'] ?? '',
        'historial' => array_map(fn (array $item): array => [
            'fecha' => fecha_tarjeta($item['fecha_servicio']),
            'servicio' => $item['titulo'],
            'costo' => (float) ($item['costo_total'] ?? 0),
            'taller' => $item['taller'] ?: 'Sin taller asignado',
        ], $stmtHistorial->fetchAll()),
    ];
}, $stmt->fetchAll());

$stmt = $db->prepare(
    'SELECT id, vehiculo_id, ultimo_mensaje_at, creado_at
     FROM conversaciones
     WHERE cliente_id = :cliente_id AND tipo = "ia" AND estado = "abierta"
     ORDER BY id DESC LIMIT 1'
);
$stmt->execute([':cliente_id' => $clienteId]);
$chatIaDb = $stmt->fetch();
$mensajesIa = [];
if ($chatIaDb) {
    $stmt = $db->prepare(
        'SELECT id, emisor_tipo, contenido, creado_at FROM mensajes
         WHERE conversacion_id = :id ORDER BY creado_at ASC, id ASC'
    );
    $stmt->execute([':id' => $chatIaDb['id']]);
    $mensajesIaDb = $stmt->fetchAll();
    $adjuntosPorMensaje = [];
    $idsMensajes = array_map(static fn (array $mensaje): int => (int) $mensaje['id'], $mensajesIaDb);
    if ($idsMensajes) {
        $stmt = $db->query(
            'SELECT entidad_id AS mensaje_id, nombre_original, mime_type, url, tamanio_bytes
             FROM archivos_adjuntos
             WHERE entidad_tipo = "mensaje" AND entidad_id IN (' . implode(',', $idsMensajes) . ')
             ORDER BY id ASC'
        );
        foreach ($stmt->fetchAll() as $adjunto) {
            $mensajeId = (int) $adjunto['mensaje_id'];
            $adjuntosPorMensaje[$mensajeId][] = [
                'tipo' => str_starts_with((string) $adjunto['mime_type'], 'video/') ? 'video' : 'imagen',
                'nombre' => $adjunto['nombre_original'],
                'mime' => $adjunto['mime_type'],
                'tamano' => (int) $adjunto['tamanio_bytes'],
                'url' => asistigo_url_publica('backend/' . ltrim($adjunto['url'], '/')),
            ];
        }
    }
    $mensajesIa = array_map(fn (array $mensaje): array => [
        'id' => (int) $mensaje['id'],
        'from' => $mensaje['emisor_tipo'] === 'cliente' ? 'out' : 'in',
        'text' => $mensaje['contenido'],
        'time' => hora_corta($mensaje['creado_at']),
        'attachments' => $adjuntosPorMensaje[(int) $mensaje['id']] ?? [],
    ], $mensajesIaDb);
}
$ultimoIa = end($mensajesIa) ?: null;
$chatIa = [
    'id' => 'ia',
    'conversacion_id' => $chatIaDb ? (int) $chatIaDb['id'] : null,
    'vehiculo_id' => $chatIaDb && $chatIaDb['vehiculo_id'] ? (int) $chatIaDb['vehiculo_id'] : ($vehiculos[0]['id'] ?? null),
    'nombre' => 'Asistente IA AsistiGo',
    'ia' => true,
    'ultimo' => $ultimoIa['text'] ?? 'Contame que sintoma notas y te ayudo a interpretarlo.',
    'hora' => $chatIaDb && $chatIaDb['ultimo_mensaje_at'] ? mecanico_fecha_tarjeta_chat($chatIaDb['ultimo_mensaje_at']) : 'Ahora',
    'mensajes' => $mensajesIa ?: [
        ['from' => 'in', 'text' => 'Hola, soy tu asistente. Puedo ayudarte con sintomas, mantenimiento y alertas.', 'time' => date('H:i')],
    ],
];

$stmt = $db->query(
    'SELECT t.id, t.nombre_comercial, t.especialidad, t.descripcion, t.rating_promedio, t.total_calificaciones,
            t.ciudad, t.direccion, t.latitud, t.longitud, t.radio_cobertura_km, t.modalidad_atencion, t.ofrece_urgencias,
            GROUP_CONCAT(ts.nombre ORDER BY ts.nombre SEPARATOR ",") AS servicios
     FROM talleres t
     LEFT JOIN taller_servicios ts ON ts.taller_id = t.id AND ts.activo = 1
     WHERE t.estado = "activo"
     GROUP BY t.id
     ORDER BY t.id DESC'
);
$clienteLatitud = $cliente['cliente_latitud'] !== null ? (float) $cliente['cliente_latitud'] : null;
$clienteLongitud = $cliente['cliente_longitud'] !== null ? (float) $cliente['cliente_longitud'] : null;

$talleres = array_map(function (array $taller) use ($db, $clienteLatitud, $clienteLongitud): array {
    $stmtServicios = $db->prepare(
        'SELECT id, nombre, categoria, precio_base, duracion_minutos
         FROM taller_servicios
         WHERE taller_id = :taller_id AND activo = 1
         ORDER BY nombre'
    );
    $stmtServicios->execute([':taller_id' => $taller['id']]);
    $servicios = array_map(fn (array $servicio): array => [
        'id' => (int) $servicio['id'],
        'nombre' => $servicio['nombre'],
        'categoria' => $servicio['categoria'] ?: 'General',
        'precio_base' => $servicio['precio_base'] !== null ? (float) $servicio['precio_base'] : null,
        'duracion_minutos' => $servicio['duracion_minutos'] !== null ? (int) $servicio['duracion_minutos'] : null,
    ], $stmtServicios->fetchAll());

    $distancia = distancia_km(
        $clienteLatitud,
        $clienteLongitud,
        $taller['latitud'] !== null ? (float) $taller['latitud'] : null,
        $taller['longitud'] !== null ? (float) $taller['longitud'] : null,
    );
    $radioCobertura = $taller['radio_cobertura_km'] !== null ? (float) $taller['radio_cobertura_km'] : null;
    $radioEfectivo = $radioCobertura !== null ? min($radioCobertura, RADIO_BUSQUEDA_KM_DEFAULT) : RADIO_BUSQUEDA_KM_DEFAULT;
    $enCobertura = $distancia === null ? true : $distancia <= $radioEfectivo;

    return [
        'id' => (int) $taller['id'],
        'nombre' => $taller['nombre_comercial'],
        'especialidad' => $taller['especialidad'] ?: 'Mecanica general',
        'descripcion' => $taller['descripcion'] ?: '',
        'rating' => (float) ($taller['rating_promedio'] ?: 0),
        'total_calificaciones' => (int) ($taller['total_calificaciones'] ?: 0),
        'ciudad' => $taller['ciudad'] ?: '',
        'direccion' => $taller['direccion'] ?: '',
        'latitud' => $taller['latitud'] !== null ? (float) $taller['latitud'] : null,
        'longitud' => $taller['longitud'] !== null ? (float) $taller['longitud'] : null,
        'modalidad' => $taller['modalidad_atencion'],
        'urgencias' => (bool) $taller['ofrece_urgencias'],
        'distancia' => $distancia,
        'distancia_real' => $distancia !== null,
        'en_cobertura' => $enCobertura,
        'abierto' => true,
        'servicios' => $servicios,
        'tags' => array_column($servicios, 'nombre') ?: array_values(array_filter(explode(',', (string) $taller['servicios']))) ?: ['General'],
    ];
}, $stmt->fetchAll());

$talleres = array_values(array_filter($talleres, fn (array $taller): bool => $taller['en_cobertura']));

$stmt = $db->prepare(
    'SELECT tu.id, tu.fecha, tu.hora, tu.servicio_descripcion, tu.estado, tu.taller_id, tu.vehiculo_id, tu.taller_servicio_id,
            ta.nombre_comercial AS taller,
            CONCAT(v.marca, " ", v.modelo, " - ", COALESCE(v.patente, "")) AS vehiculo,
            r.id AS resena_id, r.puntuacion AS resena_puntuacion, r.comentario AS resena_comentario
     FROM turnos tu
     INNER JOIN talleres ta ON ta.id = tu.taller_id
     INNER JOIN vehiculos v ON v.id = tu.vehiculo_id
     LEFT JOIN resenas r ON r.turno_id = tu.id
     WHERE tu.cliente_id = :cliente_id
     ORDER BY tu.fecha DESC, tu.hora DESC'
);
$stmt->execute([':cliente_id' => $clienteId]);
$turnos = [];
$turnosHistorial = [];
foreach ($stmt->fetchAll() as $turno) {
    $item = [
        'id' => (int) $turno['id'],
        'taller_id' => (int) $turno['taller_id'],
        'vehiculo_id' => (int) $turno['vehiculo_id'],
        'taller_servicio_id' => $turno['taller_servicio_id'] ? (int) $turno['taller_servicio_id'] : null,
        'taller' => $turno['taller'],
        'servicio' => $turno['servicio_descripcion'],
        'vehiculo' => $turno['vehiculo'],
        'fecha_iso' => $turno['fecha'],
        'fecha' => fecha_tarjeta($turno['fecha']),
        'hora_raw' => hora_corta($turno['hora']),
        'hora' => hora_corta($turno['hora']),
        'estado' => $turno['estado'],
        'resena' => $turno['resena_id'] ? [
            'id' => (int) $turno['resena_id'],
            'puntuacion' => (int) $turno['resena_puntuacion'],
            'comentario' => $turno['resena_comentario'] ?: '',
        ] : null,
    ];

    if (in_array($turno['estado'], ['completado', 'cancelado', 'no_asistio'], true)) {
        $turnosHistorial[] = $item;
    } else {
        $turnos[] = $item;
    }
}

$stmt = $db->prepare(
    'SELECT p.id, p.solicitud_id, p.titulo, p.descripcion, p.estado, p.total, p.valido_hasta, p.creado_at, ta.nombre_comercial AS taller,
            CONCAT(v.marca, " ", v.modelo, " - ", COALESCE(v.patente, "")) AS vehiculo
     FROM presupuestos p
     INNER JOIN talleres ta ON ta.id = p.taller_id
     INNER JOIN vehiculos v ON v.id = p.vehiculo_id
     WHERE p.cliente_id = :cliente_id
     ORDER BY p.id DESC'
);
$stmt->execute([':cliente_id' => $clienteId]);
$presupuestos = array_map(function (array $presupuesto) use ($db): array {
    $stmtItems = $db->prepare('SELECT detalle, subtotal FROM presupuesto_items WHERE presupuesto_id = :id ORDER BY orden, id');
    $stmtItems->execute([':id' => $presupuesto['id']]);

    return [
        'id' => (int) $presupuesto['id'],
        'solicitud_id' => $presupuesto['solicitud_id'] ? (int) $presupuesto['solicitud_id'] : null,
        'tipo' => 'presupuesto',
        'taller' => $presupuesto['taller'],
        'servicio' => $presupuesto['titulo'],
        'descripcion' => $presupuesto['descripcion'] ?: '',
        'vehiculo' => $presupuesto['vehiculo'],
        'estado' => $presupuesto['estado'],
        'total' => (float) $presupuesto['total'],
        'valido_hasta' => $presupuesto['valido_hasta'] ? fecha_tarjeta($presupuesto['valido_hasta']) : '',
        'creado' => fecha_tarjeta($presupuesto['creado_at']),
        'items' => array_map(fn (array $item): array => [
            'detalle' => $item['detalle'],
            'costo' => (float) $item['subtotal'],
        ], $stmtItems->fetchAll()),
    ];
}, $stmt->fetchAll());

$presupuestosConRespuesta = array_column($presupuestos, 'solicitud_id');
$stmt = $db->prepare(
    'SELECT s.id, s.tipo, s.asunto, s.mensaje, s.estado, s.creado_at,
            ta.nombre_comercial AS taller,
            CONCAT(v.marca, " ", v.modelo, " - ", COALESCE(v.patente, "")) AS vehiculo
     FROM solicitudes s
     INNER JOIN talleres ta ON ta.id = s.taller_id
     INNER JOIN vehiculos v ON v.id = s.vehiculo_id
     LEFT JOIN presupuestos p ON p.solicitud_id = s.id
     WHERE s.cliente_id = :cliente_id
       AND s.tipo IN ("presupuesto", "diagnostico", "urgencia")
       AND p.id IS NULL
     ORDER BY s.id DESC'
);
$stmt->execute([':cliente_id' => $clienteId]);
foreach ($stmt->fetchAll() as $solicitud) {
    if (in_array((int) $solicitud['id'], $presupuestosConRespuesta, true)) {
        continue;
    }

    $presupuestos[] = [
        'id' => 'solicitud-' . $solicitud['id'],
        'solicitud_id' => (int) $solicitud['id'],
        'tipo' => 'solicitud',
        'taller' => $solicitud['taller'],
        'servicio' => $solicitud['asunto'] ?: 'Solicitud de presupuesto',
        'descripcion' => $solicitud['mensaje'] ?: '',
        'vehiculo' => $solicitud['vehiculo'],
        'estado' => match ($solicitud['estado']) {
            'respondida' => 'respondida',
            'cancelada' => 'cancelado',
            'cerrada' => 'completado',
            default => 'solicitado',
        },
        'total' => 0,
        'valido_hasta' => '',
        'creado' => fecha_tarjeta($solicitud['creado_at']),
        'items' => [
            [
                'detalle' => 'Esperando respuesta del taller',
                'costo' => 0,
            ],
        ],
    ];
}

$stmt = $db->prepare(
    'SELECT id, titulo, mensaje, tipo, url_accion, leido_at, creado_at
     FROM notificaciones
     WHERE cliente_id = :cliente_id
     ORDER BY creado_at DESC
     LIMIT 20'
);
$stmt->execute([':cliente_id' => $clienteId]);
$notificaciones = array_map(fn (array $notificacion): array => [
    'id' => (int) $notificacion['id'],
    'titulo' => $notificacion['titulo'],
    'mensaje' => $notificacion['mensaje'] ?: '',
    'tipo' => $notificacion['tipo'],
    'url_accion' => $notificacion['url_accion'] ?: '',
    'leida' => $notificacion['leido_at'] !== null,
    'fecha' => fecha_tarjeta($notificacion['creado_at']),
], $stmt->fetchAll());

$stmt = $db->prepare(
    'SELECT id, vehiculo_id, titulo, descripcion, kilometraje_objetivo, fecha_objetivo, estado
     FROM recordatorios_mantenimiento
     WHERE cliente_id = :cliente_id
     ORDER BY COALESCE(fecha_objetivo, "9999-12-31"), id DESC
     LIMIT 20'
);
$stmt->execute([':cliente_id' => $clienteId]);
$recordatorios = array_map(fn (array $recordatorio): array => [
    'id' => (int) $recordatorio['id'],
    'vehiculo_id' => (int) $recordatorio['vehiculo_id'],
    'titulo' => $recordatorio['titulo'],
    'descripcion' => $recordatorio['descripcion'] ?: '',
    'kilometraje_objetivo' => $recordatorio['kilometraje_objetivo'] ? (int) $recordatorio['kilometraje_objetivo'] : null,
    'fecha_objetivo' => $recordatorio['fecha_objetivo'] ? fecha_tarjeta($recordatorio['fecha_objetivo']) : '',
    'estado' => $recordatorio['estado'],
], $stmt->fetchAll());

$stmt = $db->prepare(
    'SELECT cv.id, cv.taller_id, cv.vehiculo_id, cv.asunto, cv.ultimo_mensaje_at, cv.creado_at,
            t.nombre_comercial
     FROM conversaciones cv
     LEFT JOIN talleres t ON t.id = cv.taller_id
     WHERE cv.cliente_id = :cliente_id AND cv.tipo = "taller"
     ORDER BY COALESCE(cv.ultimo_mensaje_at, cv.creado_at) DESC'
);
$stmt->execute([':cliente_id' => $clienteId]);
$chatsTalleres = array_map(function (array $chat) use ($db): array {
    $stmtMensajes = $db->prepare(
        'SELECT id, emisor_tipo, contenido, leido_at, creado_at
         FROM mensajes
         WHERE conversacion_id = :id
         ORDER BY creado_at ASC, id ASC'
    );
    $stmtMensajes->execute([':id' => $chat['id']]);
    $mensajes = array_map(fn (array $mensaje): array => [
        'id' => (int) $mensaje['id'],
        'from' => $mensaje['emisor_tipo'] === 'cliente' ? 'out' : 'in',
        'text' => $mensaje['contenido'],
        'time' => hora_corta($mensaje['creado_at']),
        'leido' => $mensaje['leido_at'] !== null,
    ], $stmtMensajes->fetchAll());
    $ultimo = end($mensajes) ?: null;

    return [
        'id' => (int) $chat['id'],
        'taller_id' => $chat['taller_id'] ? (int) $chat['taller_id'] : null,
        'vehiculo_id' => $chat['vehiculo_id'] ? (int) $chat['vehiculo_id'] : null,
        'nombre' => $chat['nombre_comercial'] ?: 'Taller AsistiGo',
        'ia' => false,
        'ultimo' => $ultimo['text'] ?? ($chat['asunto'] ?: 'Conversacion abierta'),
        'hora' => $chat['ultimo_mensaje_at'] ? mecanico_fecha_tarjeta_chat($chat['ultimo_mensaje_at']) : '',
        'mensajes' => $mensajes,
    ];
}, $stmt->fetchAll());

function mecanico_fecha_tarjeta_chat(?string $fecha): string
{
    if (!$fecha) {
        return '';
    }

    $ts = strtotime($fecha);
    if (!$ts) {
        return $fecha;
    }

    $hoy = strtotime(date('Y-m-d'));
    $dia = strtotime(date('Y-m-d', $ts));
    $diff = (int) round(($dia - $hoy) / 86400);
    if ($diff === 0) {
        return 'Hoy';
    }
    if ($diff === -1) {
        return 'Ayer';
    }

    return fecha_tarjeta(date('Y-m-d', $ts));
}

responder_json([
    'ok' => true,
    'data' => [
        'perfil' => [
            'id' => (int) $cliente['id'],
            'nombre_solo' => $cliente['nombre'],
            'apellido' => $cliente['apellido'],
            'nombre' => $cliente['nombre'] . ' ' . $cliente['apellido'],
            'inicial' => iniciales($cliente['nombre'], $cliente['apellido']),
            'email' => $cliente['email'],
            'telefono' => $cliente['telefono'] ?: '',
            'pais' => $cliente['pais'] ?: 'Uruguay',
            'ciudad' => $cliente['ciudad'] ?: '',
            'preferencias' => [
                'notificaciones_email' => $cliente['notificaciones_email'] === null ? true : (bool) $cliente['notificaciones_email'],
                'notificaciones_push' => $cliente['notificaciones_push'] === null ? true : (bool) $cliente['notificaciones_push'],
                'recordatorios_mantenimiento' => $cliente['recordatorios_mantenimiento'] === null ? true : (bool) $cliente['recordatorios_mantenimiento'],
                'idioma' => $cliente['idioma'] ?: 'es',
                'moneda' => $cliente['moneda'] ?: 'UYU',
            ],
            'direccion_principal' => [
                'id' => $cliente['direccion_id'] ? (int) $cliente['direccion_id'] : null,
                'alias' => $cliente['direccion_alias'] ?: '',
                'direccion' => $cliente['direccion'] ?: '',
                'ciudad' => $cliente['direccion_ciudad'] ?: '',
                'pais' => $cliente['direccion_pais'] ?: 'Uruguay',
                'latitud' => $cliente['cliente_latitud'] !== null ? (float) $cliente['cliente_latitud'] : null,
                'longitud' => $cliente['cliente_longitud'] !== null ? (float) $cliente['cliente_longitud'] : null,
            ],
        ],
        'vehiculos' => $vehiculos,
        'talleres' => $talleres,
        'turnos' => $turnos,
        'turnosHistorial' => $turnosHistorial,
        'presupuestos' => $presupuestos,
        'notificaciones' => $notificaciones,
        'recordatorios' => $recordatorios,
        'chats' => array_merge([$chatIa], $chatsTalleres),
    ],
]);
