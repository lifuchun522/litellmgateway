import json
import uuid
from datetime import datetime

import db
from services.gateway_rules import can_retry, select_candidates


def _decode(row, field):
    item = dict(row)
    if item.get(field):
        item[field] = json.loads(item[field])
    return item


def dashboard():
    metrics = db.query_one(
        """SELECT COUNT(*) requestsToday,
                  COALESCE(ROUND(100.0 * SUM(CASE WHEN status = 'SUCCEEDED' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 1), 0) successRate,
                  COALESCE(ROUND(AVG(latency_ms)), 0) averageLatencyMs,
                  COALESCE(ROUND(SUM(cost), 6), 0) totalCost
             FROM gateway_request
            WHERE date(created_at) = date('now')"""
    )
    snapshot = db.query_one(
        "SELECT version, activated_at activatedAt, ack_summary ackSummary FROM gateway_snapshot WHERE status = 'ACTIVE' ORDER BY id DESC LIMIT 1"
    )
    endpoint = db.query_one(
        "SELECT COUNT(*) total, SUM(CASE WHEN status = 'HEALTHY' THEN 1 ELSE 0 END) healthy FROM gateway_endpoint"
    )
    app = db.query_one("SELECT COUNT(*) total FROM gateway_application WHERE status = 'ACTIVE'")
    return {
        **metrics,
        "activeSnapshot": snapshot,
        "endpoints": endpoint,
        "activeApplications": app["total"],
    }


def catalog():
    aliases = [_decode(row, "capabilities") for row in db.query("SELECT * FROM gateway_alias ORDER BY id")]
    endpoints = db.query(
        """SELECT e.id, e.code, e.name, e.model, e.base_url baseUrl,
                  e.data_grade dataGrade, e.priority, e.weight, e.latency_ms latencyMs,
                  e.status, e.secret_ref secretRef, e.input_price inputPrice,
                  e.output_price outputPrice, p.code providerCode, p.name providerName
             FROM gateway_endpoint e JOIN gateway_provider p ON p.id = e.provider_id
            ORDER BY e.priority, e.id"""
    )
    return {
        "applications": db.query("SELECT id, code, name, owner, data_grade dataGrade, status, daily_quota dailyQuota, monthly_budget monthlyBudget FROM gateway_application ORDER BY id"),
        "aliases": aliases,
        "providers": db.query("SELECT id, code, name, protocol, region, status FROM gateway_provider ORDER BY id"),
        "endpoints": endpoints,
    }


def list_policies():
    return db.query(
        """SELECT id, name, app_code appCode, alias_code aliasCode, strategy,
                  max_attempts maxAttempts, timeout_ms timeoutMs, status,
                  submitted_by submittedBy, security_approver securityApprover,
                  sre_approver sreApprover, snapshot_version snapshotVersion,
                  created_at createdAt, updated_at updatedAt
             FROM gateway_policy ORDER BY id DESC"""
    )


def _policy(policy_id, conn=None):
    row = db.query_one("SELECT * FROM gateway_policy WHERE id = ?", (policy_id,), conn)
    if not row:
        raise ValueError("策略不存在")
    return row


def _policy_view(policy_id, conn=None):
    row = _policy(policy_id, conn)
    return {
        "id": row["id"], "name": row["name"], "appCode": row["app_code"],
        "aliasCode": row["alias_code"], "strategy": row["strategy"],
        "maxAttempts": row["max_attempts"], "timeoutMs": row["timeout_ms"],
        "status": row["status"], "submittedBy": row["submitted_by"],
        "securityApprover": row["security_approver"], "sreApprover": row["sre_approver"],
        "snapshotVersion": row["snapshot_version"],
    }


def _audit(conn, action, object_type, object_id, actor, detail):
    payload = {
        "objectType": object_type,
        "objectId": str(object_id),
        **(detail or {}),
    }
    db.execute(
        "INSERT INTO audit_logs (user_id, username, action, detail) VALUES (NULL, ?, ?, ?)",
        (actor or "system", action, json.dumps(payload, ensure_ascii=False)), conn,
    )


