SET NAMES utf8mb4;

-- quartz metadata tables
CREATE TABLE IF NOT EXISTS QRTZ_JOB_DETAILS (
    sched_name           varchar(120)    NOT NULL            COMMENT '调度名称',
    job_name             varchar(200)    NOT NULL            COMMENT '任务名称',
    job_group            varchar(200)    NOT NULL            COMMENT '任务组名',
    description          varchar(250)    NULL                COMMENT '相关介绍',
    job_class_name       varchar(250)    NOT NULL            COMMENT '执行任务类名称',
    is_durable           varchar(1)      NOT NULL            COMMENT '是否持久化',
    is_nonconcurrent     varchar(1)      NOT NULL            COMMENT '是否并发',
    is_update_data       varchar(1)      NOT NULL            COMMENT '是否更新数据',
    requests_recovery    varchar(1)      NOT NULL            COMMENT '是否接受恢复执行',
    job_data             blob            NULL                COMMENT '存放持久化job对象',
    PRIMARY KEY (sched_name, job_name, job_group)
) ENGINE=InnoDB COMMENT='任务详细信息表';

CREATE TABLE IF NOT EXISTS QRTZ_TRIGGERS (
    sched_name           varchar(120)    NOT NULL            COMMENT '调度名称',
    trigger_name         varchar(200)    NOT NULL            COMMENT '触发器名称',
    trigger_group        varchar(200)    NOT NULL            COMMENT '触发器组名',
    job_name             varchar(200)    NOT NULL            COMMENT '任务名称',
    job_group            varchar(200)    NOT NULL            COMMENT '任务组名',
    description          varchar(250)    NULL                COMMENT '相关介绍',
    next_fire_time       bigint(13)      NULL                COMMENT '下次触发时间',
    prev_fire_time       bigint(13)      NULL                COMMENT '上次触发时间',
    priority             integer         NULL                COMMENT '优先级',
    trigger_state        varchar(16)     NOT NULL            COMMENT '触发器状态',
    trigger_type         varchar(8)      NOT NULL            COMMENT '触发器类型',
    start_time           bigint(13)      NOT NULL            COMMENT '开始时间',
    end_time             bigint(13)      NULL                COMMENT '结束时间',
    calendar_name        varchar(200)    NULL                COMMENT '日程表名称',
    misfire_instr        smallint(2)     NULL                COMMENT '补偿执行策略',
    job_data             blob            NULL                COMMENT '存放持久化job对象',
    PRIMARY KEY (sched_name, trigger_name, trigger_group)
) ENGINE=InnoDB COMMENT='触发器详细信息表';

CREATE TABLE IF NOT EXISTS QRTZ_SIMPLE_TRIGGERS (
    sched_name           varchar(120)    NOT NULL,
    trigger_name         varchar(200)    NOT NULL,
    trigger_group        varchar(200)    NOT NULL,
    repeat_count         bigint(7)       NOT NULL,
    repeat_interval      bigint(12)      NOT NULL,
    times_triggered      bigint(10)      NOT NULL,
    PRIMARY KEY (sched_name, trigger_name, trigger_group)
) ENGINE=InnoDB COMMENT='简单触发器信息表';

CREATE TABLE IF NOT EXISTS QRTZ_CRON_TRIGGERS (
    sched_name           varchar(120)    NOT NULL,
    trigger_name         varchar(200)    NOT NULL,
    trigger_group        varchar(200)    NOT NULL,
    cron_expression      varchar(200)    NOT NULL            COMMENT 'cron表达式',
    time_zone_id         varchar(80)     NULL               COMMENT '时区',
    PRIMARY KEY (sched_name, trigger_name, trigger_group)
) ENGINE=InnoDB COMMENT='Cron触发器表';

CREATE TABLE IF NOT EXISTS QRTZ_BLOB_TRIGGERS (
    sched_name           varchar(120)    NOT NULL,
    trigger_name         varchar(200)    NOT NULL,
    trigger_group        varchar(200)    NOT NULL,
    blob_data            blob            NULL,
    PRIMARY KEY (sched_name, trigger_name, trigger_group)
) ENGINE=InnoDB COMMENT='Blob触发器表';

