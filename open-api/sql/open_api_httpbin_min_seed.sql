-- OpenAPI httpbin 最小化回归数据（幂等）
-- 用途：仅验证 httpbin 典型转发链路（GET Query / POST JSON / Header 回显）
SET NAMES utf8mb4;

DELETE FROM open_app_api WHERE app_id = 90001 AND api_id IN (90103, 90104, 90105);
DELETE FROM open_api WHERE s_id IN (90103, 90104, 90105);

INSERT INTO open_app(s_id, app_name, app_key, app_secret, contact, status, expire_time, remark, create_time, update_time)
VALUES (90001, 'OpenAPI自测应用', 'ak_selftest_demo', 'sk_selftest_demo_1234567890abcdef', 'selftest', 1, NULL, 'httpbin最小化回归', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  app_name = VALUES(app_name),
  app_key = VALUES(app_key),
  app_secret = VALUES(app_secret),
  status = 1,
  update_time = NOW();

INSERT INTO open_api(s_id, api_name, api_path, method, target_url, timeout_ms, status, need_sign, description, req_example, resp_example, create_time)
VALUES
(90103, '最小回归-httpbin-get', '/open/selftest/httpbin/get', 'GET', 'https://httpbin.org/get', 6000, 1, 1,
 '验证 Query 参数转发', '{"q":"hello","page":"1"}', '{"args":{"q":"hello","page":"1"}}', NOW()),
(90104, '最小回归-httpbin-post', '/open/selftest/httpbin/post', 'POST', 'https://httpbin.org/post', 6000, 1, 1,
 '验证 JSON Body 转发', '{"orderNo":"SO1001","amount":"88.5"}', '{"json":{"orderNo":"SO1001","amount":"88.5"}}', NOW()),
(90105, '最小回归-httpbin-headers', '/open/selftest/httpbin/headers', 'GET', 'https://httpbin.org/headers', 6000, 1, 1,
 '验证头透传与 TraceId', '{}', '{"headers":{"X-Trace-Id":"..."}}', NOW());

INSERT INTO open_app_api(app_id, api_id, create_time)
VALUES
(90001, 90103, NOW()),
(90001, 90104, NOW()),
(90001, 90105, NOW())
ON DUPLICATE KEY UPDATE create_time = VALUES(create_time);
