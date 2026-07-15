<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/http.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/notificaciones_service.php';

function mecanico_minutos_desde_texto(string $valor): int
{
    $valor = strtolower(trim($valor));
    if ($valor === '') {
        return 60;
    }

    if (preg_match('/^(\d+)$/', $valor, $m)) {
        return max(1, (int) $m[1]);
    }

    $minutos = 0;
    if (preg_match('/(\d+)\s*h/', $valor, $m)) {
        $minutos += (int) $m[1] * 60;
    }
    if (preg_match('/(\d+)\s*m/', $valor, $m)) {
        $minutos += (int) $m[1];
    }

    return max(1, $minutos ?: 60);
}

function mecanico_duracion_texto(?int $minutos): string
{
    $minutos = $minutos ?: 60;
    if ($minutos < 60) {
        return $minutos . ' min';
    }

    $horas = intdiv($minutos, 60);
    $resto = $minutos % 60;
    return $resto > 0 ? "{$horas}h {$resto}min" : "{$horas}h";
}

function mecanico_fecha_relativa(?string $fecha): string
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
        return 'Hoy, ' . date('H:i', $ts);
    }
    if ($diff === -1) {
        return 'Ayer, ' . date('H:i', $ts);
    }
    if ($diff === 1) {
        return 'Mañana, ' . date('H:i', $ts);
    }

    return fecha_tarjeta(date('Y-m-d', $ts)) . ', ' . date('H:i', $ts);
}

function mecanico_dia_indice(string $fecha): int
{
    $hoy = strtotime(date('Y-m-d'));
    $dia = strtotime($fecha);
    if (!$dia) {
        return 0;
    }

    return max(0, (int) round(($dia - $hoy) / 86400));
}

function mecanico_validar_taller(PDO $db, int $mecanicoId, int $tallerId): array
{
    $stmt = $db->prepare(
        'SELECT t.*, m.nombre AS mecanico_nombre, m.apellido AS mecanico_apellido, m.email AS mecanico_email, m.telefono AS mecanico_telefono
         FROM talleres t
         INNER JOIN taller_mecanicos tm ON tm.taller_id = t.id AND tm.activo = 1
         INNER JOIN mecanicos m ON m.id = tm.mecanico_id
         WHERE tm.mecanico_id = :mecanico_id AND t.id = :taller_id
         LIMIT 1'
    );
    $stmt->execute([':mecanico_id' => $mecanicoId, ':taller_id' => $tallerId]);
    $taller = $stmt->fetch();

    if (!$taller) {
        responder_json(['ok' => false, 'error' => 'Taller no encontrado para este mecanico'], 404);
    }

    return $taller;
}

function mecanico_notificar_cliente(PDO $db, int $clienteId, ?int $tallerId, string $tipo, string $titulo, string $mensaje, string $url): void
{
    notificar_cliente($db, $clienteId, $tallerId, $tipo, $titulo, $mensaje, $url);
}