CREATE TABLE IF NOT EXISTS QRTZ_CALENDARS (
    sched_name           varchar(120)    NOT NULL,
    calendar_name        varchar(200)    NOT NULL,
    calendar             blob            NOT NULL,
    PRIMARY KEY (sched_name, calendar_name)
) ENGINE=InnoDB COMMENT='日历信息表';

CREATE TABLE IF NOT EXISTS QRTZ_PAUSED_TRIGGER_GRPS (
    sched_name           varchar(120)    NOT NULL,
    trigger_group        varchar(200)    NOT NULL,
    PRIMARY KEY (sched_name, trigger_group)
) ENGINE=InnoDB COMMENT='暂停触发器组表';

CREATE TABLE IF NOT EXISTS QRTZ_FIRED_TRIGGERS (
    sched_name           varchar(120)    NOT NULL,
    entry_id             varchar(95)     NOT NULL,
    trigger_name         varchar(200)    NOT NULL,
    trigger_group        varchar(200)    NOT NULL,
    instance_name        varchar(200)    NOT NULL,
    fired_time           bigint(13)      NOT NULL,
    sched_time           bigint(13)      NOT NULL,
    priority             integer         NOT NULL,
    state                varchar(16)     NOT NULL,
    job_name             varchar(200)    NULL,
    job_group            varchar(200)    NULL,
    is_nonconcurrent     varchar(1)      NULL,
    requests_recovery    varchar(1)      NULL,
    PRIMARY KEY (sched_name, entry_id)
) ENGINE=InnoDB COMMENT='已触发触发器表';

CREATE TABLE IF NOT EXISTS QRTZ_SCHEDULER_STATE (
    sched_name           varchar(120)    NOT NULL,
    instance_name        varchar(200)    NOT NULL,
    last_checkin_time    bigint(13)      NOT NULL,
    checkin_interval     bigint(13)      NOT NULL,
    PRIMARY KEY (sched_name, instance_name)
) ENGINE=InnoDB COMMENT='调度器状态表';

CREATE TABLE IF NOT EXISTS QRTZ_LOCKS (
    sched_name           varchar(120)    NOT NULL,
    lock_name            varchar(40)     NOT NULL,
    PRIMARY KEY (sched_name, lock_name)
) ENGINE=InnoDB COMMENT='悲观锁信息表';

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
) ENGINE=InnoDB COMMENT='同步机制锁表';

-- quartz business tables
CREATE TABLE IF NOT EXISTS sys_job (
  job_id              bigint(20)    NOT NULL AUTO_INCREMENT    COMMENT '任务ID',
  job_name            varchar(64)   DEFAULT ''                 COMMENT '任务名称',
  job_group           varchar(64)   DEFAULT 'DEFAULT'          COMMENT '任务组名',
  job_type            varchar(1)    DEFAULT '1'                COMMENT '调度类型（1=Bean调用 2=HTTP调用）',
  invoke_target       varchar(1000) DEFAULT ''                 COMMENT '调用目标字符串（Bean调用时使用）',
  request_url         varchar(500)  DEFAULT ''                 COMMENT 'HTTP请求URL（HTTP调用时使用）',
  request_method      varchar(10)   DEFAULT 'GET'              COMMENT 'HTTP请求方法（GET/POST/PUT/DELETE/PATCH）',
  request_headers     varchar(1000) DEFAULT ''                 COMMENT 'HTTP请求头（JSON格式）',
  request_body        text                                     COMMENT 'HTTP请求体',
  content_type        varchar(100)  DEFAULT 'application/json' COMMENT 'HTTP Content-Type',
  timeout             int(11)       DEFAULT 5000               COMMENT 'HTTP超时时间（毫秒）',
  cron_expression     varchar(255)  DEFAULT ''                 COMMENT 'cron执行表达式',
  misfire_policy      varchar(20)   DEFAULT '3'                COMMENT '计划执行错误策略（1立即执行 2执行一次 3放弃执行）',
  concurrent          char(1)       DEFAULT '1'                COMMENT '是否并发执行（0允许 1禁止）',
  status              char(1)       DEFAULT '0'                COMMENT '状态（0正常 1暂停）',
  create_by           varchar(64)   DEFAULT ''                 COMMENT '创建者',
  create_time         datetime                                 COMMENT '创建时间',
  update_by           varchar(64)   DEFAULT ''                 COMMENT '更新者',
  update_time         datetime                                 COMMENT '更新时间',
  remark              varchar(500)  DEFAULT ''                 COMMENT '备注信息',
  PRIMARY KEY (job_id, job_name, job_group)
) ENGINE=InnoDB AUTO_INCREMENT=100 COMMENT='定时任务调度表';

