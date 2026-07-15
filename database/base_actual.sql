-- AsistiGo - esquema inicial portable para MySQL/MariaDB.
-- Importar despues de seleccionar la base de destino. Esto permite usar el
-- mismo archivo tanto con la base local `asistigo` como con MySQL en Railway.

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS archivos_adjuntos;
DROP TABLE IF EXISTS pagos;
DROP TABLE IF EXISTS consultas_ia;
DROP TABLE IF EXISTS recordatorios_mantenimiento;
DROP TABLE IF EXISTS notificacion_envios;
DROP TABLE IF EXISTS push_tokens;
DROP TABLE IF EXISTS notificaciones;
DROP TABLE IF EXISTS resenas;
DROP TABLE IF EXISTS mensajes;
DROP TABLE IF EXISTS conversaciones;
DROP TABLE IF EXISTS fotos_servicio;
DROP TABLE IF EXISTS diagnosticos;
DROP TABLE IF EXISTS historial_servicios;
DROP TABLE IF EXISTS presupuesto_items;
DROP TABLE IF EXISTS presupuestos;
DROP TABLE IF EXISTS turnos;
DROP TABLE IF EXISTS solicitudes;
DROP TABLE IF EXISTS taller_fotos;
DROP TABLE IF EXISTS taller_metodos_pago;
DROP TABLE IF EXISTS taller_tipos_vehiculo;
DROP TABLE IF EXISTS taller_servicios;
DROP TABLE IF EXISTS taller_horarios;
DROP TABLE IF EXISTS taller_mecanicos;
DROP TABLE IF EXISTS talleres;
DROP TABLE IF EXISTS mecanicos;
DROP TABLE IF EXISTS vehiculos;
DROP TABLE IF EXISTS cliente_direcciones;
DROP TABLE IF EXISTS cliente_preferencias;
DROP TABLE IF EXISTS clientes;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- TABLAS DE CLIENTES
-- =========================================================

