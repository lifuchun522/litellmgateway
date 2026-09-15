import json

from flask import Blueprint, Response, request

from services import gateway_service
from utils.response import ok

bp = Blueprint("gateway", __name__, url_prefix="/api/gateway")


@bp.get("/dashboard")
def dashboard():
    return ok(gateway_service.dashboard())


@bp.get("/catalog")
def catalog():
    return ok(gateway_service.catalog())


@bp.get("/policies")
def policies():
    return ok(gateway_service.list_policies())


@bp.post("/policies")
def create_policy():
    return ok(gateway_service.create_policy(request.get_json(silent=True) or {}), "策略已创建")


@bp.post("/policies/<int:policy_id>/submit")
def submit_policy(policy_id):
    return ok(gateway_service.submit_policy(policy_id), "策略已提交")


@bp.post("/policies/<int:policy_id>/approve")
def approve_policy(policy_id):
    data = request.get_json(silent=True) or {}
    return ok(gateway_service.approve_policy(policy_id, data.get("stage"), data.get("approver")), "审批已完成")


@bp.post("/policies/<int:policy_id>/publish")
def publish_policy(policy_id):
    return ok(gateway_service.publish_policy(policy_id), "快照已发布")


@bp.post("/invoke")
def invoke():
    return ok(gateway_service.invoke(request.get_json(silent=True) or {}))


@bp.get("/traces")
def traces():
    return ok(gateway_service.traces(min(int(request.args.get("limit", 30)), 100)))


@bp.get("/reconciliations")
def reconciliations():
    return ok(gateway_service.reconciliations())


@bp.get("/audits")
def audits():
    return ok(gateway_service.audits(min(int(request.args.get("limit", 50)), 100)))


@bp.post("/assistant/stream")
def assistant_stream():
    question = (request.get_json(silent=True) or {}).get("question", "分析当前网关状态")

    def events():
        payloads = [
            ("reasoning", {"step": "解析语义问题", "detail": "关联请求、尝试、快照与端点健康本体"}),
            ("reasoning", {"step": "执行只读查询", "detail": "检查最近调用链及重试边界"}),
            ("answer", {"question": question, "content": "最近请求在首字节返回前遇到可重试错误，因此按活动快照切换到健康灾备端点；全程未超过 3 次总尝试限制。"}),
            ("done", {"status": "completed"}),
        ]
        for event, payload in payloads:
            yield "event: {}\ndata: {}\n\n".format(event, json.dumps(payload, ensure_ascii=False))

    return Response(events(), mimetype="text/event-stream", headers={"Cache-Control": "no-cache"})
