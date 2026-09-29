-- quartz metadata tables
CREATE TABLE IF NOT EXISTS QRTZ_JOB_DETAILS (
    sched_name           varchar(120)    NOT NULL,
    job_name             varchar(200)    NOT NULL,
    job_group            varchar(200)    NOT NULL,
    description          varchar(250)    NULL,
    job_class_name       varchar(250)    NOT NULL,
    is_durable           varchar(1)      NOT NULL,
    is_nonconcurrent     varchar(1)      NOT NULL,
    is_update_data       varchar(1)      NOT NULL,
    requests_recovery    varchar(1)      NOT NULL,
    job_data             bytea            NULL,
    PRIMARY KEY (sched_name, job_name, job_group)
);

CREATE TABLE IF NOT EXISTS QRTZ_TRIGGERS (
    sched_name           varchar(120)    NOT NULL,
    trigger_name         varchar(200)    NOT NULL,
    trigger_group        varchar(200)    NOT NULL,
    job_name             varchar(200)    NOT NULL,
    job_group            varchar(200)    NOT NULL,
    description          varchar(250)    NULL,
    next_fire_time       bigint      NULL,
    prev_fire_time       bigint      NULL,
    priority             integer         NULL,
    trigger_state        varchar(16)     NOT NULL,
    trigger_type         varchar(8)      NOT NULL,
    start_time           bigint      NOT NULL,
    end_time             bigint      NULL,
    calendar_name        varchar(200)    NULL,
    misfire_instr        smallint     NULL,
    job_data             bytea            NULL,
    PRIMARY KEY (sched_name, trigger_name, trigger_group)
);

CREATE TABLE IF NOT EXISTS QRTZ_SIMPLE_TRIGGERS (
    sched_name           varchar(120)    NOT NULL,
    trigger_name         varchar(200)    NOT NULL,
    trigger_group        varchar(200)    NOT NULL,
    repeat_count         bigint       NOT NULL,
    repeat_interval      bigint      NOT NULL,
    times_triggered      bigint      NOT NULL,
    PRIMARY KEY (sched_name, trigger_name, trigger_group)
);

CREATE TABLE IF NOT EXISTS QRTZ_CRON_TRIGGERS (
    sched_name           varchar(120)    NOT NULL,
    trigger_name         varchar(200)    NOT NULL,
    trigger_group        varchar(200)    NOT NULL,
    cron_expression      varchar(200)    NOT NULL,
    time_zone_id         varchar(80)     NULL,
    PRIMARY KEY (sched_name, trigger_name, trigger_group)
);

CREATE TABLE IF NOT EXISTS QRTZ_BLOB_TRIGGERS (
    sched_name           varchar(120)    NOT NULL,
    trigger_name         varchar(200)    NOT NULL,
    trigger_group        varchar(200)    NOT NULL,
    blob_data            bytea            NULL,
    PRIMARY KEY (sched_name, trigger_name, trigger_group)
);

CREATE TABLE IF NOT EXISTS QRTZ_CALENDARS (
    sched_name           varchar(120)    NOT NULL,
    calendar_name        varchar(200)    NOT NULL,
    calendar             bytea            NOT NULL,
    PRIMARY KEY (sched_name, calendar_name)
);

CREATE TABLE IF NOT EXISTS QRTZ_PAUSED_TRIGGER_GRPS (
    sched_name           varchar(120)    NOT NULL,
    trigger_group        varchar(200)    NOT NULL,
    PRIMARY KEY (sched_name, trigger_group)
);

CREATE TABLE IF NOT EXISTS QRTZ_FIRED_TRIGGERS (
    sched_name           varchar(120)    NOT NULL,
    entry_id             varchar(95)     NOT NULL,
    trigger_name         varchar(200)    NOT NULL,
    trigger_group        varchar(200)    NOT NULL,
    instance_name        varchar(200)    NOT NULL,
    fired_time           bigint      NOT NULL,
    sched_time           bigint      NOT NULL,
    priority             integer         NOT NULL,
    state                varchar(16)     NOT NULL,
    job_name             varchar(200)    NULL,
    job_group            varchar(200)    NULL,
    is_nonconcurrent     varchar(1)      NULL,
    requests_recovery    varchar(1)      NULL,
    PRIMARY KEY (sched_name, entry_id)
);

