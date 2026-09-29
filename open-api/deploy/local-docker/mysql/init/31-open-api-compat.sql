-- OpenAPI compatibility upgrade for legacy s_* columns
SET NAMES utf8mb4;

DROP PROCEDURE IF EXISTS add_column_if_absent;
DELIMITER $$
CREATE PROCEDURE add_column_if_absent(IN p_table VARCHAR(64), IN p_col VARCHAR(64), IN p_def TEXT)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = p_table
          AND COLUMN_NAME = p_col
    ) THEN
        SET @ddl = CONCAT('ALTER TABLE `', p_table, '` ADD COLUMN ', p_def);
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$
DELIMITER ;

CALL add_column_if_absent('open_app', 's_status', '`s_status` TINYINT DEFAULT 1');
CALL add_column_if_absent('open_app', 's_is_del', '`s_is_del` TINYINT DEFAULT 1');
CALL add_column_if_absent('open_app', 's_created_time', '`s_created_time` DATETIME DEFAULT CURRENT_TIMESTAMP');
CALL add_column_if_absent('open_app', 's_updated_time', '`s_updated_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

CALL add_column_if_absent('open_api', 'update_time', '`update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
CALL add_column_if_absent('open_api', 's_status', '`s_status` TINYINT DEFAULT 1');
CALL add_column_if_absent('open_api', 's_is_del', '`s_is_del` TINYINT DEFAULT 1');
CALL add_column_if_absent('open_api', 's_created_time', '`s_created_time` DATETIME DEFAULT CURRENT_TIMESTAMP');
CALL add_column_if_absent('open_api', 's_updated_time', '`s_updated_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

CALL add_column_if_absent('open_app_api', 'update_time', '`update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
CALL add_column_if_absent('open_app_api', 's_status', '`s_status` TINYINT DEFAULT 1');
CALL add_column_if_absent('open_app_api', 's_is_del', '`s_is_del` TINYINT DEFAULT 1');
CALL add_column_if_absent('open_app_api', 's_created_time', '`s_created_time` DATETIME DEFAULT CURRENT_TIMESTAMP');
CALL add_column_if_absent('open_app_api', 's_updated_time', '`s_updated_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

CALL add_column_if_absent('open_call_log', 'create_time', '`create_time` DATETIME DEFAULT CURRENT_TIMESTAMP');
CALL add_column_if_absent('open_call_log', 'update_time', '`update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
CALL add_column_if_absent('open_call_log', 's_status', '`s_status` TINYINT DEFAULT 1');
CALL add_column_if_absent('open_call_log', 's_is_del', '`s_is_del` TINYINT DEFAULT 1');
CALL add_column_if_absent('open_call_log', 's_created_time', '`s_created_time` DATETIME DEFAULT CURRENT_TIMESTAMP');
CALL add_column_if_absent('open_call_log', 's_updated_time', '`s_updated_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

CALL add_column_if_absent('open_api_doc', 'update_time', '`update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
CALL add_column_if_absent('open_api_doc', 's_status', '`s_status` TINYINT DEFAULT 1');
CALL add_column_if_absent('open_api_doc', 's_is_del', '`s_is_del` TINYINT DEFAULT 1');
CALL add_column_if_absent('open_api_doc', 's_created_time', '`s_created_time` DATETIME DEFAULT CURRENT_TIMESTAMP');
CALL add_column_if_absent('open_api_doc', 's_updated_time', '`s_updated_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

DROP PROCEDURE IF EXISTS add_column_if_absent;

UPDATE open_app
SET s_status = COALESCE(s_status, status, 1),
    s_is_del = COALESCE(s_is_del, 1),
    s_created_time = COALESCE(s_created_time, create_time, NOW()),
    s_updated_time = COALESCE(s_updated_time, update_time, NOW()),
    create_time = COALESCE(create_time, s_created_time, NOW()),
    update_time = COALESCE(update_time, s_updated_time, NOW());

UPDATE open_api
SET s_status = COALESCE(s_status, status, 1),
    s_is_del = COALESCE(s_is_del, 1),
    s_created_time = COALESCE(s_created_time, create_time, NOW()),
    s_updated_time = COALESCE(s_updated_time, update_time, NOW()),
    create_time = COALESCE(create_time, s_created_time, NOW()),
    update_time = COALESCE(update_time, s_updated_time, NOW());

UPDATE open_app_api
SET s_status = COALESCE(s_status, 1),
    s_is_del = COALESCE(s_is_del, 1),
    s_created_time = COALESCE(s_created_time, create_time, NOW()),
    s_updated_time = COALESCE(s_updated_time, update_time, NOW()),
    create_time = COALESCE(create_time, s_created_time, NOW()),
    update_time = COALESCE(update_time, s_updated_time, NOW());

UPDATE open_call_log
SET s_status = COALESCE(s_status, 1),
    s_is_del = COALESCE(s_is_del, 1),
    s_created_time = COALESCE(s_created_time, create_time, call_time, NOW()),
    s_updated_time = COALESCE(s_updated_time, update_time, call_time, NOW()),
    create_time = COALESCE(create_time, s_created_time, call_time, NOW()),
    update_time = COALESCE(update_time, s_updated_time, call_time, NOW());

UPDATE open_api_doc
SET s_status = COALESCE(s_status, 1),
    s_is_del = COALESCE(s_is_del, 1),
    s_created_time = COALESCE(s_created_time, create_time, NOW()),
    s_updated_time = COALESCE(s_updated_time, update_time, NOW()),
    create_time = COALESCE(create_time, s_created_time, NOW()),
    update_time = COALESCE(update_time, s_updated_time, NOW());