CREATE TABLE clientes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  apellido VARCHAR(80) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  telefono VARCHAR(40) NULL,
  pais VARCHAR(80) NOT NULL DEFAULT 'Uruguay',
  ciudad VARCHAR(100) NULL,
  password_hash VARCHAR(255) NOT NULL,
  email_verificado_at TIMESTAMP NULL,
  estado ENUM('activo', 'pendiente', 'suspendido', 'eliminado') NOT NULL DEFAULT 'pendiente',
  creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE cliente_preferencias (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id BIGINT UNSIGNED NOT NULL,
  notificaciones_email TINYINT(1) NOT NULL DEFAULT 1,
  notificaciones_push TINYINT(1) NOT NULL DEFAULT 1,
  recordatorios_mantenimiento TINYINT(1) NOT NULL DEFAULT 1,
  idioma VARCHAR(10) NOT NULL DEFAULT 'es',
  moneda VARCHAR(10) NOT NULL DEFAULT 'UYU',
  creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cliente_preferencias_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cliente_direcciones (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id BIGINT UNSIGNED NOT NULL,
  alias VARCHAR(80) NULL,
  direccion VARCHAR(180) NOT NULL,
  ciudad VARCHAR(100) NULL,
  pais VARCHAR(80) NOT NULL DEFAULT 'Uruguay',
  latitud DECIMAL(10, 7) NULL,
  longitud DECIMAL(10, 7) NULL,
  principal TINYINT(1) NOT NULL DEFAULT 0,
  creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cliente_direcciones_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE vehiculos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id BIGINT UNSIGNED NOT NULL,
  tipo ENUM('auto', 'moto', 'utilitario', 'otro') NOT NULL DEFAULT 'auto',
  marca VARCHAR(80) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  anio SMALLINT UNSIGNED NULL,
  patente VARCHAR(30) NULL UNIQUE,
  kilometraje_actual INT UNSIGNED NOT NULL DEFAULT 0,
  salud_porcentaje TINYINT UNSIGNED NULL,
  proximo_servicio VARCHAR(160) NULL,
  proximo_kilometraje INT UNSIGNED NULL,
  notas TEXT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_vehiculos_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  INDEX idx_vehiculos_cliente (cliente_id),
  INDEX idx_vehiculos_patente (patente)
) ENGINE=InnoDB;

-- =========================================================
-- TABLAS DE MECANICOS Y TALLERES
-- =========================================================

CREATE TABLE mecanicos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  apellido VARCHAR(80) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  telefono VARCHAR(40) NULL,
  cedula_identidad VARCHAR(40) NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('duenio', 'administrador', 'mecanico', 'recepcion') NOT NULL DEFAULT 'duenio',
  estado ENUM('activo', 'pendiente', 'suspendido', 'eliminado') NOT NULL DEFAULT 'pendiente',
  verificado_at TIMESTAMP NULL,
  creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE talleres (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  mecanico_responsable_id BIGINT UNSIGNED NULL,
  nombre_comercial VARCHAR(140) NOT NULL,
  nombre_legal VARCHAR(160) NULL,
  documento_legal VARCHAR(80) NULL,
  identificacion_fiscal VARCHAR(80) NULL,
  tipo_prestador ENUM('taller_fisico', 'mecanico_movil', 'taller_y_movil') NOT NULL DEFAULT 'taller_fisico',
  especialidad VARCHAR(160) NULL,
  descripcion TEXT NULL,
  ciudad VARCHAR(100) NULL,
  direccion VARCHAR(180) NULL,
  ubicacion_base VARCHAR(180) NULL,
  latitud DECIMAL(10, 7) NULL,
  longitud DECIMAL(10, 7) NULL,
  modalidad_atencion ENUM('en_taller', 'a_domicilio', 'ambas', 'urgencias') NOT NULL DEFAULT 'en_taller',
  zona_cobertura VARCHAR(180) NULL,
  radio_cobertura_km DECIMAL(6, 2) NULL,
  ofrece_urgencias TINYINT(1) NOT NULL DEFAULT 0,
  datos_urgencia VARCHAR(180) NULL,
  garantia VARCHAR(140) NULL,
  anios_experiencia SMALLINT UNSIGNED NULL,
  logo_url VARCHAR(255) NULL,
  rating_promedio DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
  total_calificaciones INT UNSIGNED NOT NULL DEFAULT 0,
  estado ENUM('activo', 'pendiente', 'suspendido', 'eliminado') NOT NULL DEFAULT 'pendiente',
  creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_talleres_responsable
    FOREIGN KEY (mecanico_responsable_id) REFERENCES mecanicos(id) ON DELETE SET NULL,
  INDEX idx_talleres_ciudad (ciudad),
  INDEX idx_talleres_estado (estado)
) ENGINE=InnoDB;

CREATE TABLE taller_mecanicos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  taller_id BIGINT UNSIGNED NOT NULL,
  mecanico_id BIGINT UNSIGNED NOT NULL,
  rol ENUM('duenio', 'administrador', 'mecanico', 'recepcion') NOT NULL DEFAULT 'mecanico',
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_taller_mecanicos_taller
    FOREIGN KEY (taller_id) REFERENCES talleres(id) ON DELETE CASCADE,
  CONSTRAINT fk_taller_mecanicos_mecanico
    FOREIGN KEY (mecanico_id) REFERENCES mecanicos(id) ON DELETE CASCADE,
  UNIQUE KEY uq_taller_mecanico (taller_id, mecanico_id)
) ENGINE=InnoDB;

CREATE TABLE taller_horarios (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  taller_id BIGINT UNSIGNED NOT NULL,
  dia_semana TINYINT UNSIGNED NOT NULL COMMENT '0 domingo, 1 lunes, 6 sabado',
  hora_apertura TIME NULL,
  hora_cierre TIME NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_taller_horarios_taller
    FOREIGN KEY (taller_id) REFERENCES talleres(id) ON DELETE CASCADE,
  UNIQUE KEY uq_taller_dia (taller_id, dia_semana)
) ENGINE=InnoDB;

