-- OpenAPI menu
SET NAMES utf8mb4;

DELETE FROM sys_role_menu WHERE menu_id BETWEEN 2100 AND 2150;
DELETE FROM sys_menu WHERE menu_id BETWEEN 2100 AND 2150;

INSERT INTO sys_menu VALUES ('2100', 'OpenAPI管理', '1', '10', '#', '', 'M', '0', '1', '', 'fa fa-plug', 'admin', SYSDATE(), '', NULL, 'OpenAPI目录');
INSERT INTO sys_menu VALUES ('2101', '应用管理', '2100', '1', '/admin/open/app', '', 'C', '0', '1', 'open:app:view', '#', 'admin', SYSDATE(), '', NULL, '应用管理菜单');
INSERT INTO sys_menu VALUES ('2102', '接口管理', '2100', '2', '/admin/open/api', '', 'C', '0', '1', 'open:api:view', '#', 'admin', SYSDATE(), '', NULL, '接口管理菜单');
INSERT INTO sys_menu VALUES ('2103', '授权管理', '2100', '3', '/admin/open/auth', '', 'C', '0', '1', 'open:auth:view', '#', 'admin', SYSDATE(), '', NULL, '授权管理菜单');
INSERT INTO sys_menu VALUES ('2104', '调用日志', '2100', '4', '/admin/open/log', '', 'C', '0', '1', 'open:log:view', '#', 'admin', SYSDATE(), '', NULL, '调用日志菜单');
INSERT INTO sys_menu VALUES ('2105', '文档管理', '2100', '5', '/admin/open/doc', '', 'C', '0', '1', 'open:doc:view', '#', 'admin', SYSDATE(), '', NULL, '文档管理菜单');

INSERT INTO sys_menu VALUES ('2110', '应用查询', '2101', '1', '#', '', 'F', '0', '1', 'open:app:list', '#', 'admin', SYSDATE(), '', NULL, '');
INSERT INTO sys_menu VALUES ('2111', '应用新增', '2101', '2', '#', '', 'F', '0', '1', 'open:app:add', '#', 'admin', SYSDATE(), '', NULL, '');
INSERT INTO sys_menu VALUES ('2112', '应用修改', '2101', '3', '#', '', 'F', '0', '1', 'open:app:edit', '#', 'admin', SYSDATE(), '', NULL, '');
INSERT INTO sys_menu VALUES ('2113', '应用删除', '2101', '4', '#', '', 'F', '0', '1', 'open:app:remove', '#', 'admin', SYSDATE(), '', NULL, '');

INSERT INTO sys_menu VALUES ('2120', '接口查询', '2102', '1', '#', '', 'F', '0', '1', 'open:api:list', '#', 'admin', SYSDATE(), '', NULL, '');
INSERT INTO sys_menu VALUES ('2121', '接口新增', '2102', '2', '#', '', 'F', '0', '1', 'open:api:add', '#', 'admin', SYSDATE(), '', NULL, '');
INSERT INTO sys_menu VALUES ('2122', '接口修改', '2102', '3', '#', '', 'F', '0', '1', 'open:api:edit', '#', 'admin', SYSDATE(), '', NULL, '');
INSERT INTO sys_menu VALUES ('2123', '接口删除', '2102', '4', '#', '', 'F', '0', '1', 'open:api:remove', '#', 'admin', SYSDATE(), '', NULL, '');

INSERT INTO sys_menu VALUES ('2130', '授权保存', '2103', '1', '#', '', 'F', '0', '1', 'open:auth:save', '#', 'admin', SYSDATE(), '', NULL, '');
INSERT INTO sys_menu VALUES ('2140', '日志查询', '2104', '1', '#', '', 'F', '0', '1', 'open:log:list', '#', 'admin', SYSDATE(), '', NULL, '');
INSERT INTO sys_menu VALUES ('2150', '文档生成', '2105', '1', '#', '', 'F', '0', '1', 'open:doc:generate', '#', 'admin', SYSDATE(), '', NULL, '');

INSERT INTO sys_role_menu VALUES ('1', '2100');
INSERT INTO sys_role_menu VALUES ('1', '2101');
INSERT INTO sys_role_menu VALUES ('1', '2102');
INSERT INTO sys_role_menu VALUES ('1', '2103');
INSERT INTO sys_role_menu VALUES ('1', '2104');
INSERT INTO sys_role_menu VALUES ('1', '2105');
INSERT INTO sys_role_menu VALUES ('1', '2110');
INSERT INTO sys_role_menu VALUES ('1', '2111');
INSERT INTO sys_role_menu VALUES ('1', '2112');
INSERT INTO sys_role_menu VALUES ('1', '2113');
INSERT INTO sys_role_menu VALUES ('1', '2120');
INSERT INTO sys_role_menu VALUES ('1', '2121');
INSERT INTO sys_role_menu VALUES ('1', '2122');
INSERT INTO sys_role_menu VALUES ('1', '2123');
INSERT INTO sys_role_menu VALUES ('1', '2130');
INSERT INTO sys_role_menu VALUES ('1', '2140');
INSERT INTO sys_role_menu VALUES ('1', '2150');

