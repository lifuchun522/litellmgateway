-- OpenAPI schema
SET NAMES utf8mb4;

DROP TABLE IF EXISTS open_api_doc;
DROP TABLE IF EXISTS open_call_log;
DROP TABLE IF EXISTS open_app_api;
DROP TABLE IF EXISTS open_api;
DROP TABLE IF EXISTS open_app;

CREATE TABLE open_app (
  s_id            BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'primary key',
  app_name        VARCHAR(100) NOT NULL COMMENT 'app name',
  app_key         VARCHAR(64)  NOT NULL UNIQUE COMMENT 'app key',
  app_secret      VARCHAR(128) NOT NULL COMMENT 'app secret',
  contact         VARCHAR(100) NULL COMMENT 'contact',
  status          TINYINT DEFAULT 1 COMMENT '1=enabled 0=disabled',
  expire_time     DATETIME NULL COMMENT 'expire time, NULL=never',
  remark          VARCHAR(500) NULL,
  create_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  s_status        TINYINT DEFAULT 1 COMMENT 'compat status',
  s_is_del        TINYINT DEFAULT 1 COMMENT 'compat delete flag',
  s_created_time  DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'compat create time',
  s_updated_time  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'compat update time'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='openapi app';

CREATE TABLE open_api (
  s_id            BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'primary key',
  api_name        VARCHAR(100) NOT NULL COMMENT 'api name',
  api_path        VARCHAR(200) NOT NULL UNIQUE COMMENT 'api path, e.g. /open/order/list',
  method          VARCHAR(10)  DEFAULT 'POST',
  target_url      VARCHAR(500) NOT NULL COMMENT 'target url',
  timeout_ms      INT DEFAULT 5000,
  status          TINYINT DEFAULT 1 COMMENT '1=enabled 0=disabled',
  need_sign       TINYINT DEFAULT 1 COMMENT '1=sign required',
  description     VARCHAR(500) NULL,
  req_example     TEXT NULL,
  resp_example    TEXT NULL,
  create_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  s_status        TINYINT DEFAULT 1 COMMENT 'compat status',
  s_is_del        TINYINT DEFAULT 1 COMMENT 'compat delete flag',
  s_created_time  DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'compat create time',
  s_updated_time  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'compat update time'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='openapi api';

CREATE TABLE open_app_api (
  s_id            BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'primary key',
  app_id          BIGINT NOT NULL,
  api_id          BIGINT NOT NULL,
  create_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  s_status        TINYINT DEFAULT 1 COMMENT 'compat status',
  s_is_del        TINYINT DEFAULT 1 COMMENT 'compat delete flag',
  s_created_time  DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'compat create time',
  s_updated_time  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'compat update time',
  UNIQUE KEY uk_app_api (app_id, api_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='app-api grant';

CREATE TABLE open_call_log (
  s_id            BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'primary key',
  trace_id        VARCHAR(64)  NOT NULL COMMENT 'trace id',
  app_key         VARCHAR(64)  NULL,
  app_name        VARCHAR(100) NULL,
  api_path        VARCHAR(200) NULL,
  method          VARCHAR(10)  NULL,
  req_headers     TEXT NULL,
  req_body        TEXT NULL,
  resp_code       INT NULL,
  resp_headers    TEXT NULL,
  resp_body       TEXT NULL,
  cost_ms         INT NULL,
  status          TINYINT NULL COMMENT '0=ok 1=auth-fail 2=proxy-fail',
  error_msg       VARCHAR(500) NULL,
  client_ip       VARCHAR(64)  NULL,
  call_time       DATETIME DEFAULT CURRENT_TIMESTAMP,
  create_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  s_status        TINYINT DEFAULT 1 COMMENT 'compat status',
  s_is_del        TINYINT DEFAULT 1 COMMENT 'compat delete flag',
  s_created_time  DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'compat create time',
  s_updated_time  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'compat update time',
  INDEX idx_trace_id (trace_id),
  INDEX idx_app_key (app_key),
  INDEX idx_call_time (call_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='openapi call log';

CREATE TABLE open_api_doc (
  s_id            BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'primary key',
  app_id          BIGINT NULL,
  doc_title       VARCHAR(100) NULL,
  doc_version     VARCHAR(20) NULL,
  api_ids         VARCHAR(500) NULL,
  html_content    LONGTEXT NULL,
  create_time     DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  s_status        TINYINT DEFAULT 1 COMMENT 'compat status',
  s_is_del        TINYINT DEFAULT 1 COMMENT 'compat delete flag',
  s_created_time  DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'compat create time',
  s_updated_time  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'compat update time'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='openapi doc';
