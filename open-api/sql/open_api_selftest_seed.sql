-- OpenAPI 联调自测初始化数据（幂等）
-- 执行前请先确保已执行 sql/open_api.sql
SET NAMES utf8mb4;

DELETE FROM open_app_api WHERE app_id = 90001 OR api_id IN (90001, 90002, 90003, 90004, 90005);
DELETE FROM open_api WHERE s_id IN (90001, 90002, 90003, 90004, 90005);
DELETE FROM open_app WHERE s_id = 90001;

INSERT INTO open_app(s_id, app_name, app_key, app_secret, contact, status, expire_time, remark, create_time, update_time)
VALUES (90001, 'OpenAPI自测应用', 'ak_selftest_demo', 'sk_selftest_demo_1234567890abcdef', 'selftest', 1, NULL, '联调自测专用', NOW(), NOW());

-- 成功链路：授权后可调用，转发到匿名接口 /common/captchaImage
INSERT INTO open_api(s_id, api_name, api_path, method, target_url, timeout_ms, status, need_sign, description, req_example, resp_example, create_time)
VALUES (90001, '自测-成功链路', '/open/selftest/success', 'GET', 'http://127.0.0.1:80/common/captchaImage', 5000, 1, 1,
        '用于验证签名、权限、转发、traceId、日志', '{}', '{"uuid":"...","img":"..."}', NOW());

-- 失败链路：用于触发超时（50002），可根据本机网络情况调整地址
INSERT INTO open_api(s_id, api_name, api_path, method, target_url, timeout_ms, status, need_sign, description, req_example, resp_example, create_time)
VALUES (90002, '自测-超时链路', '/open/selftest/timeout', 'GET', 'http://10.255.255.1:81/timeout', 1500, 1, 1,
        '用于验证请求超时错误码 50002', '{}', '{"code":50002}', NOW());

-- httpbin 典型接口：GET + Query 参数
INSERT INTO open_api(s_id, api_name, api_path, method, target_url, timeout_ms, status, need_sign, description, req_example, resp_example, create_time)
VALUES (90003, '自测-httpbin-get', '/open/selftest/httpbin/get', 'GET', 'https://httpbin.org/get', 6000, 1, 1,
        '用于验证 Query 参数转发与回显', '{"q":"hello","page":"1"}', '{"args":{"q":"hello","page":"1"}}', NOW());

-- httpbin 典型接口：POST + JSON Body
INSERT INTO open_api(s_id, api_name, api_path, method, target_url, timeout_ms, status, need_sign, description, req_example, resp_example, create_time)
VALUES (90004, '自测-httpbin-post', '/open/selftest/httpbin/post', 'POST', 'https://httpbin.org/post', 6000, 1, 1,
        '用于验证 JSON Body 转发与回显', '{"orderNo":"SO1001","amount":88.5}', '{"json":{"orderNo":"SO1001","amount":88.5}}', NOW());

-- httpbin 典型接口：Header 回显
INSERT INTO open_api(s_id, api_name, api_path, method, target_url, timeout_ms, status, need_sign, description, req_example, resp_example, create_time)
VALUES (90005, '自测-httpbin-headers', '/open/selftest/httpbin/headers', 'GET', 'https://httpbin.org/headers', 6000, 1, 1,
        '用于验证透传头与 TraceId', '{}', '{"headers":{"X-Trace-Id":"..."}}', NOW());

-- 仅授权 success 与 httpbin 相关接口，不授权 timeout（用于验证 40004）
INSERT INTO open_app_api(app_id, api_id, create_time)
VALUES (90001, 90001, NOW()),
       (90001, 90003, NOW()),
       (90001, 90004, NOW()),
       (90001, 90005, NOW());
