-- Visitas da landing page "pulse" (captura do gclid do Google Ads).
-- Sem IF NOT EXISTS: se já houver uma tabela com este nome, a migration deve falhar.

CREATE TABLE landing_visits (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID da sessão',
  gclid            VARCHAR(512)  CHARACTER SET ascii COLLATE ascii_bin NULL COMMENT 'NULL em visitas sem anúncio',
  created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  currency_code    CHAR(3)       NOT NULL DEFAULT 'BRL',
  conversion_value DECIMAL(10,2) NULL DEFAULT NULL COMMENT 'Ex.: 6.50. Preenchido depois por outra aplicação',
  ip_address       VARCHAR(45)   CHARACTER SET ascii NULL COMMENT 'IPv4 ou IPv6',
  visit_id         CHAR(36)      CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Evita gravar a mesma visita duas vezes',
  gbraid           VARCHAR(512)  CHARACTER SET ascii COLLATE ascii_bin NULL,
  wbraid           VARCHAR(512)  CHARACTER SET ascii COLLATE ascii_bin NULL,
  utm_source       VARCHAR(255)  NULL,
  utm_medium       VARCHAR(255)  NULL,
  utm_campaign     VARCHAR(255)  NULL,
  utm_term         VARCHAR(255)  NULL,
  utm_content      VARCHAR(255)  NULL,
  landing_url      VARCHAR(2048) NULL,
  referrer         VARCHAR(2048) NULL,
  user_agent       VARCHAR(512)  NULL,
  country          CHAR(2)       NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_landing_visits_visit_id (visit_id),
  KEY idx_landing_visits_gclid (gclid(191)),
  KEY idx_landing_visits_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