$db = asistigo_db();

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $mecanicoId = (int) ($_GET['mecanico_id'] ?? 0);
        $tallerId = (int) ($_GET['taller_id'] ?? 0);

        if ($mecanicoId <= 0 || $tallerId <= 0) {
            responder_json(['ok' => false, 'error' => 'mecanico_id y taller_id requeridos'], 422);
        }

        $taller = mecanico_validar_taller($db, $mecanicoId, $tallerId);

        $stmt = $db->prepare(
            'SELECT id, dia_semana, hora_apertura, hora_cierre, activo
             FROM taller_horarios
             WHERE taller_id = :taller_id
             ORDER BY dia_semana'
        );
        $stmt->execute([':taller_id' => $tallerId]);
        $horariosDb = $stmt->fetchAll();
        $dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        $horarios = [];
        for ($i = 1; $i <= 6; $i++) {
            $item = array_values(array_filter($horariosDb, fn (array $h): bool => (int) $h['dia_semana'] === $i))[0] ?? null;
            $horarios[] = [
                'dia' => $dias[$i],
                'dia_semana' => $i,
                'abre' => $item ? hora_corta($item['hora_apertura']) : '08:30',
                'cierra' => $item ? hora_corta($item['hora_cierre']) : '18:00',
                'activo' => $item ? (bool) $item['activo'] : true,
            ];
        }
        $domingo = array_values(array_filter($horariosDb, fn (array $h): bool => (int) $h['dia_semana'] === 0))[0] ?? null;
        $horarios[] = [
            'dia' => 'Domingo',
            'dia_semana' => 0,
            'abre' => $domingo ? hora_corta($domingo['hora_apertura']) : '',
            'cierra' => $domingo ? hora_corta($domingo['hora_cierre']) : '',
            'activo' => $domingo ? (bool) $domingo['activo'] : false,
        ];

        $stmt = $db->prepare(
            'SELECT s.id, s.tipo, s.asunto, s.mensaje, s.estado, s.creado_at,
                    c.id AS cliente_id, c.nombre, c.apellido, c.telefono, c.email,
                    v.id AS vehiculo_id, v.marca, v.modelo, v.anio, v.patente
             FROM solicitudes s
             INNER JOIN clientes c ON c.id = s.cliente_id
             INNER JOIN vehiculos v ON v.id = s.vehiculo_id
             WHERE s.taller_id = :taller_id
             ORDER BY s.estado = "nueva" DESC, s.id DESC'
        );
        $stmt->execute([':taller_id' => $tallerId]);
        $solicitudes = array_map(fn (array $s): array => [
            'id' => (int) $s['id'],
            'tipo' => $s['tipo'],
            'cliente_id' => (int) $s['cliente_id'],
            'vehiculo_id' => (int) $s['vehiculo_id'],
            'cliente' => trim($s['nombre'] . ' ' . $s['apellido']),
            'vehiculo' => trim($s['marca'] . ' ' . $s['modelo'] . ($s['anio'] ? ' ' . $s['anio'] : '') . ' · ' . ($s['patente'] ?: 'Sin matrícula')),
            'mensaje' => $s['mensaje'],
            'asunto' => $s['asunto'] ?: '',
            'fecha' => mecanico_fecha_relativa($s['creado_at']),
            'estado' => $s['estado'] === 'respondida' ? 'respondida' : ($s['estado'] === 'nueva' ? 'nueva' : $s['estado']),
        ], $stmt->fetchAll());

        $stmt = $db->prepare(
            'SELECT tu.id, tu.solicitud_id, tu.cliente_id, tu.vehiculo_id, tu.taller_servicio_id,
                    tu.fecha, tu.hora, tu.servicio_descripcion, tu.estado, tu.notas_cliente,
                    c.nombre, c.apellido, v.marca, v.modelo, v.patente
             FROM turnos tu
             INNER JOIN clientes c ON c.id = tu.cliente_id
             INNER JOIN vehiculos v ON v.id = tu.vehiculo_id
             WHERE tu.taller_id = :taller_id
             ORDER BY tu.fecha ASC, tu.hora ASC'
        );
        $stmt->execute([':taller_id' => $tallerId]);
        $agenda = array_map(fn (array $t): array => [
            'id' => (int) $t['id'],
            'solicitud_id' => $t['solicitud_id'] ? (int) $t['solicitud_id'] : null,
            'cliente_id' => (int) $t['cliente_id'],
            'vehiculo_id' => (int) $t['vehiculo_id'],
            'servicio_id' => $t['taller_servicio_id'] ? (int) $t['taller_servicio_id'] : null,
            'cliente' => trim($t['nombre'] . ' ' . $t['apellido']),
            'vehiculo' => trim($t['marca'] . ' ' . $t['modelo'] . ' · ' . ($t['patente'] ?: 'Sin matrícula')),
            'servicio' => $t['servicio_descripcion'],
            'fecha' => $t['fecha'],
            'dia' => mecanico_dia_indice($t['fecha']),
            'hora' => hora_corta($t['hora']),
            'estado' => $t['estado'],
        ], $stmt->fetchAll());

        $stmt = $db->prepare(
            'SELECT ts.id, ts.nombre, ts.categoria, ts.precio_base, ts.duracion_minutos
             FROM taller_servicios ts
             WHERE ts.taller_id = :taller_id AND ts.activo = 1
             ORDER BY ts.nombre'
        );
        $stmt->execute([':taller_id' => $tallerId]);
        $servicios = array_map(fn (array $s): array => [
            'id' => (int) $s['id'],
            'nombre' => $s['nombre'],
            'categoria' => $s['categoria'] ?: 'General',
            'precio' => (float) ($s['precio_base'] ?: 0),
            'duracion' => mecanico_duracion_texto($s['duracion_minutos'] ? (int) $s['duracion_minutos'] : null),
        ], $stmt->fetchAll());

        $stmt = $db->prepare(
            'SELECT p.id, p.solicitud_id, p.cliente_id, p.vehiculo_id, p.titulo, p.estado, p.total,
                    c.nombre, c.apellido, v.marca, v.modelo, v.patente
             FROM presupuestos p
             INNER JOIN clientes c ON c.id = p.cliente_id
             INNER JOIN vehiculos v ON v.id = p.vehiculo_id
             WHERE p.taller_id = :taller_id
             ORDER BY p.id DESC'
        );
        $stmt->execute([':taller_id' => $tallerId]);
        $presupuestos = array_map(function (array $p) use ($db): array {
            $stmtItems = $db->prepare('SELECT detalle, subtotal FROM presupuesto_items WHERE presupuesto_id = :id ORDER BY orden, id');
            $stmtItems->execute([':id' => $p['id']]);

            return [
                'id' => (int) $p['id'],
                'solicitud_id' => $p['solicitud_id'] ? (int) $p['solicitud_id'] : null,
                'cliente_id' => (int) $p['cliente_id'],
                'vehiculo_id' => (int) $p['vehiculo_id'],
                'cliente' => trim($p['nombre'] . ' ' . $p['apellido']),
                'vehiculo' => trim($p['marca'] . ' ' . $p['modelo'] . ' · ' . ($p['patente'] ?: 'Sin matrícula')),
                'servicio' => $p['titulo'],
                'estado' => $p['estado'],
                'items' => array_map(fn (array $item): array => [
                    'detalle' => $item['detalle'],
                    'costo' => (float) $item['subtotal'],
                ], $stmtItems->fetchAll()),
                'total' => (float) $p['total'],
            ];
        }, $stmt->fetchAll());

        $stmt = $db->prepare(
            'SELECT DISTINCT c.id AS cliente_id, c.nombre, c.apellido, c.telefono, c.email,
                    v.id AS vehiculo_id, v.marca, v.modelo, v.anio, v.patente, v.kilometraje_actual
             FROM clientes c
             INNER JOIN vehiculos v ON v.cliente_id = c.id
             WHERE EXISTS (SELECT 1 FROM turnos tu WHERE tu.taller_id = :taller_id_turnos AND tu.vehiculo_id = v.id)
                OR EXISTS (SELECT 1 FROM solicitudes s WHERE s.taller_id = :taller_id_solicitudes AND s.vehiculo_id = v.id)
                OR EXISTS (SELECT 1 FROM historial_servicios h WHERE h.taller_id = :taller_id_historial AND h.vehiculo_id = v.id)
             ORDER BY c.nombre, v.marca'
        );
        $stmt->execute([
            ':taller_id_turnos' => $tallerId,
            ':taller_id_solicitudes' => $tallerId,
            ':taller_id_historial' => $tallerId,
        ]);
        $clientes = array_map(function (array $c) use ($db, $tallerId): array {
            $stmtHistorial = $db->prepare(
                'SELECT h.id, h.fecha_servicio, h.titulo, h.kilometraje, h.costo_total, COALESCE(ts.categoria, "General") AS categoria
                 FROM historial_servicios h
                 LEFT JOIN taller_servicios ts ON ts.id = h.taller_servicio_id
                 WHERE h.taller_id = :taller_id AND h.vehiculo_id = :vehiculo_id
                 ORDER BY h.fecha_servicio DESC, h.id DESC'
            );
            $stmtHistorial->execute([':taller_id' => $tallerId, ':vehiculo_id' => $c['vehiculo_id']]);
            $historial = array_map(fn (array $h): array => [
                'id' => (int) $h['id'],
                'fecha' => fecha_tarjeta($h['fecha_servicio']),
                'servicio' => $h['titulo'],
                'km' => $h['kilometraje'] ? (int) $h['kilometraje'] : (int) $c['kilometraje_actual'],
                'costo' => (float) ($h['costo_total'] ?: 0),
                'etiquetas' => [$h['categoria'] ?: 'General'],
            ], $stmtHistorial->fetchAll());

            $stmtDiagnosticos = $db->prepare(
                'SELECT id, descripcion, recomendacion, creado_at
                 FROM diagnosticos
                 WHERE taller_id = :taller_id AND vehiculo_id = :vehiculo_id
                 ORDER BY id DESC'
            );
            $stmtDiagnosticos->execute([':taller_id' => $tallerId, ':vehiculo_id' => $c['vehiculo_id']]);
            $diagnosticos = array_map(fn (array $d): array => [
                'id' => (int) $d['id'],
                'fecha' => fecha_tarjeta($d['creado_at']),
                'descripcion' => trim($d['descripcion'] . ($d['recomendacion'] ? ' ' . $d['recomendacion'] : '')),
            ], $stmtDiagnosticos->fetchAll());

            $stmtFotos = $db->prepare(
                'SELECT h.titulo AS servicio, fs.tipo
                 FROM fotos_servicio fs
                 INNER JOIN historial_servicios h ON h.id = fs.historial_servicio_id
                 WHERE h.taller_id = :taller_id AND h.vehiculo_id = :vehiculo_id'
            );
            $stmtFotos->execute([':taller_id' => $tallerId, ':vehiculo_id' => $c['vehiculo_id']]);
            $fotosAgrupadas = [];
            foreach ($stmtFotos->fetchAll() as $foto) {
                $servicio = $foto['servicio'];
                $fotosAgrupadas[$servicio] ??= ['servicio' => $servicio, 'antes' => false, 'despues' => false];
                if ($foto['tipo'] === 'antes') {
                    $fotosAgrupadas[$servicio]['antes'] = true;
                }
                if ($foto['tipo'] === 'despues') {
                    $fotosAgrupadas[$servicio]['despues'] = true;
                }
            }

            return [
                'id' => (int) $c['vehiculo_id'],
                'cliente_id' => (int) $c['cliente_id'],
                'vehiculo_id' => (int) $c['vehiculo_id'],
                'nombre' => trim($c['nombre'] . ' ' . $c['apellido']),
                'vehiculo' => trim($c['marca'] . ' ' . $c['modelo'] . ($c['anio'] ? ' ' . $c['anio'] : '')),
                'patente' => $c['patente'] ?: 'Sin matrícula',
                'km' => (int) $c['kilometraje_actual'],
                'visitas' => count($historial),
                'historial' => $historial,
                'diagnosticos' => $diagnosticos,
                'fotos' => array_values($fotosAgrupadas),
                'telefono' => $c['telefono'] ?: '',
                'correo' => $c['email'],
            ];
        }, $stmt->fetchAll());

        $stmt = $db->prepare(
            'SELECT cv.id, cv.cliente_id, cv.vehiculo_id, cv.asunto, cv.ultimo_mensaje_at, c.nombre, c.apellido
             FROM conversaciones cv
             LEFT JOIN clientes c ON c.id = cv.cliente_id
             WHERE cv.taller_id = :taller_id AND cv.tipo = "taller"
             ORDER BY COALESCE(cv.ultimo_mensaje_at, cv.creado_at) DESC'
        );
        $stmt->execute([':taller_id' => $tallerId]);
        $chats = array_map(function (array $chat) use ($db): array {
            $stmtMensajes = $db->prepare(
                'SELECT id, emisor_tipo, contenido, leido_at, creado_at
                 FROM mensajes
                 WHERE conversacion_id = :id
                 ORDER BY creado_at ASC, id ASC'
            );
            $stmtMensajes->execute([':id' => $chat['id']]);
            $mensajes = array_map(fn (array $m): array => [
                'id' => (int) $m['id'],
                'de' => $m['emisor_tipo'] === 'cliente' ? 'entrada' : 'salida',
                'texto' => $m['contenido'],
                'hora' => hora_corta($m['creado_at']),
                'leido' => $m['leido_at'] !== null,
            ], $stmtMensajes->fetchAll());
            $ultimo = end($mensajes) ?: null;

            return [
                'id' => (int) $chat['id'],
                'cliente_id' => $chat['cliente_id'] ? (int) $chat['cliente_id'] : null,
                'vehiculo_id' => $chat['vehiculo_id'] ? (int) $chat['vehiculo_id'] : null,
                'nombre' => trim(($chat['nombre'] ?: 'Cliente') . ' ' . ($chat['apellido'] ?: '')),
                'ultimo' => $ultimo['texto'] ?? ($chat['asunto'] ?: 'Conversacion abierta'),
                'hora' => $chat['ultimo_mensaje_at'] ? mecanico_fecha_relativa($chat['ultimo_mensaje_at']) : '',
                'sinLeer' => count(array_filter($mensajes, fn (array $m): bool => $m['de'] === 'entrada' && !$m['leido'])) > 0,
                'mensajes' => $mensajes,
            ];
        }, $stmt->fetchAll());

        $stmt = $db->prepare(
            'SELECT id, tipo, titulo, mensaje, leido_at, creado_at
             FROM notificaciones
             WHERE (taller_id = :taller_id AND cliente_id IS NULL) OR mecanico_id = :mecanico_id
             ORDER BY creado_at DESC
             LIMIT 30'
        );
        $stmt->execute([':taller_id' => $tallerId, ':mecanico_id' => $mecanicoId]);
        $notificaciones = array_map(fn (array $n): array => [
            'id' => (int) $n['id'],
            'tipo' => $n['tipo'],
            'titulo' => $n['titulo'],
            'mensaje' => $n['mensaje'] ?: '',
            'leida' => $n['leido_at'] !== null,
            'fecha' => mecanico_fecha_relativa($n['creado_at']),
        ], $stmt->fetchAll());

        $facturadoMes = (float) $db->query('SELECT COALESCE(SUM(costo_total), 0) FROM historial_servicios WHERE taller_id = ' . (int) $tallerId . ' AND fecha_servicio >= DATE_FORMAT(CURDATE(), "%Y-%m-01")')->fetchColumn();
        $serviciosMes = (int) $db->query('SELECT COUNT(*) FROM historial_servicios WHERE taller_id = ' . (int) $tallerId . ' AND fecha_servicio >= DATE_FORMAT(CURDATE(), "%Y-%m-01")')->fetchColumn();
        $presupuestosTotal = count($presupuestos);
        $presupuestosAceptados = count(array_filter($presupuestos, fn (array $p): bool => $p['estado'] === 'aceptado'));

        responder_json([
            'ok' => true,
            'data' => [
                'taller' => [
                    'id' => (int) $taller['id'],
                    'nombre' => $taller['nombre_comercial'],
                    'inicial' => iniciales($taller['nombre_comercial']),
                    'mecanico' => trim($taller['mecanico_nombre'] . ' ' . $taller['mecanico_apellido']),
                    'mecanicoInicial' => iniciales($taller['mecanico_nombre'], $taller['mecanico_apellido']),
                    'correo' => $taller['mecanico_email'],
                    'telefono' => $taller['mecanico_telefono'] ?: '',
                    'especialidad' => $taller['especialidad'] ?: 'Mecánica general',
                    'direccion' => $taller['direccion'] ?: $taller['ubicacion_base'] ?: '',
                    'descripcion' => $taller['descripcion'] ?: '',
                    'ciudad' => $taller['ciudad'] ?: '',
                    'rating' => (float) $taller['rating_promedio'],
                    'total_calificaciones' => (int) $taller['total_calificaciones'],
                ],
                'solicitudes' => $solicitudes,
                'agenda' => $agenda,
                'clientes' => $clientes,
                'servicios' => $servicios,
                'presupuestos' => $presupuestos,
                'chats' => $chats,
                'horarios' => $horarios,
                'notificaciones' => $notificaciones,
                'estadisticas' => [
                    'facturado_mes' => $facturadoMes,
                    'servicios_mes' => $serviciosMes,
                    'clientes_activos' => count($clientes),
                    'presupuestos_aceptados_pct' => $presupuestosTotal > 0 ? round(($presupuestosAceptados / $presupuestosTotal) * 100) : 0,
                ],
            ],
        ]);
    }

    $data = leer_json();
    $accion = limpiar_texto($data['accion'] ?? '');
    $mecanicoId = (int) ($data['mecanico_id'] ?? 0);
    $tallerId = (int) ($data['taller_id'] ?? 0);

    if ($mecanicoId <= 0 || $tallerId <= 0) {
        responder_json(['ok' => false, 'error' => 'mecanico_id y taller_id requeridos'], 422);
    }

    $taller = mecanico_validar_taller($db, $mecanicoId, $tallerId);

    if ($accion === 'descartar_solicitud') {
        $id = (int) ($data['id'] ?? 0);
        $consulta = $db->prepare('SELECT cliente_id, tipo FROM solicitudes WHERE id = :id AND taller_id = :taller_id LIMIT 1');
        $consulta->execute([':id' => $id, ':taller_id' => $tallerId]);
        $solicitud = $consulta->fetch();
        $stmt = $db->prepare('UPDATE solicitudes SET estado = "rechazada" WHERE id = :id AND taller_id = :taller_id');
        $stmt->execute([':id' => $id, ':taller_id' => $tallerId]);
        if ($solicitud && $stmt->rowCount() > 0) {
            mecanico_notificar_cliente($db, (int) $solicitud['cliente_id'], $tallerId, 'solicitud', 'Solicitud no aceptada', $taller['nombre_comercial'] . ' no pudo aceptar tu solicitud.', $solicitud['tipo'] === 'turno' ? 'turnos' : 'presupuestos');
        }
        responder_json(['ok' => true, 'message' => 'Solicitud descartada']);
    }

    if ($accion === 'confirmar_turno') {
        $id = (int) ($data['id'] ?? 0);
        $consulta = $db->prepare('SELECT cliente_id FROM turnos WHERE id = :id AND taller_id = :taller_id LIMIT 1');
        $consulta->execute([':id' => $id, ':taller_id' => $tallerId]);
        $turno = $consulta->fetch();
        $stmt = $db->prepare('UPDATE turnos SET estado = "confirmado" WHERE id = :id AND taller_id = :taller_id');
        $stmt->execute([':id' => $id, ':taller_id' => $tallerId]);
        if ($turno && $stmt->rowCount() > 0) {
            mecanico_notificar_cliente($db, (int) $turno['cliente_id'], $tallerId, 'turno', 'Turno confirmado', 'Tu turno con ' . $taller['nombre_comercial'] . ' fue confirmado.', 'turnos');
        }
        responder_json(['ok' => true, 'message' => 'Turno confirmado']);
    }

    if ($accion === 'completar_turno') {
        $id = (int) ($data['id'] ?? 0);
        $consulta = $db->prepare('SELECT cliente_id FROM turnos WHERE id = :id AND taller_id = :taller_id LIMIT 1');
        $consulta->execute([':id' => $id, ':taller_id' => $tallerId]);
        $turno = $consulta->fetch();
        $stmt = $db->prepare('UPDATE turnos SET estado = "completado" WHERE id = :id AND taller_id = :taller_id AND estado = "confirmado"');
        $stmt->execute([':id' => $id, ':taller_id' => $tallerId]);
        if ($turno && $stmt->rowCount() > 0) {
            mecanico_notificar_cliente($db, (int) $turno['cliente_id'], $tallerId, 'turno', 'Servicio completado', $taller['nombre_comercial'] . ' marco tu turno como completado. Ya puedes calificar la atencion.', 'turnos');
        }
        responder_json(['ok' => true, 'message' => 'Turno completado']);
    }

    if ($accion === 'confirmar_solicitud_turno') {
        $solicitudId = (int) ($data['solicitud_id'] ?? 0);
        $fecha = campo_requerido($data, 'fecha');
        $hora = campo_requerido($data, 'hora');
        $nota = limpiar_texto($data['nota'] ?? '');

        $stmt = $db->prepare(
            'SELECT s.*, v.id AS vehiculo_id
             FROM solicitudes s
             INNER JOIN vehiculos v ON v.id = s.vehiculo_id
             WHERE s.id = :id AND s.taller_id = :taller_id AND s.tipo = "turno"
             LIMIT 1'
        );
        $stmt->execute([':id' => $solicitudId, ':taller_id' => $tallerId]);
        $solicitud = $stmt->fetch();
        if (!$solicitud) {
            responder_json(['ok' => false, 'error' => 'Solicitud no encontrada'], 404);
        }

        $db->beginTransaction();

        $stmt = $db->prepare('SELECT id FROM turnos WHERE solicitud_id = :solicitud_id LIMIT 1');
        $stmt->execute([':solicitud_id' => $solicitudId]);
        $turnoExistente = $stmt->fetch();

        if ($turnoExistente) {
            $stmt = $db->prepare(
                'UPDATE turnos
                 SET fecha = :fecha, hora = :hora, notas_taller = :nota, estado = "confirmado"
                 WHERE id = :id'
            );
            $stmt->execute([':fecha' => $fecha, ':hora' => $hora, ':nota' => $nota ?: null, ':id' => $turnoExistente['id']]);
        } else {
            $stmt = $db->prepare(
                'INSERT INTO turnos
                    (solicitud_id, cliente_id, vehiculo_id, taller_id, fecha, hora, servicio_descripcion, notas_cliente, notas_taller, estado)
                 VALUES
                    (:solicitud_id, :cliente_id, :vehiculo_id, :taller_id, :fecha, :hora, :servicio, :notas_cliente, :nota, "confirmado")'
            );
            $stmt->execute([
                ':solicitud_id' => $solicitudId,
                ':cliente_id' => (int) $solicitud['cliente_id'],
                ':vehiculo_id' => (int) $solicitud['vehiculo_id'],
                ':taller_id' => $tallerId,
                ':fecha' => $fecha,
                ':hora' => $hora,
                ':servicio' => $solicitud['asunto'] ?: substr($solicitud['mensaje'], 0, 160),
                ':notas_cliente' => $solicitud['mensaje'],
                ':nota' => $nota ?: null,
            ]);
        }

        $stmt = $db->prepare('UPDATE solicitudes SET estado = "respondida" WHERE id = :id');
        $stmt->execute([':id' => $solicitudId]);
        mecanico_notificar_cliente($db, (int) $solicitud['cliente_id'], $tallerId, 'turno', 'Turno confirmado', 'Tu turno con ' . $taller['nombre_comercial'] . ' fue confirmado.', 'turnos');

        $db->commit();
        responder_json(['ok' => true, 'message' => 'Turno confirmado']);
    }

    if ($accion === 'crear_turno') {
        $clienteId = (int) ($data['cliente_id'] ?? 0);
        $vehiculoId = (int) ($data['vehiculo_id'] ?? 0);
        $servicio = campo_requerido($data, 'servicio');
        $fecha = campo_requerido($data, 'fecha');
        $hora = campo_requerido($data, 'hora');

        $stmt = $db->prepare(
            'INSERT INTO turnos (cliente_id, vehiculo_id, taller_id, fecha, hora, servicio_descripcion, estado)
             VALUES (:cliente_id, :vehiculo_id, :taller_id, :fecha, :hora, :servicio, "confirmado")'
        );
        $stmt->execute([
            ':cliente_id' => $clienteId,
            ':vehiculo_id' => $vehiculoId,
            ':taller_id' => $tallerId,
            ':fecha' => $fecha,
            ':hora' => $hora,
            ':servicio' => $servicio,
        ]);
        mecanico_notificar_cliente($db, $clienteId, $tallerId, 'turno', 'Nuevo turno agendado', 'El taller agendó un turno para tu vehículo.', 'turnos');
        responder_json(['ok' => true, 'message' => 'Turno agregado']);
    }

    if ($accion === 'enviar_presupuesto') {
        $clienteId = (int) ($data['cliente_id'] ?? 0);
        $vehiculoId = (int) ($data['vehiculo_id'] ?? 0);
        $solicitudId = (int) ($data['solicitud_id'] ?? 0);
        $items = is_array($data['items'] ?? null) ? $data['items'] : [];
        $items = array_values(array_filter($items, fn ($item): bool => is_array($item) && limpiar_texto($item['detalle'] ?? '') !== '' && (float) ($item['costo'] ?? 0) > 0));

        if ($clienteId <= 0 || $vehiculoId <= 0 || count($items) === 0) {
            responder_json(['ok' => false, 'error' => 'Datos de presupuesto invalidos'], 422);
        }

        $total = array_reduce($items, fn (float $carry, array $item): float => $carry + (float) $item['costo'], 0.0);
        $titulo = limpiar_texto($data['titulo'] ?? '') ?: 'Presupuesto del taller';

        $db->beginTransaction();
        $stmt = $db->prepare(
            'INSERT INTO presupuestos (solicitud_id, cliente_id, vehiculo_id, taller_id, titulo, descripcion, total, estado, valido_hasta)
             VALUES (:solicitud_id, :cliente_id, :vehiculo_id, :taller_id, :titulo, :descripcion, :total, "pendiente", DATE_ADD(CURDATE(), INTERVAL 15 DAY))'
        );
        $stmt->execute([
            ':solicitud_id' => $solicitudId > 0 ? $solicitudId : null,
            ':cliente_id' => $clienteId,
            ':vehiculo_id' => $vehiculoId,
            ':taller_id' => $tallerId,
            ':titulo' => $titulo,
            ':descripcion' => limpiar_texto($data['descripcion'] ?? '') ?: null,
            ':total' => $total,
        ]);
        $presupuestoId = (int) $db->lastInsertId();

        $stmt = $db->prepare(
            'INSERT INTO presupuesto_items (presupuesto_id, detalle, cantidad, precio_unitario, subtotal, orden)
             VALUES (:presupuesto_id, :detalle, 1, :precio_unitario, :subtotal, :orden)'
        );
        foreach ($items as $orden => $item) {
            $costoItem = (float) $item['costo'];
            $stmt->execute([
                ':presupuesto_id' => $presupuestoId,
                ':detalle' => limpiar_texto($item['detalle']),
                ':precio_unitario' => $costoItem,
                ':subtotal' => $costoItem,
                ':orden' => $orden,
            ]);
        }

        if ($solicitudId > 0) {
            $stmt = $db->prepare('UPDATE solicitudes SET estado = "respondida" WHERE id = :id AND taller_id = :taller_id');
            $stmt->execute([':id' => $solicitudId, ':taller_id' => $tallerId]);
        }

        mecanico_notificar_cliente($db, $clienteId, $tallerId, 'presupuesto', 'Presupuesto recibido', $taller['nombre_comercial'] . ' te envió un presupuesto.', 'presupuestos');
        $db->commit();

        responder_json(['ok' => true, 'message' => 'Presupuesto enviado', 'id' => $presupuestoId]);
    }

    if ($accion === 'registrar_servicio') {
        $clienteId = (int) ($data['cliente_id'] ?? 0);
        $vehiculoId = (int) ($data['vehiculo_id'] ?? 0);
        $servicioId = (int) ($data['servicio_id'] ?? 0);
        $titulo = campo_requerido($data, 'titulo');
        $km = (int) ($data['km'] ?? 0);
        $costo = (float) ($data['costo'] ?? 0);

        $db->beginTransaction();
        $stmt = $db->prepare(
            'INSERT INTO historial_servicios
                (cliente_id, vehiculo_id, taller_id, taller_servicio_id, titulo, descripcion, fecha_servicio, kilometraje, costo_total, creado_por)
             VALUES
                (:cliente_id, :vehiculo_id, :taller_id, :servicio_id, :titulo, :descripcion, CURDATE(), :km, :costo, "mecanico")'
        );
        $stmt->execute([
            ':cliente_id' => $clienteId,
            ':vehiculo_id' => $vehiculoId,
            ':taller_id' => $tallerId,
            ':servicio_id' => $servicioId > 0 ? $servicioId : null,
            ':titulo' => $titulo,
            ':descripcion' => limpiar_texto($data['descripcion'] ?? '') ?: null,
            ':km' => $km ?: null,
            ':costo' => $costo ?: null,
        ]);

        if ($km > 0) {
            $stmt = $db->prepare('UPDATE vehiculos SET kilometraje_actual = GREATEST(kilometraje_actual, :km) WHERE id = :id');
            $stmt->execute([':km' => $km, ':id' => $vehiculoId]);
        }

        mecanico_notificar_cliente($db, $clienteId, $tallerId, 'servicio', 'Servicio registrado', 'Tu historial fue actualizado por ' . $taller['nombre_comercial'] . '.', 'vehiculos');
        $db->commit();

        responder_json(['ok' => true, 'message' => 'Servicio registrado']);
    }

    if ($accion === 'guardar_diagnostico') {
        $vehiculoId = (int) ($data['vehiculo_id'] ?? 0);
        $descripcion = campo_requerido($data, 'descripcion');
        $stmt = $db->prepare(
            'INSERT INTO diagnosticos (vehiculo_id, taller_id, descripcion, recomendacion, origen)
             VALUES (:vehiculo_id, :taller_id, :descripcion, :recomendacion, "mecanico")'
        );
        $stmt->execute([
            ':vehiculo_id' => $vehiculoId,
            ':taller_id' => $tallerId,
            ':descripcion' => $descripcion,
            ':recomendacion' => limpiar_texto($data['recomendacion'] ?? '') ?: null,
        ]);
        $consulta = $db->prepare('SELECT cliente_id FROM vehiculos WHERE id = :id LIMIT 1');
        $consulta->execute([':id' => $vehiculoId]);
        $vehiculo = $consulta->fetch();
        if ($vehiculo) {
            mecanico_notificar_cliente($db, (int) $vehiculo['cliente_id'], $tallerId, 'diagnostico', 'Nuevo diagnostico', $taller['nombre_comercial'] . ' agrego un diagnostico a tu vehiculo.', 'vehiculos');
        }
        responder_json(['ok' => true, 'message' => 'Diagnóstico guardado']);
    }

    if ($accion === 'guardar_servicio_catalogo') {
        $id = (int) ($data['id'] ?? 0);
        $nombre = campo_requerido($data, 'nombre');
        $categoria = limpiar_texto($data['categoria'] ?? '') ?: 'General';
        $precio = (float) ($data['precio'] ?? 0);
        $duracion = mecanico_minutos_desde_texto(limpiar_texto($data['duracion'] ?? ''));

        if ($id > 0) {
            $stmt = $db->prepare(
                'UPDATE taller_servicios
                 SET nombre = :nombre, categoria = :categoria, precio_base = :precio, duracion_minutos = :duracion
                 WHERE id = :id AND taller_id = :taller_id'
            );
            $stmt->execute([':id' => $id, ':taller_id' => $tallerId, ':nombre' => $nombre, ':categoria' => $categoria, ':precio' => $precio, ':duracion' => $duracion]);
        } else {
            $stmt = $db->prepare(
                'INSERT INTO taller_servicios (taller_id, nombre, categoria, precio_base, duracion_minutos)
                 VALUES (:taller_id, :nombre, :categoria, :precio, :duracion)'
            );
            $stmt->execute([':taller_id' => $tallerId, ':nombre' => $nombre, ':categoria' => $categoria, ':precio' => $precio, ':duracion' => $duracion]);
        }

        responder_json(['ok' => true, 'message' => 'Servicio guardado']);
    }

    if ($accion === 'eliminar_servicio_catalogo') {
        $id = (int) ($data['id'] ?? 0);
        $stmt = $db->prepare('UPDATE taller_servicios SET activo = 0 WHERE id = :id AND taller_id = :taller_id');
        $stmt->execute([':id' => $id, ':taller_id' => $tallerId]);
        responder_json(['ok' => true, 'message' => 'Servicio eliminado']);
    }

    if ($accion === 'guardar_perfil') {
        $stmt = $db->prepare(
            'UPDATE talleres
             SET nombre_comercial = :nombre,
                 especialidad = :especialidad,
                 direccion = :direccion,
                 descripcion = :descripcion,
                 ciudad = :ciudad
             WHERE id = :taller_id'
        );
        $stmt->execute([
            ':taller_id' => $tallerId,
            ':nombre' => campo_requerido($data, 'nombre'),
            ':especialidad' => limpiar_texto($data['especialidad'] ?? '') ?: null,
            ':direccion' => limpiar_texto($data['direccion'] ?? '') ?: null,
            ':descripcion' => limpiar_texto($data['descripcion'] ?? '') ?: null,
            ':ciudad' => limpiar_texto($data['ciudad'] ?? '') ?: null,
        ]);

        $horarios = is_array($data['horarios'] ?? null) ? $data['horarios'] : [];
        $stmt = $db->prepare(
            'INSERT INTO taller_horarios (taller_id, dia_semana, hora_apertura, hora_cierre, activo)
             VALUES (:taller_id, :dia, :abre, :cierra, :activo)
             ON DUPLICATE KEY UPDATE
                hora_apertura = VALUES(hora_apertura),
                hora_cierre = VALUES(hora_cierre),
                activo = VALUES(activo)'
        );
        foreach ($horarios as $horario) {
            if (!is_array($horario)) {
                continue;
            }
            $stmt->execute([
                ':taller_id' => $tallerId,
                ':dia' => (int) ($horario['dia_semana'] ?? 0),
                ':abre' => limpiar_texto($horario['abre'] ?? '') ?: null,
                ':cierra' => limpiar_texto($horario['cierra'] ?? '') ?: null,
                ':activo' => !empty($horario['activo']) ? 1 : 0,
            ]);
        }

        responder_json(['ok' => true, 'message' => 'Perfil actualizado']);
    }

    if ($accion === 'enviar_mensaje') {
        $conversacionId = (int) ($data['conversacion_id'] ?? 0);
        $clienteId = (int) ($data['cliente_id'] ?? 0);
        $vehiculoId = (int) ($data['vehiculo_id'] ?? 0);
        $contenido = campo_requerido($data, 'contenido');

        if ($conversacionId <= 0) {
            if ($clienteId <= 0) {
                responder_json(['ok' => false, 'error' => 'cliente_id requerido para iniciar chat'], 422);
            }
            $stmt = $db->prepare(
                'INSERT INTO conversaciones (cliente_id, taller_id, vehiculo_id, tipo, asunto, ultimo_mensaje_at)
                 VALUES (:cliente_id, :taller_id, :vehiculo_id, "taller", "Chat con taller", NOW())'
            );
            $stmt->execute([':cliente_id' => $clienteId, ':taller_id' => $tallerId, ':vehiculo_id' => $vehiculoId > 0 ? $vehiculoId : null]);
            $conversacionId = (int) $db->lastInsertId();
        } else {
            $consulta = $db->prepare('SELECT cliente_id FROM conversaciones WHERE id = :id AND taller_id = :taller_id LIMIT 1');
            $consulta->execute([':id' => $conversacionId, ':taller_id' => $tallerId]);
            $conversacion = $consulta->fetch();
            if ($conversacion) {
                $clienteId = (int) $conversacion['cliente_id'];
            }
        }

        $stmt = $db->prepare(
            'INSERT INTO mensajes (conversacion_id, emisor_tipo, mecanico_id, contenido)
             VALUES (:conversacion_id, "mecanico", :mecanico_id, :contenido)'
        );
        $stmt->execute([':conversacion_id' => $conversacionId, ':mecanico_id' => $mecanicoId, ':contenido' => $contenido]);

        $stmt = $db->prepare('UPDATE conversaciones SET ultimo_mensaje_at = NOW() WHERE id = :id AND taller_id = :taller_id');
        $stmt->execute([':id' => $conversacionId, ':taller_id' => $tallerId]);

        if ($clienteId > 0) {
            mecanico_notificar_cliente($db, $clienteId, $tallerId, 'chat', 'Nuevo mensaje', $taller['nombre_comercial'] . ' te envio un mensaje.', 'chat');
        }

        responder_json(['ok' => true, 'message' => 'Mensaje enviado', 'conversacion_id' => $conversacionId]);
    }

    if ($accion === 'marcar_notificaciones') {
        $id = (int) ($data['id'] ?? 0);
        if ($id > 0) {
            $stmt = $db->prepare('UPDATE notificaciones SET leido_at = NOW() WHERE id = :id AND ((taller_id = :taller_id AND cliente_id IS NULL) OR mecanico_id = :mecanico_id)');
            $stmt->execute([':id' => $id, ':taller_id' => $tallerId, ':mecanico_id' => $mecanicoId]);
        } else {
            $stmt = $db->prepare('UPDATE notificaciones SET leido_at = NOW() WHERE ((taller_id = :taller_id AND cliente_id IS NULL) OR mecanico_id = :mecanico_id) AND leido_at IS NULL');
            $stmt->execute([':taller_id' => $tallerId, ':mecanico_id' => $mecanicoId]);
        }
        responder_json(['ok' => true, 'message' => 'Notificaciones actualizadas']);
    }

    responder_json(['ok' => false, 'error' => 'Accion no reconocida'], 400);
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
