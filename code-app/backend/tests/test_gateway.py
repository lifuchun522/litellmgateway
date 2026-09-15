import importlib
import os
import tempfile
import unittest
from unittest.mock import patch


class GatewayContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        os.environ["APP_DB_PATH"] = os.path.join(cls.tmp.name, "gateway-test.db")
        app_module = importlib.import_module("app")
        cls.app = app_module.create_app()
        cls.app.config.update(TESTING=True)
        cls.client = cls.app.test_client()

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def test_dashboard_exposes_operational_metrics(self):
        response = self.client.get("/api/gateway/dashboard")
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertTrue(payload["success"])
        self.assertGreaterEqual(payload["data"]["requestsToday"], 1)
        self.assertIn("successRate", payload["data"])
        self.assertIn("activeSnapshot", payload["data"])

    def test_catalog_contains_alias_provider_and_endpoint(self):
        response = self.client.get("/api/gateway/catalog")
        data = response.get_json()["data"]
        self.assertTrue(any(item["code"] == "smart-chat" for item in data["aliases"]))
        self.assertTrue(any(item["code"] == "openai" for item in data["providers"]))
        self.assertTrue(any(item["status"] == "HEALTHY" for item in data["endpoints"]))

    def test_policy_must_be_approved_in_order_before_publish(self):
        created = self.client.post(
            "/api/gateway/policies",
            json={
                "name": "研发应用智能路由",
                "appCode": "research-copilot",
                "aliasCode": "smart-chat",
                "strategy": "LATENCY_FIRST",
                "submittedBy": "产品负责人",
            },
        ).get_json()["data"]
        policy_id = created["id"]

        submit = self.client.post(f"/api/gateway/policies/{policy_id}/submit")
        self.assertEqual(submit.get_json()["data"]["status"], "SECURITY_REVIEW")

        invalid_publish = self.client.post(f"/api/gateway/policies/{policy_id}/publish")
        self.assertEqual(invalid_publish.status_code, 400)

        security = self.client.post(
            f"/api/gateway/policies/{policy_id}/approve",
            json={"stage": "SECURITY", "approver": "安全审批员"},
        ).get_json()["data"]
        self.assertEqual(security["status"], "SRE_REVIEW")

        sre = self.client.post(
            f"/api/gateway/policies/{policy_id}/approve",
            json={"stage": "SRE", "approver": "SRE审批员"},
        ).get_json()["data"]
        self.assertEqual(sre["status"], "APPROVED")

        published = self.client.post(f"/api/gateway/policies/{policy_id}/publish")
        self.assertEqual(published.status_code, 200)
        self.assertEqual(published.get_json()["data"]["status"], "PUBLISHED")
        self.assertTrue(published.get_json()["data"]["snapshotVersion"].startswith("snap-"))

    def test_invoke_records_request_and_retry_attempt_chain(self):
        response = self.client.post(
            "/api/gateway/invoke",
            json={
                "appCode": "research-copilot",
                "model": "smart-chat",
                "messages": [{"role": "user", "content": "总结网关运行状态"}],
                "simulateFailure": True,
            },
        )
        self.assertEqual(response.status_code, 200)
        result = response.get_json()["data"]
        self.assertEqual(result["attemptCount"], 2)
        self.assertEqual(result["model"], "smart-chat")

        traces = self.client.get("/api/gateway/traces").get_json()["data"]
        trace = next(item for item in traces if item["traceId"] == result["traceId"])
        self.assertEqual(len(trace["attempts"]), 2)
        self.assertEqual(trace["attempts"][0]["status"], "FAILED")
        self.assertEqual(trace["attempts"][1]["status"], "SUCCEEDED")

    def test_failed_invoke_preserves_request_and_attempt_trace(self):
        import db

        active_policy = db.query_one(
            """SELECT p.id FROM gateway_policy p
                 JOIN gateway_snapshot s ON s.policy_id = p.id
                WHERE s.status = 'ACTIVE' AND p.app_code = ? AND p.alias_code = ?""",
            ("research-copilot", "smart-chat"),
        )
        self.assertIsNotNone(active_policy)
        db.execute(
            "UPDATE gateway_policy SET max_attempts = 1 WHERE id = ?",
            (active_policy["id"],),
        )
        try:
            before = len(self.client.get("/api/gateway/traces").get_json()["data"])
            response = self.client.post(
                "/api/gateway/invoke",
                json={
                    "appCode": "research-copilot",
                    "model": "smart-chat",
                    "messages": [{"role": "user", "content": "验证失败追踪"}],
                    "simulateFailure": True,
                },
            )

            self.assertEqual(response.status_code, 400)
            traces = self.client.get("/api/gateway/traces").get_json()["data"]
            self.assertEqual(len(traces), before + 1)
            self.assertEqual(traces[0]["status"], "FAILED")
            self.assertEqual(len(traces[0]["attempts"]), 1)
            self.assertEqual(traces[0]["attempts"][0]["errorCode"], "UPSTREAM_503")
        finally:
            db.execute(
                "UPDATE gateway_policy SET max_attempts = 3 WHERE id = ?",
                (active_policy["id"],),
            )

    def test_assistant_stream_uses_named_sse_events(self):
        response = self.client.post(
            "/api/gateway/assistant/stream",
            json={"question": "为什么刚才请求切换了端点？"},
        )
        body = response.get_data(as_text=True)
        self.assertEqual(response.mimetype, "text/event-stream")
        self.assertIn("event: reasoning", body)
        self.assertIn("event: answer", body)
        self.assertIn("event: done", body)

    def test_audit_query_exposes_structured_gateway_events(self):
        audits = self.client.get("/api/gateway/audits").get_json()["data"]
        self.assertGreaterEqual(len(audits), 1)
        self.assertIn("action", audits[0])
        self.assertIsInstance(audits[0]["detail"], dict)


