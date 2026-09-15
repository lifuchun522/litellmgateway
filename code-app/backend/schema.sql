-- 技术底座数据库结构（SQLite）
-- 对齐《系统管理+流程引擎需求规格说明书》第 3 章

-- ============ 系统管理（RBAC + ABAC，对应 M5） ============

CREATE TABLE IF NOT EXISTS sys_user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    real_name VARCHAR(50),
    email VARCHAR(100),
    phone VARCHAR(20),
    actor_type VARCHAR(20) DEFAULT 'HUMAN',
    department_id INTEGER,
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sys_role (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    parent_id INTEGER DEFAULT 0,
    description VARCHAR(255),
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sys_permission (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    target_type VARCHAR(20) NOT NULL,
    target_ref VARCHAR(100) NOT NULL,
    data_scope VARCHAR(20) DEFAULT 'ALL',
    abac_condition VARCHAR(255),
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sys_resource (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id INTEGER DEFAULT 0,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    permission_code VARCHAR(100),
    type VARCHAR(20) NOT NULL,
    path VARCHAR(200),
    component VARCHAR(200),
    icon VARCHAR(50),
    http_method VARCHAR(10),
    sort_order INTEGER DEFAULT 0,
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sys_user_role (
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS sys_role_permission (
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS sys_role_resource (
    role_id INTEGER NOT NULL,
    resource_id INTEGER NOT NULL,
    PRIMARY KEY (role_id, resource_id)
);

-- ============ 流程引擎（对应 M6） ============

CREATE TABLE IF NOT EXISTS flow_definition (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    flow_type VARCHAR(20) NOT NULL,
    trigger_type VARCHAR(20) DEFAULT 'MANUAL',
    trigger_behavior VARCHAR(100),
    description VARCHAR(255),
    node_graph TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    status TINYINT DEFAULT 0,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flow_instance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    def_id INTEGER NOT NULL,
    business_key VARCHAR(50) NOT NULL,
    business_object_refs TEXT,
    current_activity_ids TEXT,
    variables TEXT,
    creator_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'RUNNING',
    priority INTEGER DEFAULT 0,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flow_task (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    instance_id INTEGER NOT NULL,
    activity_id VARCHAR(50) NOT NULL,
    activity_type VARCHAR(20) NOT NULL,
    activity_name VARCHAR(100),
    role_ref VARCHAR(50),
    behavior_ref VARCHAR(100),
    sub_flow_ref VARCHAR(100),
    assignee_id INTEGER,
    assignee_name VARCHAR(50),
    status VARCHAR(20) DEFAULT 'TODO',
    action VARCHAR(20),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    claimed_at DATETIME,
    done_at DATETIME,
    deadline DATETIME
);

CREATE TABLE IF NOT EXISTS flow_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    instance_id INTEGER NOT NULL,
    activity_id VARCHAR(50),
    activity_name VARCHAR(100),
    operator_id INTEGER,
    operator_name VARCHAR(50),
    action VARCHAR(20),
    comment TEXT,
    from_activity VARCHAR(50),
    to_activity VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============ 审计日志 ============

CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    username VARCHAR(50),
    action VARCHAR(100),
    detail TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============ 示例业务表：客户申请 ============

CREATE TABLE IF NOT EXISTS customer_application (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_no VARCHAR(50) UNIQUE,
    customer_name VARCHAR(100) NOT NULL,
    customer_type VARCHAR(20),
    industry VARCHAR(50),
    contact_person VARCHAR(50),
    contact_phone VARCHAR(20),
    customer_level VARCHAR(20),
    address VARCHAR(200),
    remark VARCHAR(500),
    status VARCHAR(30) DEFAULT '草稿',
    applicant_id INTEGER,
    applicant_name VARCHAR(50),
    instance_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============ LLM Gateway（由 M1-M6 本体模型编译） ============

CREATE TABLE IF NOT EXISTS gateway_application (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(80) UNIQUE NOT NULL,
    name VARCHAR(120) NOT NULL,
    owner VARCHAR(80) NOT NULL,
    data_grade VARCHAR(20) NOT NULL DEFAULT 'INTERNAL',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    daily_quota INTEGER NOT NULL DEFAULT 1000000,
    monthly_budget REAL NOT NULL DEFAULT 1000,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gateway_credential (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id INTEGER NOT NULL,
    key_prefix VARCHAR(32) UNIQUE NOT NULL,
    secret_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    expires_at DATETIME,
    rotated_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (app_id) REFERENCES gateway_application(id)
);

CREATE TABLE IF NOT EXISTS gateway_alias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(80) UNIQUE NOT NULL,
    name VARCHAR(120) NOT NULL,
    capabilities TEXT NOT NULL,
    visibility VARCHAR(20) NOT NULL DEFAULT 'INTERNAL',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gateway_provider (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(80) UNIQUE NOT NULL,
    name VARCHAR(120) NOT NULL,
    protocol VARCHAR(30) NOT NULL DEFAULT 'OPENAI',
    region VARCHAR(40),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS gateway_endpoint (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_id INTEGER NOT NULL,
    code VARCHAR(80) UNIQUE NOT NULL,
    name VARCHAR(120) NOT NULL,
    model VARCHAR(120) NOT NULL,
    base_url VARCHAR(255) NOT NULL,
    data_grade VARCHAR(20) NOT NULL DEFAULT 'INTERNAL',
    priority INTEGER NOT NULL DEFAULT 1,
    weight INTEGER NOT NULL DEFAULT 100,
    latency_ms INTEGER NOT NULL DEFAULT 100,
    status VARCHAR(20) NOT NULL DEFAULT 'HEALTHY',
    secret_ref VARCHAR(160) NOT NULL,
    input_price REAL,
    output_price REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES gateway_provider(id)
);

CREATE TABLE IF NOT EXISTS gateway_alias_endpoint (
    alias_id INTEGER NOT NULL,
    endpoint_id INTEGER NOT NULL,
    PRIMARY KEY (alias_id, endpoint_id),
    FOREIGN KEY (alias_id) REFERENCES gateway_alias(id),
    FOREIGN KEY (endpoint_id) REFERENCES gateway_endpoint(id)
);

CREATE TABLE IF NOT EXISTS gateway_policy (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(160) NOT NULL,
    app_code VARCHAR(80) NOT NULL,
    alias_code VARCHAR(80) NOT NULL,
    strategy VARCHAR(40) NOT NULL DEFAULT 'LATENCY_FIRST',
    max_attempts INTEGER NOT NULL DEFAULT 3,
    timeout_ms INTEGER NOT NULL DEFAULT 30000,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    submitted_by VARCHAR(80),
    security_approver VARCHAR(80),
    sre_approver VARCHAR(80),
    snapshot_version VARCHAR(80),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gateway_snapshot (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version VARCHAR(80) UNIQUE NOT NULL,
    policy_id INTEGER NOT NULL,
    compiled_config TEXT NOT NULL,
    ack_summary VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    activated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (policy_id) REFERENCES gateway_policy(id)
);

CREATE TABLE IF NOT EXISTS gateway_request (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trace_id VARCHAR(80) UNIQUE NOT NULL,
    app_code VARCHAR(80) NOT NULL,
    alias_code VARCHAR(80) NOT NULL,
    snapshot_version VARCHAR(80),
    status VARCHAR(20) NOT NULL,
    prompt_tokens INTEGER NOT NULL DEFAULT 0,
    completion_tokens INTEGER NOT NULL DEFAULT 0,
    cost REAL NOT NULL DEFAULT 0,
    latency_ms INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gateway_attempt (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL,
    sequence INTEGER NOT NULL,
    endpoint_code VARCHAR(80) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_code VARCHAR(80),
    latency_ms INTEGER NOT NULL DEFAULT 0,
    first_byte_sent TINYINT NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES gateway_request(id)
);

CREATE TABLE IF NOT EXISTS gateway_reconciliation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_code VARCHAR(80) NOT NULL,
    period VARCHAR(20) NOT NULL,
    gateway_cost REAL NOT NULL,
    provider_cost REAL NOT NULL,
    difference_rate REAL NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