def create_policy(data):
    required = ("name", "appCode", "aliasCode", "strategy", "submittedBy")
    missing = [key for key in required if not data.get(key)]
    if missing:
        raise ValueError("缺少必填字段：" + "、".join(missing))
    if not db.query_one("SELECT 1 FROM gateway_application WHERE code = ? AND status = 'ACTIVE'", (data["appCode"],)):
        raise ValueError("应用不存在或未启用")
    if not db.query_one("SELECT 1 FROM gateway_alias WHERE code = ? AND status = 'ACTIVE'", (data["aliasCode"],)):
        raise ValueError("模型别名不存在或未启用")

    def write(conn):
        policy_id = db.execute(
            """INSERT INTO gateway_policy
               (name, app_code, alias_code, strategy, max_attempts, timeout_ms, submitted_by)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (data["name"], data["appCode"], data["aliasCode"], data["strategy"],
             min(int(data.get("maxAttempts", 3)), 3), int(data.get("timeoutMs", 30000)), data["submittedBy"]), conn,
        )[0]
        _audit(conn, "POLICY_CREATED", "gateway_policy", policy_id, data["submittedBy"], data)
        return _policy_view(policy_id, conn)
    return db.transaction(write)


def submit_policy(policy_id):
    def write(conn):
        policy = _policy(policy_id, conn)
        if policy["status"] != "DRAFT":
            raise ValueError("仅草稿策略可提交")
        db.execute("UPDATE gateway_policy SET status = 'SECURITY_REVIEW', updated_at = CURRENT_TIMESTAMP WHERE id = ?", (policy_id,), conn)
        _audit(conn, "POLICY_SUBMITTED", "gateway_policy", policy_id, policy["submitted_by"], {})
        return _policy_view(policy_id, conn)
    return db.transaction(write)


def approve_policy(policy_id, stage, approver):
    if not approver:
        raise ValueError("审批人不能为空")
    stage = (stage or "").upper()

    def write(conn):
        policy = _policy(policy_id, conn)
        if approver == policy["submitted_by"]:
            raise ValueError("提交人与审批人必须分离")
        if stage == "SECURITY" and policy["status"] == "SECURITY_REVIEW":
            db.execute("UPDATE gateway_policy SET status = 'SRE_REVIEW', security_approver = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (approver, policy_id), conn)
        elif stage == "SRE" and policy["status"] == "SRE_REVIEW":
            if approver == policy["security_approver"]:
                raise ValueError("安全与 SRE 审批人必须分离")
            db.execute("UPDATE gateway_policy SET status = 'APPROVED', sre_approver = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (approver, policy_id), conn)
        else:
            raise ValueError("审批阶段或策略状态不匹配")
        _audit(conn, "POLICY_APPROVED_" + stage, "gateway_policy", policy_id, approver, {})
        return _policy_view(policy_id, conn)
    return db.transaction(write)


def publish_policy(policy_id):
    def write(conn):
        policy = _policy(policy_id, conn)
        if policy["status"] != "APPROVED":
            raise ValueError("策略必须完成安全与 SRE 审批后才能发布")
        if not db.query_one("SELECT 1 FROM gateway_alias_endpoint ae JOIN gateway_endpoint e ON e.id = ae.endpoint_id JOIN gateway_alias a ON a.id = ae.alias_id WHERE a.code = ? AND e.status = 'HEALTHY'", (policy["alias_code"],), conn):
            raise ValueError("策略没有可用健康端点")
        version = "snap-{}-{:03d}".format(datetime.now().strftime("%Y%m%d%H%M%S"), policy_id)
        compiled = {
            "appCode": policy["app_code"], "aliasCode": policy["alias_code"],
            "strategy": policy["strategy"], "maxAttempts": policy["max_attempts"],
            "retryBoundary": "BEFORE_FIRST_BYTE", "inheritance": ["GLOBAL", "ALIAS", "APP", "APP_ALIAS"],
        }
        db.execute("UPDATE gateway_snapshot SET status = 'INACTIVE' WHERE status = 'ACTIVE'", (), conn)
        db.execute("INSERT INTO gateway_snapshot (version, policy_id, compiled_config, ack_summary) VALUES (?, ?, ?, ?)", (version, policy_id, json.dumps(compiled), "cn-a: 2/2, cn-b: 2/2"), conn)
        db.execute("UPDATE gateway_policy SET status = 'PUBLISHED', snapshot_version = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (version, policy_id), conn)
        _audit(conn, "SNAPSHOT_PUBLISHED", "gateway_snapshot", version, "发布管理员", compiled)
        result = _policy_view(policy_id, conn)
        result["ackSummary"] = "cn-a: 2/2, cn-b: 2/2"
        return result
    return db.transaction(write)


def invoke(data):
    app_code = data.get("appCode")
    alias_code = data.get("model")
    if not app_code or not alias_code:
        raise ValueError("appCode 与 model 不能为空")
    app = db.query_one("SELECT * FROM gateway_application WHERE code = ? AND status = 'ACTIVE'", (app_code,))
    if not app:
        raise ValueError("应用身份无效")
    snapshot = db.query_one(
        """SELECT s.version, p.strategy, p.max_attempts maxAttempts FROM gateway_snapshot s
             JOIN gateway_policy p ON p.id = s.policy_id
            WHERE s.status = 'ACTIVE' AND p.app_code = ? AND p.alias_code = ? ORDER BY s.id DESC LIMIT 1""",
        (app_code, alias_code),
    )
    if not snapshot:
        raise ValueError("没有匹配的已激活策略快照")
    endpoints = db.query(
        """SELECT e.id, e.code, e.model, e.status, e.data_grade, e.priority, e.latency_ms,
                  e.input_price, e.output_price FROM gateway_endpoint e
             JOIN gateway_alias_endpoint ae ON ae.endpoint_id = e.id
             JOIN gateway_alias a ON a.id = ae.alias_id WHERE a.code = ?""", (alias_code,),
    )
    candidates = select_candidates(endpoints, app["data_grade"], snapshot["strategy"])
    if not candidates:
        raise ValueError("没有满足健康与数据分级要求的端点")
    trace_id = "tr-" + uuid.uuid4().hex[:16]
    prompt_tokens, completion_tokens = 128, 96

    def write(conn):
        request_id = db.execute(
            "INSERT INTO gateway_request (trace_id, app_code, alias_code, snapshot_version, status) VALUES (?, ?, ?, ?, 'PENDING')",
            (trace_id, app_code, alias_code, snapshot["version"]), conn,
        )[0]
        used = None
        attempts = 0
        for candidate in candidates:
            if attempts >= snapshot["maxAttempts"]:
                break
            attempts += 1
            simulated_failure = bool(data.get("simulateFailure")) and attempts == 1
            status = "FAILED" if simulated_failure else "SUCCEEDED"
            latency = candidate["latency_ms"] + attempts * 17
            db.execute(
                "INSERT INTO gateway_attempt (request_id, sequence, endpoint_code, status, error_code, latency_ms) VALUES (?, ?, ?, ?, ?, ?)",
                (request_id, attempts, candidate["code"], status, "UPSTREAM_503" if simulated_failure else None, latency), conn,
            )
            if not simulated_failure:
                used = candidate
                break
            if not can_retry(attempts, False, True):
                break
        if not used:
            total_latency = sum(
                row["latency_ms"]
                for row in db.query(
                    "SELECT latency_ms FROM gateway_attempt WHERE request_id = ?",
                    (request_id,),
                    conn,
                )
            )
            db.execute(
                "UPDATE gateway_request SET status = 'FAILED', latency_ms = ? WHERE id = ?",
                (total_latency, request_id),
                conn,
            )
            _audit(
                conn,
                "GATEWAY_FAILED",
                "gateway_request",
                trace_id,
                app_code,
                {"alias": alias_code, "attempts": attempts},
            )
            return {"error": "所有候选端点调用失败", "traceId": trace_id}
        cost = round(prompt_tokens * (used["input_price"] or 0) / 1000 + completion_tokens * (used["output_price"] or 0) / 1000, 8)
        total_latency = sum(row["latency_ms"] for row in db.query("SELECT latency_ms FROM gateway_attempt WHERE request_id = ?", (request_id,), conn))
        db.execute(
            """UPDATE gateway_request SET status = 'SUCCEEDED', prompt_tokens = ?, completion_tokens = ?,
                      cost = ?, latency_ms = ? WHERE id = ?""",
            (prompt_tokens, completion_tokens, cost, total_latency, request_id), conn,
        )
        _audit(conn, "GATEWAY_INVOKED", "gateway_request", trace_id, app_code, {"alias": alias_code, "attempts": attempts})
        return {"traceId": trace_id, "model": alias_code, "endpoint": used["code"], "attemptCount": attempts,
                "snapshotVersion": snapshot["version"], "usage": {"promptTokens": prompt_tokens, "completionTokens": completion_tokens, "cost": cost},
                "content": "网关运行正常：请求已完成身份校验、策略解析、端点选择和用量记账。"}
    result = db.transaction(write)
    if result.get("error"):
        raise ValueError("{}（traceId: {}）".format(result["error"], result["traceId"]))
    return result


def traces(limit=30):
    requests = db.query(
        """SELECT id, trace_id traceId, app_code appCode, alias_code aliasCode,
                  snapshot_version snapshotVersion, status, prompt_tokens promptTokens,
                  completion_tokens completionTokens, cost, latency_ms latencyMs,
                  created_at createdAt FROM gateway_request ORDER BY id DESC LIMIT ?""", (limit,),
    )
    for request in requests:
        request["attempts"] = db.query(
            """SELECT sequence, endpoint_code endpointCode, status, error_code errorCode,
                      latency_ms latencyMs, first_byte_sent firstByteSent, created_at createdAt
                 FROM gateway_attempt WHERE request_id = ? ORDER BY sequence""", (request.pop("id"),),
        )
    return requests


def reconciliations():
    return db.query(
        """SELECT id, provider_code providerCode, period, gateway_cost gatewayCost,
                  provider_cost providerCost, difference_rate differenceRate,
                  status, created_at createdAt FROM gateway_reconciliation ORDER BY id DESC"""
    )


def audits(limit=50):
    rows = db.query(
        """SELECT id, username actor, action, detail, created_at createdAt
             FROM audit_logs
            WHERE action LIKE 'POLICY_%'
               OR action LIKE 'SNAPSHOT_%'
               OR action LIKE 'GATEWAY_%'
            ORDER BY id DESC LIMIT ?""",
        (limit,),
    )
    for row in rows:
        try:
            row["detail"] = json.loads(row.get("detail") or "{}")
        except json.JSONDecodeError:
            row["detail"] = {"raw": row.get("detail")}
    return rows
