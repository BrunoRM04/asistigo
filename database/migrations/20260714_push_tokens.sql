CREATE TABLE IF NOT EXISTS push_tokens (
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