CREATE TABLE IF NOT EXISTS QRTZ_SCHEDULER_STATE (
    sched_name           varchar(120)    NOT NULL,
    instance_name        varchar(200)    NOT NULL,
    last_checkin_time    bigint      NOT NULL,
    checkin_interval     bigint      NOT NULL,
    PRIMARY KEY (sched_name, instance_name)
);

CREATE TABLE IF NOT EXISTS QRTZ_LOCKS (
    sched_name           varchar(120)    NOT NULL,
    lock_name            varchar(40)     NOT NULL,
    PRIMARY KEY (sched_name, lock_name)
);

CREATE TABLE IF NOT EXISTS QRTZ_SIMPROP_TRIGGERS (
    sched_name           varchar(120)    NOT NULL,
    trigger_name         varchar(200)    NOT NULL,
    trigger_group        varchar(200)    NOT NULL,
    str_prop_1           varchar(512)    NULL,
    str_prop_2           varchar(512)    NULL,
    str_prop_3           varchar(512)    NULL,
    int_prop_1           int             NULL,
    int_prop_2           int             NULL,
    long_prop_1          bigint          NULL,
    long_prop_2          bigint          NULL,
    dec_prop_1           numeric(13,4)   NULL,
    dec_prop_2           numeric(13,4)   NULL,
    bool_prop_1          varchar(1)      NULL,
    bool_prop_2          varchar(1)      NULL,
    PRIMARY KEY (sched_name, trigger_name, trigger_group)
);

-- quartz business tables
CREATE TABLE IF NOT EXISTS sys_job (
  job_id              bigint    NOT NULL GENERATED BY DEFAULT AS IDENTITY,
  job_name            varchar(64)   DEFAULT '',
  job_group           varchar(64)   DEFAULT 'DEFAULT',
  job_type            varchar(1)    DEFAULT '1',
  invoke_target       varchar(1000) DEFAULT '',
  request_url         varchar(500)  DEFAULT '',
  request_method      varchar(10)   DEFAULT 'GET',
  request_headers     varchar(1000) DEFAULT '',
  request_body        text,
  content_type        varchar(100)  DEFAULT 'application/json',
  timeout             integer       DEFAULT 5000,
  cron_expression     varchar(255)  DEFAULT '',
  misfire_policy      varchar(20)   DEFAULT '3',
  concurrent          char(1)       DEFAULT '1',
  status              char(1)       DEFAULT '0',
  create_by           varchar(64)   DEFAULT '',
  create_time         timestamp,
  update_by           varchar(64)   DEFAULT '',
  update_time         timestamp,
  remark              varchar(500)  DEFAULT '',
  PRIMARY KEY (job_id)
);

CREATE TABLE IF NOT EXISTS sys_job_log (
  job_log_id          bigint     NOT NULL GENERATED BY DEFAULT AS IDENTITY,
  job_name            varchar(64)    NOT NULL,
  job_group           varchar(64)    NOT NULL,
  invoke_target       varchar(500)   NOT NULL,
  job_message         varchar(500),
  status              char(1)        DEFAULT '0',
  exception_info      varchar(2000)  DEFAULT '',
  create_time         timestamp,
  PRIMARY KEY (job_log_id)
);

-- dictionary
INSERT INTO sys_dict_type (dict_id, dict_name, dict_type, status, create_by, create_time, update_by, update_time, remark)
SELECT 4, '任务状态', 'sys_job_status', '0', 'admin', now(), '', NULL, '任务状态列表'
WHERE NOT EXISTS (SELECT 1 FROM sys_dict_type WHERE dict_type = 'sys_job_status');