CREATE TABLE IF NOT EXISTS sys_job_log (
  job_log_id          bigint(20)     NOT NULL AUTO_INCREMENT    COMMENT '任务日志ID',
  job_name            varchar(64)    NOT NULL                   COMMENT '任务名称',
  job_group           varchar(64)    NOT NULL                   COMMENT '任务组名',
  invoke_target       varchar(500)   NOT NULL                   COMMENT '调用目标字符串',
  job_message         varchar(500)                              COMMENT '日志信息',
  status              char(1)        DEFAULT '0'                COMMENT '执行状态（0正常 1失败）',
  exception_info      varchar(2000)  DEFAULT ''                 COMMENT '异常信息',
  create_time         datetime                                  COMMENT '创建时间',
  PRIMARY KEY (job_log_id)
) ENGINE=InnoDB COMMENT='定时任务调度日志表';

-- dictionary
INSERT INTO sys_dict_type (dict_id, dict_name, dict_type, status, create_by, create_time, update_by, update_time, remark)
SELECT 4, '任务状态', 'sys_job_status', '0', 'admin', SYSDATE(), '', NULL, '任务状态列表'
WHERE NOT EXISTS (SELECT 1 FROM sys_dict_type WHERE dict_type = 'sys_job_status');

INSERT INTO sys_dict_type (dict_id, dict_name, dict_type, status, create_by, create_time, update_by, update_time, remark)
SELECT 5, '任务分组', 'sys_job_group', '0', 'admin', SYSDATE(), '', NULL, '任务分组列表'
WHERE NOT EXISTS (SELECT 1 FROM sys_dict_type WHERE dict_type = 'sys_job_group');

INSERT INTO sys_dict_data (dict_code, dict_sort, dict_label, dict_value, dict_type, css_class, list_class, is_default, status, create_by, create_time, update_by, update_time, remark)
SELECT 8, 1, '正常', '0', 'sys_job_status', '', 'primary', 'Y', '0', 'admin', SYSDATE(), '', NULL, '正常状态'
WHERE NOT EXISTS (SELECT 1 FROM sys_dict_data WHERE dict_type='sys_job_status' AND dict_value='0');

INSERT INTO sys_dict_data (dict_code, dict_sort, dict_label, dict_value, dict_type, css_class, list_class, is_default, status, create_by, create_time, update_by, update_time, remark)
SELECT 9, 2, '暂停', '1', 'sys_job_status', '', 'danger', 'N', '0', 'admin', SYSDATE(), '', NULL, '暂停状态'
WHERE NOT EXISTS (SELECT 1 FROM sys_dict_data WHERE dict_type='sys_job_status' AND dict_value='1');

INSERT INTO sys_dict_data (dict_code, dict_sort, dict_label, dict_value, dict_type, css_class, list_class, is_default, status, create_by, create_time, update_by, update_time, remark)
SELECT 10, 1, '默认', 'DEFAULT', 'sys_job_group', '', '', 'Y', '0', 'admin', SYSDATE(), '', NULL, '默认分组'
WHERE NOT EXISTS (SELECT 1 FROM sys_dict_data WHERE dict_type='sys_job_group' AND dict_value='DEFAULT');