INSERT INTO sys_role_menu VALUES ('2', '2100');
INSERT INTO sys_role_menu VALUES ('2', '2101');
INSERT INTO sys_role_menu VALUES ('2', '2102');
INSERT INTO sys_role_menu VALUES ('2', '2103');
INSERT INTO sys_role_menu VALUES ('2', '2104');
INSERT INTO sys_role_menu VALUES ('2', '2105');
INSERT INTO sys_role_menu VALUES ('2', '2110');
INSERT INTO sys_role_menu VALUES ('2', '2111');
INSERT INTO sys_role_menu VALUES ('2', '2112');
INSERT INTO sys_role_menu VALUES ('2', '2113');
INSERT INTO sys_role_menu VALUES ('2', '2120');
INSERT INTO sys_role_menu VALUES ('2', '2121');
INSERT INTO sys_role_menu VALUES ('2', '2122');
INSERT INTO sys_role_menu VALUES ('2', '2123');
INSERT INTO sys_role_menu VALUES ('2', '2130');
INSERT INTO sys_role_menu VALUES ('2', '2140');
INSERT INTO sys_role_menu VALUES ('2', '2150');

-- remove non-job monitor menus/buttons and related role grants
DELETE FROM sys_role_menu
WHERE menu_id IN (
    SELECT t.menu_id
    FROM (
        SELECT menu_id
        FROM sys_menu
        WHERE perms IN (
            'monitor:operlog:view','monitor:operlog:list','monitor:operlog:remove','monitor:operlog:detail','monitor:operlog:clean','monitor:operlog:export',
            'monitor:logininfor:view','monitor:logininfor:list','monitor:logininfor:remove','monitor:logininfor:unlock','monitor:logininfor:export',
            'monitor:online:view','monitor:online:list','monitor:online:forceLogout','monitor:online:batchForceLogout',
            'monitor:data:view','monitor:server:view','monitor:cache:view','monitor:cache:list','monitor:cache:clear','monitor:cache:remove','monitor:cache:monitor'
        )
           OR url IN ('/monitor/operlog','/monitor/logininfor','/monitor/online','/monitor/data','/monitor/server','/monitor/cache')
           OR menu_id IN (108,109,111,112,113,500,501,1039,1040,1041,1042,1043,1044,1045,1046,1047,1048,1049)
    ) t
);

DELETE FROM sys_menu
WHERE perms IN (
        'monitor:operlog:view','monitor:operlog:list','monitor:operlog:remove','monitor:operlog:detail','monitor:operlog:clean','monitor:operlog:export',
        'monitor:logininfor:view','monitor:logininfor:list','monitor:logininfor:remove','monitor:logininfor:unlock','monitor:logininfor:export',
        'monitor:online:view','monitor:online:list','monitor:online:forceLogout','monitor:online:batchForceLogout',
        'monitor:data:view','monitor:server:view','monitor:cache:view','monitor:cache:list','monitor:cache:clear','monitor:cache:remove','monitor:cache:monitor'
   )
   OR url IN ('/monitor/operlog','/monitor/logininfor','/monitor/online','/monitor/data','/monitor/server','/monitor/cache')
   OR menu_id IN (108,109,111,112,113,500,501,1039,1040,1041,1042,1043,1044,1045,1046,1047,1048,1049);

-- remove tool chain menus/buttons (tool/*) and related role grants
DELETE FROM sys_role_menu
WHERE menu_id IN (
    SELECT t.menu_id
    FROM (
        SELECT menu_id
        FROM sys_menu
        WHERE perms LIKE 'tool:%'
           OR url LIKE '/tool/%'
           OR menu_id IN (3,114,115,116,1057,1058,1059,1060,1061)
    ) t
);

DELETE FROM sys_menu
WHERE perms LIKE 'tool:%'
   OR url LIKE '/tool/%'
   OR menu_id IN (3,114,115,116,1057,1058,1059,1060,1061);

-- remove obsolete generator tables
DROP TABLE IF EXISTS gen_table_column;
DROP TABLE IF EXISTS gen_table;