CREATE TABLE taller_servicios (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  taller_id BIGINT UNSIGNED NOT NULL,
  nombre VARCHAR(140) NOT NULL,
  categoria VARCHAR(100) NULL,
  descripcion TEXT NULL,
  precio_base DECIMAL(12, 2) NULL,
  duracion_minutos SMALLINT UNSIGNED NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_taller_servicios_taller
    FOREIGN KEY (taller_id) REFERENCES talleres(id) ON DELETE CASCADE,
  INDEX idx_taller_servicios_taller (taller_id)
) ENGINE=InnoDB;

CREATE TABLE taller_tipos_vehiculo (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  taller_id BIGINT UNSIGNED NOT NULL,
  tipo_vehiculo ENUM('auto', 'moto', 'utilitario', 'otro') NOT NULL,
  CONSTRAINT fk_taller_tipos_vehiculo_taller
    FOREIGN KEY (taller_id) REFERENCES talleres(id) ON DELETE CASCADE,
  UNIQUE KEY uq_taller_tipo_vehiculo (taller_id, tipo_vehiculo)
) ENGINE=InnoDB;

CREATE TABLE taller_metodos_pago (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  taller_id BIGINT UNSIGNED NOT NULL,
  metodo ENUM('efectivo', 'transferencia', 'tarjeta', 'mercado_pago', 'otro') NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT fk_taller_metodos_pago_taller
    FOREIGN KEY (taller_id) REFERENCES talleres(id) ON DELETE CASCADE,
  UNIQUE KEY uq_taller_metodo_pago (taller_id, metodo)
) ENGINE=InnoDB;

CREATE TABLE taller_fotos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  taller_id BIGINT UNSIGNED NOT NULL,
  url VARCHAR(255) NOT NULL,
  descripcion VARCHAR(180) NULL,
  orden SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_taller_fotos_taller
    FOREIGN KEY (taller_id) REFERENCES talleres(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- TABLAS COMPARTIDAS ENTRE CLIENTES Y MECANICOS
-- =========================================================

CREATE TABLE solicitudes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id BIGINT UNSIGNED NOT NULL,
  vehiculo_id BIGINT UNSIGNED NOT NULL,
  taller_id BIGINT UNSIGNED NULL,
  tipo ENUM('turno', 'presupuesto', 'diagnostico', 'urgencia') NOT NULL,
  asunto VARCHAR(160) NULL,
  mensaje TEXT NOT NULL,
  estado ENUM('nueva', 'respondida', 'aceptada', 'rechazada', 'cancelada', 'cerrada') NOT NULL DEFAULT 'nueva',
  creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_solicitudes_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  CONSTRAINT fk_solicitudes_vehiculo
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE,
  CONSTRAINT fk_solicitudes_taller
    FOREIGN KEY (taller_id) REFERENCES talleres(id) ON DELETE SET NULL,
  INDEX idx_solicitudes_estado (estado),
  INDEX idx_solicitudes_taller (taller_id)
) ENGINE=InnoDB;

CREATE TABLE turnos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  solicitud_id BIGINT UNSIGNED NULL,
  cliente_id BIGINT UNSIGNED NOT NULL,
  vehiculo_id BIGINT UNSIGNED NOT NULL,
  taller_id BIGINT UNSIGNED NOT NULL,
  taller_servicio_id BIGINT UNSIGNED NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  servicio_descripcion VARCHAR(180) NOT NULL,
  notas_cliente TEXT NULL,
  notas_taller TEXT NULL,
  estado ENUM('pendiente', 'confirmado', 'en_proceso', 'completado', 'cancelado', 'no_asistio') NOT NULL DEFAULT 'pendiente',
  creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_turnos_solicitud
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE SET NULL,
  CONSTRAINT fk_turnos_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  CONSTRAINT fk_turnos_vehiculo
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE,
  CONSTRAINT fk_turnos_taller
    FOREIGN KEY (taller_id) REFERENCES talleres(id) ON DELETE CASCADE,
  CONSTRAINT fk_turnos_servicio
    FOREIGN KEY (taller_servicio_id) REFERENCES taller_servicios(id) ON DELETE SET NULL,
  INDEX idx_turnos_agenda (taller_id, fecha, hora),
  INDEX idx_turnos_cliente (cliente_id, fecha)
) ENGINE=InnoDB;

