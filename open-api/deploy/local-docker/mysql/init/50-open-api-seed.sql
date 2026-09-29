-- OpenAPI seed data
SET NAMES utf8mb4;

DELETE FROM open_app_api WHERE app_id = 90001 OR api_id IN (90001, 90002, 90003, 90004, 90005, 90006, 90007, 90008, 90009);
DELETE FROM open_api WHERE s_id IN (90001, 90002, 90003, 90004, 90005, 90006, 90007, 90008, 90009);
DELETE FROM open_app WHERE s_id = 90001;

INSERT INTO open_app(s_id, app_name, app_key, app_secret, contact, status, expire_time, remark, create_time, update_time)
VALUES (90001, 'OpenAPI Selftest App', 'ak_selftest_demo', 'sk_selftest_demo_1234567890abcdef', 'selftest', 1, NULL, 'selftest seed', NOW(), NOW());

INSERT INTO open_api(s_id, api_name, api_path, method, target_url, timeout_ms, status, need_sign, description, req_example, resp_example, create_time)
VALUES (90001, 'HTTPBin-GET', '/open/selftest/httpbin/get', 'GET', 'https://httpbin.org/get', 6000, 1, 1,
        'GET 查询参数示例', '{"demo":"1","category":"get"}', '{"args":{"demo":"1","category":"get"}}', NOW());

INSERT INTO open_api(s_id, api_name, api_path, method, target_url, timeout_ms, status, need_sign, description, req_example, resp_example, create_time)
VALUES (90002, 'HTTPBin-POST', '/open/selftest/httpbin/post', 'POST', 'https://httpbin.org/post', 6000, 1, 1,
        'POST JSON 示例', '{"orderNo":"SO1001","amount":88.5}', '{"json":{"orderNo":"SO1001","amount":88.5}}', NOW());

INSERT INTO open_api(s_id, api_name, api_path, method, target_url, timeout_ms, status, need_sign, description, req_example, resp_example, create_time)
VALUES (90003, 'HTTPBin-PUT', '/open/selftest/httpbin/put', 'PUT', 'https://httpbin.org/put', 6000, 1, 1,
        'PUT JSON 示例', '{"name":"qvsu","status":"ok"}', '{"json":{"name":"qvsu","status":"ok"}}', NOW());

INSERT INTO open_api(s_id, api_name, api_path, method, target_url, timeout_ms, status, need_sign, description, req_example, resp_example, create_time)
VALUES (90004, 'HTTPBin-DELETE', '/open/selftest/httpbin/delete', 'DELETE', 'https://httpbin.org/delete', 6000, 1, 1,
        'DELETE 请求示例', '{"id":"A001"}', '{"json":{"id":"A001"}}', NOW());

INSERT INTO open_api(s_id, api_name, api_path, method, target_url, timeout_ms, status, need_sign, description, req_example, resp_example, create_time)
VALUES (90005, 'HTTPBin-Headers', '/open/selftest/httpbin/headers', 'GET', 'https://httpbin.org/headers', 6000, 1, 1,
        'Headers 回显示例', '{}', '{"headers":{"X-Trace-Id":"..."}}', NOW());

INSERT INTO open_api(s_id, api_name, api_path, method, target_url, timeout_ms, status, need_sign, description, req_example, resp_example, create_time)
VALUES (90006, 'HTTPBin-IP', '/open/selftest/httpbin/ip', 'GET', 'https://httpbin.org/ip', 6000, 1, 1,
        '出口IP示例', '{}', '{"origin":"x.x.x.x"}', NOW());

INSERT INTO open_api(s_id, api_name, api_path, method, target_url, timeout_ms, status, need_sign, description, req_example, resp_example, create_time)
VALUES (90007, 'HTTPBin-UserAgent', '/open/selftest/httpbin/user-agent', 'GET', 'https://httpbin.org/user-agent', 6000, 1, 1,
        'User-Agent 回显示例', '{}', '{"user-agent":"..."}', NOW());

INSERT INTO open_api(s_id, api_name, api_path, method, target_url, timeout_ms, status, need_sign, description, req_example, resp_example, create_time)
VALUES (90008, 'HTTPBin-UUID', '/open/selftest/httpbin/uuid', 'GET', 'https://httpbin.org/uuid', 6000, 1, 1,
        'UUID 生成示例', '{}', '{"uuid":"..."}', NOW());

INSERT INTO open_api(s_id, api_name, api_path, method, target_url, timeout_ms, status, need_sign, description, req_example, resp_example, create_time)
VALUES (90009, 'HTTPBin-Timeout', '/open/selftest/httpbin/timeout', 'GET', 'http://10.255.255.1:81/timeout', 1500, 1, 1,
        '超时错误示例', '{}', '{"code":50002}', NOW());

INSERT INTO open_app_api(app_id, api_id, create_time)
VALUES (90001, 90001, NOW()),
       (90001, 90002, NOW()),
       (90001, 90003, NOW()),
       (90001, 90004, NOW()),
       (90001, 90005, NOW()),
       (90001, 90006, NOW()),
       (90001, 90007, NOW()),
       (90001, 90008, NOW()),
       (90001, 90009, NOW());