class GatewayRuleTest(unittest.TestCase):
    def test_retry_is_capped_and_only_before_first_byte(self):
        from services.gateway_rules import can_retry

        self.assertTrue(can_retry(attempt_count=1, first_byte_sent=False, retryable=True))
        self.assertFalse(can_retry(attempt_count=3, first_byte_sent=False, retryable=True))
        self.assertFalse(can_retry(attempt_count=1, first_byte_sent=True, retryable=True))

    def test_candidate_selection_filters_unhealthy_and_data_grade(self):
        from services.gateway_rules import select_candidates

        endpoints = [
            {"id": 1, "status": "HEALTHY", "data_grade": "INTERNAL", "priority": 2, "latency_ms": 90},
            {"id": 2, "status": "OPEN", "data_grade": "CONFIDENTIAL", "priority": 1, "latency_ms": 30},
            {"id": 3, "status": "HEALTHY", "data_grade": "PUBLIC", "priority": 3, "latency_ms": 50},
        ]
        selected = select_candidates(endpoints, required_grade="INTERNAL", strategy="LATENCY_FIRST")
        self.assertEqual([item["id"] for item in selected], [1])


class SettingsTest(unittest.TestCase):
    def test_sensitive_settings_support_environment_overrides(self):
        from config import settings

        with patch.dict(
            os.environ,
            {
                "APP_SECRET_KEY": "runtime-app-secret",
                "JWT_SECRET": "runtime-jwt-secret",
                "DEFAULT_ADMIN_PASSWORD": "runtime-admin-password",
            },
        ):
            self.assertEqual(settings.get("app.secret_key"), "runtime-app-secret")
            self.assertEqual(settings.get("auth.jwt_secret"), "runtime-jwt-secret")
            self.assertEqual(
                settings.get("auth.default_admin_password"),
                "runtime-admin-password",
            )


if __name__ == "__main__":
    unittest.main()