CREATE TABLE presupuestos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  solicitud_id BIGINT UNSIGNED NULL,
  cliente_id BIGINT UNSIGNED NOT NULL,
  vehiculo_id BIGINT UNSIGNED NOT NULL,
  taller_id BIGINT UNSIGNED NOT NULL,
  titulo VARCHAR(180) NOT NULL,
  descripcion TEXT NULL,
  moneda VARCHAR(10) NOT NULL DEFAULT 'UYU',
  total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  valido_hasta DATE NULL,
  estado ENUM('borrador', 'enviado', 'pendiente', 'aceptado', 'rechazado', 'vencido', 'cancelado') NOT NULL DEFAULT 'borrador',
  creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_presupuestos_solicitud
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE SET NULL,
  CONSTRAINT fk_presupuestos_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  CONSTRAINT fk_presupuestos_vehiculo
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE,
  CONSTRAINT fk_presupuestos_taller
    FOREIGN KEY (taller_id) REFERENCES talleres(id) ON DELETE CASCADE,
  INDEX idx_presupuestos_estado (estado),
  INDEX idx_presupuestos_taller (taller_id)
) ENGINE=InnoDB;

CREATE TABLE presupuesto_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  presupuesto_id BIGINT UNSIGNED NOT NULL,
  detalle VARCHAR(180) NOT NULL,
  cantidad DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
  precio_unitario DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  orden SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_presupuesto_items_presupuesto
    FOREIGN KEY (presupuesto_id) REFERENCES presupuestos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE historial_servicios (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id BIGINT UNSIGNED NOT NULL,
  vehiculo_id BIGINT UNSIGNED NOT NULL,
  taller_id BIGINT UNSIGNED NULL,
  turno_id BIGINT UNSIGNED NULL,
  taller_servicio_id BIGINT UNSIGNED NULL,
  titulo VARCHAR(180) NOT NULL,
  descripcion TEXT NULL,
  fecha_servicio DATE NOT NULL,
  kilometraje INT UNSIGNED NULL,
  costo_total DECIMAL(12, 2) NULL,
  creado_por ENUM('cliente', 'mecanico', 'sistema') NOT NULL DEFAULT 'mecanico',
  creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_historial_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  CONSTRAINT fk_historial_vehiculo
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE,
  CONSTRAINT fk_historial_taller
    FOREIGN KEY (taller_id) REFERENCES talleres(id) ON DELETE SET NULL,
  CONSTRAINT fk_historial_turno
    FOREIGN KEY (turno_id) REFERENCES turnos(id) ON DELETE SET NULL,
  CONSTRAINT fk_historial_servicio
    FOREIGN KEY (taller_servicio_id) REFERENCES taller_servicios(id) ON DELETE SET NULL,
  INDEX idx_historial_vehiculo_fecha (vehiculo_id, fecha_servicio)
) ENGINE=InnoDB;