INSERT INTO sys_dict_type (dict_id, dict_name, dict_type, status, create_by, create_time, update_by, update_time, remark)
SELECT 5, '任务分组', 'sys_job_group', '0', 'admin', now(), '', NULL, '任务分组列表'
WHERE NOT EXISTS (SELECT 1 FROM sys_dict_type WHERE dict_type = 'sys_job_group');

INSERT INTO sys_dict_data (dict_code, dict_sort, dict_label, dict_value, dict_type, css_class, list_class, is_default, status, create_by, create_time, update_by, update_time, remark)
SELECT 8, 1, '正常', '0', 'sys_job_status', '', 'primary', 'Y', '0', 'admin', now(), '', NULL, '正常状态'
WHERE NOT EXISTS (SELECT 1 FROM sys_dict_data WHERE dict_type='sys_job_status' AND dict_value='0');

INSERT INTO sys_dict_data (dict_code, dict_sort, dict_label, dict_value, dict_type, css_class, list_class, is_default, status, create_by, create_time, update_by, update_time, remark)
SELECT 9, 2, '暂停', '1', 'sys_job_status', '', 'danger', 'N', '0', 'admin', now(), '', NULL, '暂停状态'
WHERE NOT EXISTS (SELECT 1 FROM sys_dict_data WHERE dict_type='sys_job_status' AND dict_value='1');

INSERT INTO sys_dict_data (dict_code, dict_sort, dict_label, dict_value, dict_type, css_class, list_class, is_default, status, create_by, create_time, update_by, update_time, remark)
SELECT 10, 1, '默认', 'DEFAULT', 'sys_job_group', '', '', 'Y', '0', 'admin', now(), '', NULL, '默认分组'
WHERE NOT EXISTS (SELECT 1 FROM sys_dict_data WHERE dict_type='sys_job_group' AND dict_value='DEFAULT');

INSERT INTO sys_dict_data (dict_code, dict_sort, dict_label, dict_value, dict_type, css_class, list_class, is_default, status, create_by, create_time, update_by, update_time, remark)
SELECT 11, 2, '系统', 'SYSTEM', 'sys_job_group', '', '', 'N', '0', 'admin', now(), '', NULL, '系统分组'
WHERE NOT EXISTS (SELECT 1 FROM sys_dict_data WHERE dict_type='sys_job_group' AND dict_value='SYSTEM');

-- menu and permissions
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, url, target, menu_type, visible, is_refresh, perms, icon, create_by, create_time, update_by, update_time, remark)
SELECT 110, '定时任务', 1, 9, '/monitor/job', '', 'C', '0', '1', 'monitor:job:view', 'fa fa-tasks', 'admin', now(), '', NULL, '定时任务菜单'
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE menu_id = 110);
UPDATE sys_menu SET parent_id = 1, order_num = 9, url = '/monitor/job', menu_type = 'C', visible = '0', perms = 'monitor:job:view', icon = 'fa fa-tasks'
WHERE menu_id = 110;

INSERT INTO sys_menu SELECT 1050, '任务查询', 110, 1, '#', '', 'F', '0', '1', 'monitor:job:list', '#', 'admin', now(), '', NULL, ''
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE menu_id = 1050);
INSERT INTO sys_menu SELECT 1051, '任务新增', 110, 2, '#', '', 'F', '0', '1', 'monitor:job:add', '#', 'admin', now(), '', NULL, ''
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE menu_id = 1051);
INSERT INTO sys_menu SELECT 1052, '任务修改', 110, 3, '#', '', 'F', '0', '1', 'monitor:job:edit', '#', 'admin', now(), '', NULL, ''
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE menu_id = 1052);
INSERT INTO sys_menu SELECT 1053, '任务删除', 110, 4, '#', '', 'F', '0', '1', 'monitor:job:remove', '#', 'admin', now(), '', NULL, ''
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE menu_id = 1053);
INSERT INTO sys_menu SELECT 1054, '状态修改', 110, 5, '#', '', 'F', '0', '1', 'monitor:job:changeStatus', '#', 'admin', now(), '', NULL, ''
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE menu_id = 1054);
INSERT INTO sys_menu SELECT 1055, '任务详细', 110, 6, '#', '', 'F', '0', '1', 'monitor:job:detail', '#', 'admin', now(), '', NULL, ''
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE menu_id = 1055);
INSERT INTO sys_menu SELECT 1056, '任务导出', 110, 7, '#', '', 'F', '0', '1', 'monitor:job:export', '#', 'admin', now(), '', NULL, ''
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE menu_id = 1056);