INSERT INTO sys_dict_data (dict_code, dict_sort, dict_label, dict_value, dict_type, css_class, list_class, is_default, status, create_by, create_time, update_by, update_time, remark)
SELECT 11, 2, '系统', 'SYSTEM', 'sys_job_group', '', '', 'N', '0', 'admin', SYSDATE(), '', NULL, '系统分组'
WHERE NOT EXISTS (SELECT 1 FROM sys_dict_data WHERE dict_type='sys_job_group' AND dict_value='SYSTEM');

-- menu and permissions
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, url, target, menu_type, visible, is_refresh, perms, icon, create_by, create_time, update_by, update_time, remark)
SELECT 110, '定时任务', 1, 9, '/monitor/job', '', 'C', '0', '1', 'monitor:job:view', 'fa fa-tasks', 'admin', SYSDATE(), '', NULL, '定时任务菜单'
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE menu_id = 110);
UPDATE sys_menu SET parent_id = 1, order_num = 9, url = '/monitor/job', menu_type = 'C', visible = '0', perms = 'monitor:job:view', icon = 'fa fa-tasks'
WHERE menu_id = 110;

INSERT INTO sys_menu SELECT 1050, '任务查询', 110, 1, '#', '', 'F', '0', '1', 'monitor:job:list', '#', 'admin', SYSDATE(), '', NULL, ''
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE menu_id = 1050);
INSERT INTO sys_menu SELECT 1051, '任务新增', 110, 2, '#', '', 'F', '0', '1', 'monitor:job:add', '#', 'admin', SYSDATE(), '', NULL, ''
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE menu_id = 1051);
INSERT INTO sys_menu SELECT 1052, '任务修改', 110, 3, '#', '', 'F', '0', '1', 'monitor:job:edit', '#', 'admin', SYSDATE(), '', NULL, ''
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE menu_id = 1052);
INSERT INTO sys_menu SELECT 1053, '任务删除', 110, 4, '#', '', 'F', '0', '1', 'monitor:job:remove', '#', 'admin', SYSDATE(), '', NULL, ''
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE menu_id = 1053);
INSERT INTO sys_menu SELECT 1054, '状态修改', 110, 5, '#', '', 'F', '0', '1', 'monitor:job:changeStatus', '#', 'admin', SYSDATE(), '', NULL, ''
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE menu_id = 1054);
INSERT INTO sys_menu SELECT 1055, '任务详细', 110, 6, '#', '', 'F', '0', '1', 'monitor:job:detail', '#', 'admin', SYSDATE(), '', NULL, ''
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE menu_id = 1055);
INSERT INTO sys_menu SELECT 1056, '任务导出', 110, 7, '#', '', 'F', '0', '1', 'monitor:job:export', '#', 'admin', SYSDATE(), '', NULL, ''
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
SELECT 1, '系统默认（无参）', 'DEFAULT', 'qvsuTask.qvsuNoParams', '0/10 * * * * ?', '3', '1', '1', 'admin', SYSDATE(), '', NULL, ''
WHERE NOT EXISTS (SELECT 1 FROM sys_job WHERE job_id = 1);

INSERT INTO sys_job (job_id, job_name, job_group, invoke_target, cron_expression, misfire_policy, concurrent, status, create_by, create_time, update_by, update_time, remark)
SELECT 2, '系统默认（有参）', 'DEFAULT', 'qvsuTask.qvsuParams(''qvsu'')', '0/15 * * * * ?', '3', '1', '1', 'admin', SYSDATE(), '', NULL, ''
WHERE NOT EXISTS (SELECT 1 FROM sys_job WHERE job_id = 2);

INSERT INTO sys_job (job_id, job_name, job_group, invoke_target, cron_expression, misfire_policy, concurrent, status, create_by, create_time, update_by, update_time, remark)
SELECT 3, '系统默认（多参）', 'DEFAULT', 'qvsuTask.qvsuMultipleParams(''qvsu'', true, 2000L, 316.50D, 100)', '0/20 * * * * ?', '3', '1', '1', 'admin', SYSDATE(), '', NULL, ''
WHERE NOT EXISTS (SELECT 1 FROM sys_job WHERE job_id = 3);