CREATE TABLE diagnosticos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  historial_servicio_id BIGINT UNSIGNED NULL,
  vehiculo_id BIGINT UNSIGNED NOT NULL,
  taller_id BIGINT UNSIGNED NULL,
  descripcion TEXT NOT NULL,
  recomendacion TEXT NULL,
  origen ENUM('mecanico', 'ia', 'cliente') NOT NULL DEFAULT 'mecanico',
  creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_diagnosticos_historial
    FOREIGN KEY (historial_servicio_id) REFERENCES historial_servicios(id) ON DELETE SET NULL,
  CONSTRAINT fk_diagnosticos_vehiculo
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE,
  CONSTRAINT fk_diagnosticos_taller
    FOREIGN KEY (taller_id) REFERENCES talleres(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE fotos_servicio (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  historial_servicio_id BIGINT UNSIGNED NOT NULL,
  tipo ENUM('antes', 'despues', 'general') NOT NULL DEFAULT 'general',
  url VARCHAR(255) NOT NULL,
  descripcion VARCHAR(180) NULL,
  creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fotos_servicio_historial
    FOREIGN KEY (historial_servicio_id) REFERENCES historial_servicios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE conversaciones (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id BIGINT UNSIGNED NULL,
  taller_id BIGINT UNSIGNED NULL,
  vehiculo_id BIGINT UNSIGNED NULL,
  tipo ENUM('ia', 'taller', 'soporte') NOT NULL DEFAULT 'taller',
  asunto VARCHAR(180) NULL,
  estado ENUM('abierta', 'cerrada', 'archivada') NOT NULL DEFAULT 'abierta',
  ultimo_mensaje_at TIMESTAMP NULL,
  creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_conversaciones_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
  CONSTRAINT fk_conversaciones_taller
    FOREIGN KEY (taller_id) REFERENCES talleres(id) ON DELETE SET NULL,
  CONSTRAINT fk_conversaciones_vehiculo
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE mensajes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  conversacion_id BIGINT UNSIGNED NOT NULL,
  emisor_tipo ENUM('cliente', 'mecanico', 'ia', 'sistema') NOT NULL,
  cliente_id BIGINT UNSIGNED NULL,
  mecanico_id BIGINT UNSIGNED NULL,
  contenido TEXT NOT NULL,
  leido_at TIMESTAMP NULL,
  creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mensajes_conversacion
    FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE,
  CONSTRAINT fk_mensajes_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
  CONSTRAINT fk_mensajes_mecanico
    FOREIGN KEY (mecanico_id) REFERENCES mecanicos(id) ON DELETE SET NULL,
  INDEX idx_mensajes_conversacion (conversacion_id, creado_at)
) ENGINE=InnoDB;

CREATE TABLE resenas (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id BIGINT UNSIGNED NOT NULL,
  taller_id BIGINT UNSIGNED NOT NULL,
  turno_id BIGINT UNSIGNED NULL,
  puntuacion TINYINT UNSIGNED NOT NULL,
  comentario TEXT NULL,
  estado ENUM('publicada', 'oculta', 'pendiente_revision') NOT NULL DEFAULT 'publicada',
  creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_resenas_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  CONSTRAINT fk_resenas_taller
    FOREIGN KEY (taller_id) REFERENCES talleres(id) ON DELETE CASCADE,
  CONSTRAINT fk_resenas_turno
    FOREIGN KEY (turno_id) REFERENCES turnos(id) ON DELETE SET NULL,
  UNIQUE KEY uq_resena_turno (turno_id)
) ENGINE=InnoDB;

CREATE TABLE notificaciones (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id BIGINT UNSIGNED NULL,
  mecanico_id BIGINT UNSIGNED NULL,
  taller_id BIGINT UNSIGNED NULL,
  tipo VARCHAR(80) NOT NULL,
  titulo VARCHAR(160) NOT NULL,
  mensaje TEXT NULL,
  url_accion VARCHAR(255) NULL,
  leido_at TIMESTAMP NULL,
  creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notificaciones_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  CONSTRAINT fk_notificaciones_mecanico
    FOREIGN KEY (mecanico_id) REFERENCES mecanicos(id) ON DELETE CASCADE,
  CONSTRAINT fk_notificaciones_taller
    FOREIGN KEY (taller_id) REFERENCES talleres(id) ON DELETE CASCADE,
  INDEX idx_notificaciones_cliente (cliente_id, leido_at),
  INDEX idx_notificaciones_mecanico (mecanico_id, leido_at)
) ENGINE=InnoDB;

CREATE TABLE push_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id BIGINT UNSIGNED NULL,
  mecanico_id BIGINT UNSIGNED NULL,
  token VARCHAR(512) NOT NULL,
  plataforma ENUM('android', 'ios', 'web') NOT NULL DEFAULT 'android',
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_push_tokens_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  CONSTRAINT fk_push_tokens_mecanico
    FOREIGN KEY (mecanico_id) REFERENCES mecanicos(id) ON DELETE CASCADE,
  UNIQUE KEY uq_push_tokens_token (token),
  INDEX idx_push_tokens_cliente (cliente_id, activo),
  INDEX idx_push_tokens_mecanico (mecanico_id, activo)
) ENGINE=InnoDB;

CREATE TABLE notificacion_envios (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  clave VARCHAR(190) NOT NULL,
  creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_notificacion_envios_clave (clave)
) ENGINE=InnoDB;

CREATE TABLE recordatorios_mantenimiento (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id BIGINT UNSIGNED NOT NULL,
  vehiculo_id BIGINT UNSIGNED NOT NULL,
  titulo VARCHAR(160) NOT NULL,
  descripcion TEXT NULL,
  kilometraje_objetivo INT UNSIGNED NULL,
  fecha_objetivo DATE NULL,
  estado ENUM('pendiente', 'notificado', 'completado', 'cancelado') NOT NULL DEFAULT 'pendiente',
  creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_recordatorios_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  CONSTRAINT fk_recordatorios_vehiculo
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE consultas_ia (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id BIGINT UNSIGNED NULL,
  vehiculo_id BIGINT UNSIGNED NULL,
  conversacion_id BIGINT UNSIGNED NULL,
  pregunta TEXT NOT NULL,
  respuesta TEXT NULL,
  confianza DECIMAL(5, 2) NULL,
  metadata JSON NULL,
  creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_consultas_ia_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
  CONSTRAINT fk_consultas_ia_vehiculo
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE SET NULL,
  CONSTRAINT fk_consultas_ia_conversacion
    FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE pagos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id BIGINT UNSIGNED NOT NULL,
  taller_id BIGINT UNSIGNED NOT NULL,
  turno_id BIGINT UNSIGNED NULL,
  presupuesto_id BIGINT UNSIGNED NULL,
  metodo ENUM('efectivo', 'transferencia', 'tarjeta', 'mercado_pago', 'otro') NOT NULL,
  moneda VARCHAR(10) NOT NULL DEFAULT 'UYU',
  monto DECIMAL(12, 2) NOT NULL,
  estado ENUM('pendiente', 'pagado', 'fallido', 'reembolsado', 'cancelado') NOT NULL DEFAULT 'pendiente',
  referencia_externa VARCHAR(160) NULL,
  pagado_at TIMESTAMP NULL,
  creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pagos_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  CONSTRAINT fk_pagos_taller
    FOREIGN KEY (taller_id) REFERENCES talleres(id) ON DELETE CASCADE,
  CONSTRAINT fk_pagos_turno
    FOREIGN KEY (turno_id) REFERENCES turnos(id) ON DELETE SET NULL,
  CONSTRAINT fk_pagos_presupuesto
    FOREIGN KEY (presupuesto_id) REFERENCES presupuestos(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE archivos_adjuntos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  entidad_tipo ENUM('solicitud', 'turno', 'presupuesto', 'historial', 'diagnostico', 'mensaje', 'taller') NOT NULL,
  entidad_id BIGINT UNSIGNED NOT NULL,
  nombre_original VARCHAR(180) NULL,
  mime_type VARCHAR(120) NULL,
  url VARCHAR(255) NOT NULL,
  tamanio_bytes BIGINT UNSIGNED NULL,
  creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_archivos_entidad (entidad_tipo, entidad_id)
) ENGINE=InnoDB;
