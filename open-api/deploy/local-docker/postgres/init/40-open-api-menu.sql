-- OpenAPI menu
DELETE FROM sys_role_menu WHERE menu_id BETWEEN 2100 AND 2150;
DELETE FROM sys_menu WHERE menu_id BETWEEN 2100 AND 2150;

INSERT INTO sys_menu VALUES ('2100', 'OpenAPI绠＄悊', '1', '10', '#', '', 'M', '0', '1', '', 'fa fa-plug', 'admin', now(), '', NULL, 'OpenAPI鐩綍');
INSERT INTO sys_menu VALUES ('2101', '搴旂敤绠＄悊', '2100', '1', '/admin/open/app', '', 'C', '0', '1', 'open:app:view', '#', 'admin', now(), '', NULL, '搴旂敤绠＄悊鑿滃崟');
INSERT INTO sys_menu VALUES ('2102', '鎺ュ彛绠＄悊', '2100', '2', '/admin/open/api', '', 'C', '0', '1', 'open:api:view', '#', 'admin', now(), '', NULL, '鎺ュ彛绠＄悊鑿滃崟');
INSERT INTO sys_menu VALUES ('2103', '鎺堟潈绠＄悊', '2100', '3', '/admin/open/auth', '', 'C', '0', '1', 'open:auth:view', '#', 'admin', now(), '', NULL, '鎺堟潈绠＄悊鑿滃崟');
INSERT INTO sys_menu VALUES ('2104', '璋冪敤鏃ュ織', '2100', '4', '/admin/open/log', '', 'C', '0', '1', 'open:log:view', '#', 'admin', now(), '', NULL, '璋冪敤鏃ュ織鑿滃崟');
INSERT INTO sys_menu VALUES ('2105', '鏂囨。绠＄悊', '2100', '5', '/admin/open/doc', '', 'C', '0', '1', 'open:doc:view', '#', 'admin', now(), '', NULL, '鏂囨。绠＄悊鑿滃崟');

INSERT INTO sys_menu VALUES ('2110', '搴旂敤鏌ヨ', '2101', '1', '#', '', 'F', '0', '1', 'open:app:list', '#', 'admin', now(), '', NULL, '');
INSERT INTO sys_menu VALUES ('2111', '搴旂敤鏂板', '2101', '2', '#', '', 'F', '0', '1', 'open:app:add', '#', 'admin', now(), '', NULL, '');
INSERT INTO sys_menu VALUES ('2112', '搴旂敤淇敼', '2101', '3', '#', '', 'F', '0', '1', 'open:app:edit', '#', 'admin', now(), '', NULL, '');
INSERT INTO sys_menu VALUES ('2113', '搴旂敤鍒犻櫎', '2101', '4', '#', '', 'F', '0', '1', 'open:app:remove', '#', 'admin', now(), '', NULL, '');

INSERT INTO sys_menu VALUES ('2120', '鎺ュ彛鏌ヨ', '2102', '1', '#', '', 'F', '0', '1', 'open:api:list', '#', 'admin', now(), '', NULL, '');
INSERT INTO sys_menu VALUES ('2121', '鎺ュ彛鏂板', '2102', '2', '#', '', 'F', '0', '1', 'open:api:add', '#', 'admin', now(), '', NULL, '');
INSERT INTO sys_menu VALUES ('2122', '鎺ュ彛淇敼', '2102', '3', '#', '', 'F', '0', '1', 'open:api:edit', '#', 'admin', now(), '', NULL, '');
INSERT INTO sys_menu VALUES ('2123', '鎺ュ彛鍒犻櫎', '2102', '4', '#', '', 'F', '0', '1', 'open:api:remove', '#', 'admin', now(), '', NULL, '');

INSERT INTO sys_menu VALUES ('2130', '鎺堟潈淇濆瓨', '2103', '1', '#', '', 'F', '0', '1', 'open:auth:save', '#', 'admin', now(), '', NULL, '');
INSERT INTO sys_menu VALUES ('2140', '鏃ュ織鏌ヨ', '2104', '1', '#', '', 'F', '0', '1', 'open:log:list', '#', 'admin', now(), '', NULL, '');
INSERT INTO sys_menu VALUES ('2150', '鏂囨。鐢熸垚', '2105', '1', '#', '', 'F', '0', '1', 'open:doc:generate', '#', 'admin', now(), '', NULL, '');

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




