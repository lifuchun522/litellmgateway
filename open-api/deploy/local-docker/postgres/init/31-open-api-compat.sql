-- OpenAPI compatibility upgrade for legacy s_* columns (PostgreSQL)

ALTER TABLE IF EXISTS open_app ADD COLUMN IF NOT EXISTS s_status smallint DEFAULT 1;
ALTER TABLE IF EXISTS open_app ADD COLUMN IF NOT EXISTS s_is_del smallint DEFAULT 1;
ALTER TABLE IF EXISTS open_app ADD COLUMN IF NOT EXISTS s_created_time timestamp DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE IF EXISTS open_app ADD COLUMN IF NOT EXISTS s_updated_time timestamp DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE IF EXISTS open_api ADD COLUMN IF NOT EXISTS update_time timestamp DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE IF EXISTS open_api ADD COLUMN IF NOT EXISTS s_status smallint DEFAULT 1;
ALTER TABLE IF EXISTS open_api ADD COLUMN IF NOT EXISTS s_is_del smallint DEFAULT 1;
ALTER TABLE IF EXISTS open_api ADD COLUMN IF NOT EXISTS s_created_time timestamp DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE IF EXISTS open_api ADD COLUMN IF NOT EXISTS s_updated_time timestamp DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE IF EXISTS open_app_api ADD COLUMN IF NOT EXISTS update_time timestamp DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE IF EXISTS open_app_api ADD COLUMN IF NOT EXISTS s_status smallint DEFAULT 1;
ALTER TABLE IF EXISTS open_app_api ADD COLUMN IF NOT EXISTS s_is_del smallint DEFAULT 1;
ALTER TABLE IF EXISTS open_app_api ADD COLUMN IF NOT EXISTS s_created_time timestamp DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE IF EXISTS open_app_api ADD COLUMN IF NOT EXISTS s_updated_time timestamp DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE IF EXISTS open_call_log ADD COLUMN IF NOT EXISTS create_time timestamp DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE IF EXISTS open_call_log ADD COLUMN IF NOT EXISTS update_time timestamp DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE IF EXISTS open_call_log ADD COLUMN IF NOT EXISTS s_status smallint DEFAULT 1;
ALTER TABLE IF EXISTS open_call_log ADD COLUMN IF NOT EXISTS s_is_del smallint DEFAULT 1;
ALTER TABLE IF EXISTS open_call_log ADD COLUMN IF NOT EXISTS s_created_time timestamp DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE IF EXISTS open_call_log ADD COLUMN IF NOT EXISTS s_updated_time timestamp DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE IF EXISTS open_api_doc ADD COLUMN IF NOT EXISTS update_time timestamp DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE IF EXISTS open_api_doc ADD COLUMN IF NOT EXISTS s_status smallint DEFAULT 1;
ALTER TABLE IF EXISTS open_api_doc ADD COLUMN IF NOT EXISTS s_is_del smallint DEFAULT 1;
ALTER TABLE IF EXISTS open_api_doc ADD COLUMN IF NOT EXISTS s_created_time timestamp DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE IF EXISTS open_api_doc ADD COLUMN IF NOT EXISTS s_updated_time timestamp DEFAULT CURRENT_TIMESTAMP;

UPDATE open_app
SET s_status = COALESCE(s_status, status, 1),
    s_is_del = COALESCE(s_is_del, 1),
    s_created_time = COALESCE(s_created_time, create_time, now()),
    s_updated_time = COALESCE(s_updated_time, update_time, now()),
    create_time = COALESCE(create_time, s_created_time, now()),
    update_time = COALESCE(update_time, s_updated_time, now());

UPDATE open_api
SET s_status = COALESCE(s_status, status, 1),
    s_is_del = COALESCE(s_is_del, 1),
    s_created_time = COALESCE(s_created_time, create_time, now()),
    s_updated_time = COALESCE(s_updated_time, update_time, now()),
    create_time = COALESCE(create_time, s_created_time, now()),
    update_time = COALESCE(update_time, s_updated_time, now());

UPDATE open_app_api
SET s_status = COALESCE(s_status, 1),
    s_is_del = COALESCE(s_is_del, 1),
    s_created_time = COALESCE(s_created_time, create_time, now()),
    s_updated_time = COALESCE(s_updated_time, update_time, now()),
    create_time = COALESCE(create_time, s_created_time, now()),
    update_time = COALESCE(update_time, s_updated_time, now());

UPDATE open_call_log
SET s_status = COALESCE(s_status, 1),
    s_is_del = COALESCE(s_is_del, 1),
    s_created_time = COALESCE(s_created_time, create_time, call_time, now()),
    s_updated_time = COALESCE(s_updated_time, update_time, call_time, now()),
    create_time = COALESCE(create_time, s_created_time, call_time, now()),
    update_time = COALESCE(update_time, s_updated_time, call_time, now());

UPDATE open_api_doc
SET s_status = COALESCE(s_status, 1),
    s_is_del = COALESCE(s_is_del, 1),
    s_created_time = COALESCE(s_created_time, create_time, now()),
    s_updated_time = COALESCE(s_updated_time, update_time, now()),
    create_time = COALESCE(create_time, s_created_time, now()),
    update_time = COALESCE(update_time, s_updated_time, now());