INSERT INTO sys_role_menu (role_id, menu_id)
SELECT 1, 110 WHERE NOT EXISTS (SELECT 1 FROM sys_role_menu WHERE role_id=1 AND menu_id=110);
INSERT INTO sys_role_menu (role_id, menu_id)
SELECT 1, 1050 WHERE NOT EXISTS (SELECT 1 FROM sys_role_menu WHERE role_id=1 AND menu_id=1050);
INSERT INTO sys_role_menu (role_id, menu_id)
SELECT 1, 1051 WHERE NOT EXISTS (SELECT 1 FROM sys_role_menu WHERE role_id=1 AND menu_id=1051);
INSERT INTO sys_role_menu (role_id, menu_id)
SELECT 1, 1052 WHERE NOT EXISTS (SELECT 1 FROM sys_role_menu WHERE role_id=1 AND menu_id=1052);
INSERT INTO sys_role_menu (role_id, menu_id)
SELECT 1, 1053 WHERE NOT EXISTS (SELECT 1 FROM sys_role_menu WHERE role_id=1 AND menu_id=1053);
INSERT INTO sys_role_menu (role_id, menu_id)
SELECT 1, 1054 WHERE NOT EXISTS (SELECT 1 FROM sys_role_menu WHERE role_id=1 AND menu_id=1054);
INSERT INTO sys_role_menu (role_id, menu_id)
SELECT 1, 1055 WHERE NOT EXISTS (SELECT 1 FROM sys_role_menu WHERE role_id=1 AND menu_id=1055);
INSERT INTO sys_role_menu (role_id, menu_id)
SELECT 1, 1056 WHERE NOT EXISTS (SELECT 1 FROM sys_role_menu WHERE role_id=1 AND menu_id=1056);

INSERT INTO sys_role_menu (role_id, menu_id)
SELECT 2, 110 WHERE NOT EXISTS (SELECT 1 FROM sys_role_menu WHERE role_id=2 AND menu_id=110);

-- default jobs
INSERT INTO sys_job (job_id, job_name, job_group, invoke_target, cron_expression, misfire_policy, concurrent, status, create_by, create_time, update_by, update_time, remark)
SELECT 1, '系统默认（无参）', 'DEFAULT', 'qvsuTask.qvsuNoParams', '0/10 * * * * ?', '3', '1', '1', 'admin', now(), '', NULL, ''
WHERE NOT EXISTS (SELECT 1 FROM sys_job WHERE job_id = 1);

INSERT INTO sys_job (job_id, job_name, job_group, invoke_target, cron_expression, misfire_policy, concurrent, status, create_by, create_time, update_by, update_time, remark)
SELECT 2, '系统默认（有参）', 'DEFAULT', 'qvsuTask.qvsuParams(''qvsu'')', '0/15 * * * * ?', '3', '1', '1', 'admin', now(), '', NULL, ''
WHERE NOT EXISTS (SELECT 1 FROM sys_job WHERE job_id = 2);

INSERT INTO sys_job (job_id, job_name, job_group, invoke_target, cron_expression, misfire_policy, concurrent, status, create_by, create_time, update_by, update_time, remark)
SELECT 3, '系统默认（多参）', 'DEFAULT', 'qvsuTask.qvsuMultipleParams(''qvsu'', true, 2000L, 316.50D, 100)', '0/20 * * * * ?', '3', '1', '1', 'admin', now(), '', NULL, ''
WHERE NOT EXISTS (SELECT 1 FROM sys_job WHERE job_id = 3);





SELECT setval(pg_get_serial_sequence('sys_job', 'job_id'), coalesce((SELECT max(job_id) FROM sys_job), 1), true);

